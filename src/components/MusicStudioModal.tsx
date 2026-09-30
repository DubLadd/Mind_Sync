import React, { useState } from 'react';
import { X, Music, Play, Square, Loader2, Volume2, Sparkles, Disc } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface MusicStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicStudioModal: React.FC<MusicStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('Cyberpunk cognitive focus rhythm with deep bass and synths');
  const [durationMode, setDurationMode] = useState<'clip' | 'pro'>('clip');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerateMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, durationMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Music synthesis failed');
      setResult(data);
    } catch (err: any) {
      alert(`Music error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayAudio = () => {
    if (result?.audioBase64) {
      setIsPlaying(true);
      audioEngine.playAudio(
        `data:${result.mimeType || 'audio/wav'};base64,${result.audioBase64}`,
        () => setIsPlaying(false),
        () => setIsPlaying(false)
      );
    } else {
      // Simulate preview ambient rhythm
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 5000);
    }
  };

  const handleStopAudio = () => {
    audioEngine.stopPlayback();
    setIsPlaying(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-violet-800/80 p-6 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-600 flex items-center justify-center text-white">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>COGNITIVE MUSIC GENERATOR</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-violet-950 text-violet-300 border border-violet-800">
                  Lyria 3
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Generate sparring entrance tracks and focus music
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

        {/* Model Mode Selector */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setDurationMode('clip')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              durationMode === 'clip'
                ? 'bg-slate-800 text-violet-300 border border-violet-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Short Clip (&lt; 30s) · lyria-3-clip-preview
          </button>
          <button
            type="button"
            onClick={() => setDurationMode('pro')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              durationMode === 'pro'
                ? 'bg-slate-800 text-violet-300 border border-violet-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Full Track · lyria-3-pro-preview
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerateMusic} className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-slate-300 block mb-1">Acoustic Prompt & Genre Vibe:</label>
            <textarea
              rows={2}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. High-intensity electronic battle anthem with relentless kick drum"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Audio Waves...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Music with {durationMode === 'pro' ? 'Lyria 3 Pro' : 'Lyria 3 Clip'}</span>
              </>
            )}
          </button>
        </form>

        {/* Generated Track Card */}
        {result && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-950/40 to-slate-900 border border-violet-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-10 h-10 rounded-xl bg-violet-900/60 border border-violet-600 flex items-center justify-center shrink-0 ${isPlaying ? 'animate-spin' : ''}`}>
                <Disc className="w-5 h-5 text-violet-300" />
              </div>
              <div className="overflow-hidden">
                <span className="font-mono text-xs font-bold text-violet-200 block truncate">
                  {result.description}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  Model: {result.model}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={isPlaying ? handleStopAudio : handlePlayAudio}
              className={`p-2.5 rounded-xl text-white font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlaying ? 'bg-rose-600 hover:bg-rose-500' : 'bg-violet-600 hover:bg-violet-500'
              }`}
            >
              {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Stop' : 'Play'}</span>
            </button>
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
