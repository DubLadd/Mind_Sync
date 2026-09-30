import React, { useState } from 'react';
import { X, Copy, Check, Play, FileCode, FileImage, FileAudio } from 'lucide-react';
import { FileItem } from '../types';

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
  onPlayAudioInVisualizer: (file: FileItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  onPlayAudioInVisualizer,
}) => {
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const handleCopy = () => {
    if (!file.content) return;
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = file.content ? file.content.split('\n').length : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="previewModalTitle"
    >
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-700/80 p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {file.ext}
            </span>
            <h3 id="previewModalTitle" className="font-mono font-bold text-sm text-slate-100 truncate max-w-md">
              {file.name}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              ({file.sizeFormatted})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {file.isCode && file.content && (
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-mono text-slate-300 hover:text-cyan-300 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto bg-slate-950/90 rounded-xl p-4 border border-slate-900 font-mono text-xs text-slate-200">
          {file.isCode && (
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-3">
                <span>Total Lines: {lineCount}</span>
                <span>MIME: {file.mimeType}</span>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-relaxed whitespace-pre font-mono text-cyan-200">
                <code>{file.content}</code>
              </pre>
            </div>
          )}

          {file.isImage && (
            <div className="flex flex-col items-center justify-center p-4 gap-3">
              <img
                src={file.dataUrl || ''}
                alt={file.name}
                className="max-h-[60vh] rounded-xl border border-slate-800 object-contain shadow-2xl"
              />
              <span className="text-[11px] text-slate-400 font-mono">
                {file.name} · {file.sizeFormatted}
              </span>
            </div>
          )}

          {file.isAudio && (
            <div className="flex flex-col items-center justify-center p-8 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                <FileAudio className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-mono font-bold text-sm text-slate-100">{file.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Audio format · {file.sizeFormatted}
                </p>
              </div>
              <audio controls src={file.dataUrl || ''} className="w-full max-w-md mt-2" />
              <button
                type="button"
                onClick={() => {
                  onPlayAudioInVisualizer(file);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play into Web Audio Visualizer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
