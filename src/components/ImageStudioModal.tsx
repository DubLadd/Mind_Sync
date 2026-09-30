import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles, Upload, Loader2, Download, RefreshCw } from 'lucide-react';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('Futuristic cognitive sparring arena with glowing holographic data streams');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

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

  const handleGenerateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      let inputImageBase64: string | undefined;
      if (imagePreview) {
        inputImageBase64 = imagePreview.split(',')[1];
      }

      const res = await fetch('/api/images/generate-or-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          inputImageBase64,
          mimeType: imageFile?.type || 'image/png',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image generation failed');
      setGeneratedImageUrl(data.dataUrl);
    } catch (err: any) {
      alert(`Image generation error: ${err.message}`);
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
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-emerald-800/80 p-6 flex flex-col gap-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center text-white">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>CREATE & EDIT IMAGES</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                  gemini-3.1-flash-image-preview
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Generate new visuals or edit existing images with text prompts
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

        {/* Form */}
        <form onSubmit={handleGenerateOrEdit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-slate-300 block mb-1">
              {imagePreview ? 'Editing Instructions:' : 'Image Creation Prompt:'}
            </label>
            <textarea
              rows={2}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Add glowing circuit overlays or describe the scene to create..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none text-xs"
            />
          </div>

          {/* Optional Image Upload to Edit */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 block">
                Optional: Upload photo to EDIT
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
                  Remove upload
                </button>
              )}
            </div>

            <label className="w-full border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-slate-900/60 transition-colors">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 text-xs">
                {imageFile ? imageFile.name : 'Select JPG/PNG to edit with Gemini'}
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
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing with gemini-3.1-flash-image-preview...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{imagePreview ? 'Edit Uploaded Image' : 'Create New Image'}</span>
              </>
            )}
          </button>
        </form>

        {/* Generated Image Preview Card */}
        {generatedImageUrl && (
          <div className="p-3 rounded-xl bg-slate-900 border border-emerald-700 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-300">
                GENERATED ARTIFACT:
              </span>
              <a
                href={generatedImageUrl}
                download="gemini-image.png"
                className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 hover:text-white flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-56">
              <img
                src={generatedImageUrl}
                alt="Generated by gemini-3.1-flash-image-preview"
                className="max-h-56 w-auto object-contain"
              />
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
