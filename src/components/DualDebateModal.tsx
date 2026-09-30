import React, { useState } from 'react';
import { X, Users2, Play, Square, Loader2, Sparkles } from 'lucide-react';
import { DebateTurn } from '../types';
import { audioEngine } from '../utils/audio';

interface DualDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic: string;
}

export const DualDebateModal: React.FC<DualDebateModalProps> = ({
  isOpen,
  onClose,
  defaultTopic,
}) => {
  const [topic, setTopic] = useState(defaultTopic || 'Artificial General Intelligence Governance & Alignment');
  const [transcript, setTranscript] = useState<DebateTurn[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'Fenrir' | 'Aoede' | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartDebate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    setTranscript([]);
    setAudioUrl(null);
    audioEngine.stopPlayback();

    try {
      const res = await fetch('/api/dual-debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setTranscript(data.transcript || []);

      if (data.audioBase64) {
        const wavUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        setAudioUrl(wavUrl);
        setIsPlaying(true);
        setActiveSpeaker('Fenrir');

        audioEngine.playAudio(
          wavUrl,
          () => {
            setIsPlaying(false);
            setActiveSpeaker(null);
          },
          (err) => {
            console.warn('Debate audio error:', err);
            setIsPlaying(false);
            setActiveSpeaker(null);
          }
        );
      }
    } catch (err: any) {
      console.error('Debate error:', err);
      setError(err?.message || 'Failed to conduct dual debate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAudio = () => {
    audioEngine.stopPlayback();
    setIsPlaying(false);
    setActiveSpeaker(null);
  };

  const handleReplay = () => {
    if (!audioUrl) return;
    setIsPlaying(true);
    setActiveSpeaker('Fenrir');
    audioEngine.playAudio(
      audioUrl,
      () => {
        setIsPlaying(false);
        setActiveSpeaker(null);
      },
      () => {
        setIsPlaying(false);
        setActiveSpeaker(null);
      }
    );
  };

  const handleClose = () => {
    handleStopAudio();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dualDebateTitle"
    >
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-violet-800/80 p-5 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-violet-200">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="dualDebateTitle" className="font-mono font-bold text-sm text-slate-100">
                Dual-Speaker Sparring Arena
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Gemini 3.8 Flash TTS · Multi-Speaker Neural Dialogue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Input Field */}
        <div className="space-y-1.5">
          <label htmlFor="debateTopic" className="text-xs font-mono text-slate-300 block">
            Sparring Topic or Controversial Proposition:
          </label>
          <div className="flex items-center gap-2">
            <input
              id="debateTopic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Microservices vs Monoliths, Free Will vs Determinism..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 text-xs font-mono focus:outline-none focus:border-violet-500"
            />
            <button
              type="button"
              disabled={isLoading || !topic.trim()}
              onClick={handleStartDebate}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Debate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Speakers Status Card */}
        <div className="flex items-center justify-around py-3 px-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div
            className={`flex items-center gap-2.5 transition-all ${
              activeSpeaker === 'Fenrir' ? 'opacity-100 scale-105' : 'opacity-60'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-rose-950 border border-rose-600 text-rose-300 font-mono text-xs font-bold flex items-center justify-center">
              FE
            </div>
            <div className="text-left font-mono">
              <span className="text-xs font-bold text-slate-100 block">Fenrir</span>
              <span className="text-[10px] text-rose-400">High-Friction Skeptic</span>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-500 font-bold px-2">VS</span>

          <div
            className={`flex items-center gap-2.5 transition-all ${
              activeSpeaker === 'Aoede' ? 'opacity-100 scale-105' : 'opacity-60'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-600 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center">
              AO
            </div>
            <div className="text-left font-mono">
              <span className="text-xs font-bold text-slate-100 block">Aoede</span>
              <span className="text-[10px] text-cyan-400">Pragmatic Architect</span>
            </div>
          </div>
        </div>

        {/* Dialogue Transcript Area */}
        <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-slate-950/90 rounded-xl border border-slate-900 font-sans text-xs">
          {error && <div className="text-rose-400 font-mono text-center py-2">{error}</div>}

          {transcript.length === 0 && !error && !isLoading && (
            <div className="text-slate-500 font-mono text-center py-8 text-[11px]">
              Enter a topic and tap Start Debate to generate adversarial dialogue and multi-speaker neural audio.
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-violet-300 font-mono text-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Drafting dialogue & orchestrating dual voice personas...</span>
            </div>
          )}

          {transcript.map((turn, idx) => {
            const isFenrir = turn.speaker.toLowerCase().includes('fenrir');
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${
                  isFenrir
                    ? 'bg-rose-950/30 border-rose-900/60 text-rose-100'
                    : 'bg-cyan-950/30 border-cyan-900/60 text-cyan-100'
                }`}
              >
                <div className="font-mono font-bold text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span className={isFenrir ? 'text-rose-400' : 'text-cyan-400'}>
                    {turn.speaker}
                  </span>
                  <span className="text-slate-500 font-normal">
                    {isFenrir ? '· Skeptic Counter' : '· Architectural Synthesis'}
                  </span>
                </div>
                <p>{turn.text}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono">
          <span className="text-slate-400">
            {isPlaying ? 'Playing into Web Audio visualizer' : 'Audio engine idle'}
          </span>
          <div className="flex items-center gap-2">
            {audioUrl && !isPlaying && (
              <button
                type="button"
                onClick={handleReplay}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 font-mono text-xs"
              >
                <Play className="w-3 h-3 fill-slate-200" />
                <span>Replay</span>
              </button>
            )}

            {isPlaying && (
              <button
                type="button"
                onClick={handleStopAudio}
                className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700 flex items-center gap-1 font-mono text-xs"
              >
                <Square className="w-3 h-3 fill-rose-200" />
                <span>Stop</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
