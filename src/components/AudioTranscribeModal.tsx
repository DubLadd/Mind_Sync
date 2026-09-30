import React, { useState, useRef } from 'react';
import { X, Mic, Square, Loader2, Copy, Check, ArrowRight, FileAudio } from 'lucide-react';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat: (text: string) => void;
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  onInsertToChat,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Convert blob to base64 and transcribe with gemini-3.5-transcribe
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          await runGeminiTranscribe(base64Data, 'audio/webm');
        };
        reader.readAsDataURL(audioBlob);

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript('');
    } catch (e: any) {
      alert(`Microphone access error: ${e.message}`);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const runGeminiTranscribe = async (base64Audio: string, mimeType: string) => {
    setIsTranscribing(true);
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: base64Audio, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to transcribe');
      setTranscript(data.text || 'No speech detected.');
    } catch (err: any) {
      setTranscript(`Transcription failed: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyToChat = () => {
    if (transcript) {
      onInsertToChat(transcript);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-cyan-800/80 p-6 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white">
              <FileAudio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>AUDIO SPEECH TRANSCRIPTION</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                  gemini-3.5-transcribe
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Capture microphone audio and transcribe with Gemini
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

        {/* Record Control Area */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-7 h-7" />}
          </button>
          <span className="text-xs font-mono font-bold text-slate-200">
            {isRecording ? 'RECORDING... (TAP TO FINISH)' : 'TAP TO RECORD AUDIO'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Powered by model: <code className="text-cyan-400">gemini-3.5-transcribe</code>
          </span>
        </div>

        {/* Loading Spinner */}
        {isTranscribing && (
          <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center gap-2 text-xs font-mono text-cyan-200">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Transcribing audio through Gemini 3.5 Transcribe...</span>
          </div>
        )}

        {/* Result Area */}
        {transcript && (
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-300">
              GENERATED TRANSCRIPTION:
            </label>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 font-mono leading-relaxed max-h-44 overflow-y-auto">
              {transcript}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                type="button"
                onClick={handleApplyToChat}
                className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Send to Sparring Mirror</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
