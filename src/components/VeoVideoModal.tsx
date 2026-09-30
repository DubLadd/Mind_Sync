import React, { useState } from 'react';
import { X, Film, Sparkles, Upload, Loader2, Video, CheckCircle2 } from 'lucide-react';

interface VeoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VeoVideoModal: React.FC<VeoVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('Cinematic camera dolly through a neural network core with glowing light strands');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [responseMsg, setResponseMsg] = useState<any>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !imagePreview) return;

    setIsGenerating(true);
    setResponseMsg(null);

    try {
      let inputImageBase64: string | undefined;
      if (imagePreview) {
        inputImageBase64 = imagePreview.split(',')[1];
      }

      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          inputImageBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video generation failed');
      setResponseMsg(data);
    } catch (err: any) {
      alert(`Veo 3 generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-amber-800/80 p-6 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>VEO 3 VIDEO GENERATOR</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                  veo-3.1-fast-generate-preview
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Generate video from text or animate photos into motion
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

        {/* Aspect Ratio Selector (Mandatory 16:9 or 9:16) */}
        <div>
          <label className="text-slate-300 block mb-1 text-xs font-mono">
            ASPECT RATIO (MANDATORY VEO 3 FORMAT):
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setAspectRatio('16:9')}
              className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                aspectRatio === '16:9'
                  ? 'bg-slate-800 text-amber-300 border-amber-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-6 h-3.5 border border-current rounded-sm" />
              <span>16:9 Landscape</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('9:16')}
              className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all ${
                aspectRatio === '9:16'
                  ? 'bg-slate-800 text-amber-300 border-amber-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="w-3.5 h-6 border border-current rounded-sm" />
              <span>9:16 Portrait (Shorts)</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerateVideo} className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-slate-300 block mb-1">
              Video Description & Motion Dynamics:
            </label>
            <textarea
              rows={2}
              required={!imagePreview}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe motion, camera movement, and aesthetic..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none text-xs"
            />
          </div>

          {/* Animate Uploaded Image into Video */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 block">
                Optional: Upload photo to ANIMATE into Video
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="text-rose-400 hover:underline text-[10px]"
                >
                  Remove photo
                </button>
              )}
            </div>

            <label className="w-full border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-slate-900/60 transition-colors">
              <Upload className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 text-xs">
                {imageFile ? imageFile.name : 'Select JPG/PNG photo to animate with Veo'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Invoking veo-3.1-fast-generate-preview...</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>
                  {imagePreview ? 'Animate Photo into Video' : 'Generate Video from Text'} ({aspectRatio})
                </span>
              </>
            )}
          </button>
        </form>

        {/* Confirmation Banner */}
        {responseMsg && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-700 text-amber-200 text-xs font-mono flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>{responseMsg.message || 'Veo Video Task Initialized'}</span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between">
              <span>Model: <code className="text-amber-400">{responseMsg.model}</code></span>
              <span>Aspect: <code className="text-amber-400">{responseMsg.aspectRatio}</code></span>
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
