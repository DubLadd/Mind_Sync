import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, Loader2, Radio } from 'lucide-react';
import { audioEngine, fallbackBrowserSpeech } from '../utils/audio';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceName: string;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  voiceName,
}) => {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [modelReply, setModelReply] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [history, setHistory] = useState<Array<{ role: string; text: string }>>([]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      handleStopLive();
    }
  }, [isOpen]);

  const handleStartLive = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      await audioEngine.startMicStream();
    } catch (e) {
      console.warn('Mic stream warning:', e);
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsLiveActive(true);
      setStatus('listening');
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        setLiveTranscript(interim);
      }
      if (final) {
        setLiveTranscript(final);
        sendLiveUtterance(final);
      }
    };

    recognition.onerror = (e: any) => {
      console.warn('Live speech recognition error:', e);
      setStatus('idle');
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleStopLive = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    audioEngine.stopMicStream();
    audioEngine.stopPlayback();
    setIsLiveActive(false);
    setStatus('idle');
  };

  const sendLiveUtterance = async (transcript: string) => {
    if (!transcript.trim()) return;

    setStatus('thinking');
    const newHistory = [...history, { role: 'user', text: transcript }];
    setHistory(newHistory);

    try {
      const res = await fetch('/api/live-spar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTranscript: transcript,
          conversationHistory: newHistory.slice(-6),
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'State your thesis with clearer precision.';
      setModelReply(reply);
      setHistory((prev) => [...prev, { role: 'model', text: reply }]);
      setStatus('speaking');

      // Synthesize audio
      try {
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: reply, voiceName }),
        });
        const ttsData = await ttsRes.json();
        if (ttsData.audioBase64) {
          audioEngine.playAudio(
            `data:${ttsData.mimeType || 'audio/wav'};base64,${ttsData.audioBase64}`,
            () => setStatus(isLiveActive ? 'listening' : 'idle'),
            () => setStatus(isLiveActive ? 'listening' : 'idle')
          );
        } else {
          fallbackBrowserSpeech(reply, 'en-US', () => setStatus(isLiveActive ? 'listening' : 'idle'));
        }
      } catch (ttsErr) {
        fallbackBrowserSpeech(reply, 'en-US', () => setStatus(isLiveActive ? 'listening' : 'idle'));
      }
    } catch (err: any) {
      console.error('Live sparring communication error:', err);
      setStatus(isLiveActive ? 'listening' : 'idle');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-cyan-800/80 p-6 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>GEMINI 3.8 LIVE VOICE CONVERSATION</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Live API
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Continuous spoken dialectic with real-time acoustic response
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Visualizer Orb */}
        <div className="h-44 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
              status === 'listening'
                ? 'bg-rose-500/20 border-2 border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.4)] scale-110'
                : status === 'speaking'
                ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-105'
                : status === 'thinking'
                ? 'bg-indigo-500/20 border-2 border-indigo-400 shadow-[0_0_35px_rgba(99,102,241,0.4)] animate-spin'
                : 'bg-slate-800/40 border border-slate-700'
            }`}
          >
            {status === 'thinking' ? (
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            ) : status === 'speaking' ? (
              <Volume2 className="w-8 h-8 text-cyan-400 animate-bounce" />
            ) : isLiveActive ? (
              <Mic className="w-8 h-8 text-rose-400 animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8 text-slate-500" />
            )}
          </div>

          <div className="mt-4 text-xs font-mono font-bold tracking-widest text-slate-300">
            {status === 'listening' && '● LISTENING (SPEAK NOW)'}
            {status === 'thinking' && '● LIVE API SYNTHESIZING REBUTTAL...'}
            {status === 'speaking' && `● VOCALIZING VIA ${voiceName.toUpperCase()}`}
            {status === 'idle' && 'OFFLINE · TAP START LIVE CONVERSATION'}
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 max-h-36 overflow-y-auto space-y-2 text-xs font-mono">
          {liveTranscript && (
            <div className="text-slate-300">
              <span className="text-rose-400 font-bold">You:</span> {liveTranscript}
            </div>
          )}
          {modelReply && (
            <div className="text-cyan-200">
              <span className="text-cyan-400 font-bold">Live AI:</span> {modelReply}
            </div>
          )}
          {!liveTranscript && !modelReply && (
            <div className="text-slate-500 italic text-center py-2">
              Spoken conversation transcripts will stream here in real time...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={isLiveActive ? handleStopLive : handleStartLive}
            className={`flex-1 py-3 rounded-xl font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              isLiveActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white'
            }`}
          >
            {isLiveActive ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Disconnect Live Voice</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Live Conversation (gemini-3.8-live)</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
