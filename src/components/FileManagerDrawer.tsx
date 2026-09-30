import React, { useRef } from 'react';
import {
  X,
  Upload,
  FileCode,
  FileAudio,
  FileImage,
  FileText,
  ShieldCheck,
  Play,
  Trash2,
  Eye,
  HardDrive,
} from 'lucide-react';
import { FileItem } from '../types';

interface FileManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  onUploadFiles: (fileList: FileList | File[]) => void;
  onToggleFileContext: (fileId: string) => void;
  onToggleAllContext: (selectAll: boolean) => void;
  onDeleteFile: (fileId: string) => void;
  onDeleteAllFiles: () => void;
  onPreviewFile: (file: FileItem) => void;
  onAuditCode: (file: FileItem) => void;
  onPlayAudio: (file: FileItem) => void;
  onOpenGoogleDrive?: () => void;
}

export const FileManagerDrawer: React.FC<FileManagerDrawerProps> = ({
  isOpen,
  onClose,
  files,
  onUploadFiles,
  onToggleFileContext,
  onToggleAllContext,
  onDeleteFile,
  onDeleteAllFiles,
  onPreviewFile,
  onAuditCode,
  onPlayAudio,
  onOpenGoogleDrive,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const activeCount = files.filter((f) => f.inContext).length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-cyan-400', 'bg-cyan-950/40');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-cyan-400', 'bg-cyan-950/40');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-cyan-400', 'bg-cyan-950/40');
    }
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fileManagerDrawerTitle"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg h-full glass-panel border-l border-slate-700/80 p-5 flex flex-col gap-4 shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-cyan-200">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="fileManagerDrawerTitle"
                className="font-mono font-bold text-sm text-slate-100"
              >
                Local File Manager
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                JSX, TSX, HTML, Audio, Images & Data
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

        {/* Hidden Multi-format input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jsx,.tsx,.html,.htm,.js,.ts,.py,.json,.css,.md,.txt,image/*,audio/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onUploadFiles(e.target.files);
              e.target.value = '';
            }
          }}
        />

        {/* Drop Zone */}
        <div
          ref={dropZoneRef}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-xl p-4 text-center bg-slate-900/60 hover:bg-slate-900 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-cyan-950/80 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono text-cyan-300 font-semibold block">
              Click to browse or drop project files here
            </span>
            <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
              React JSX/TSX, HTML, CSS, MP3/WAV, PNG/JPEG, JSON
            </span>
          </div>
        </div>

        {/* Google Drive Import Option */}
        {onOpenGoogleDrive && (
          <button
            type="button"
            onClick={onOpenGoogleDrive}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-950/70 to-cyan-950/70 hover:from-emerald-900/80 hover:to-cyan-900/80 border border-emerald-700/60 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Import from Google Drive</span>
            </div>
            <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-200">
              Browse Drive →
            </span>
          </button>
        )}

        {/* Action Header */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-1.5">
          <span>
            {files.length} loaded · {activeCount} active in context
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleAllContext(activeCount < files.length)}
              className="hover:text-cyan-300 transition-colors"
            >
              {activeCount < files.length ? 'Select All' : 'Deselect'}
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onDeleteAllFiles}
              className="hover:text-rose-400 transition-colors"
            >
              Delete All
            </button>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {files.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-2">
              <FileCode className="w-8 h-8 opacity-40" />
              <span>No files loaded in this session</span>
            </div>
          ) : (
            files.map((file) => {
              let badgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-800';
              let Icon = FileCode;
              if (file.isAudio) {
                badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                Icon = FileAudio;
              } else if (file.isImage) {
                badgeColor = 'bg-violet-950 text-violet-300 border-violet-800';
                Icon = FileImage;
              } else if (file.category === 'text') {
                Icon = FileText;
              }

              return (
                <div
                  key={file.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    file.inContext
                      ? 'bg-slate-900/90 border-cyan-800/80 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/80 opacity-70'
                  }`}
                >
                  <div
                    onClick={() => onPreviewFile(file)}
                    className="flex items-center gap-2.5 overflow-hidden flex-1 cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-mono font-medium text-slate-100">
                          {file.name}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${badgeColor}`}>
                          {file.ext}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {file.sizeFormatted} · {file.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => onPreviewFile(file)}
                      title="Inspect content"
                      className="p-1.5 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Audio Play button */}
                    {file.isAudio && (
                      <button
                        type="button"
                        onClick={() => onPlayAudio(file)}
                        title="Play in Spectrum Visualizer"
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded hover:bg-emerald-950/60 border border-emerald-800/60 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-emerald-400" />
                      </button>
                    )}

                    {/* Code Audit Button */}
                    {file.isCode && (
                      <button
                        type="button"
                        onClick={() => onAuditCode(file)}
                        title="Deep AST & Security Audit via Gemini"
                        className="px-2 py-1 text-cyan-300 hover:text-white rounded bg-slate-800/90 hover:bg-cyan-900/60 border border-slate-700/60 flex items-center gap-1 text-[10px] font-mono transition-colors"
                      >
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        <span className="hidden sm:inline">Audit</span>
                      </button>
                    )}

                    {/* Active In Context Checkbox */}
                    <label
                      className="flex items-center gap-1 cursor-pointer text-[10px] font-mono hover:text-cyan-300 px-1"
                      title="Include file in active sparring prompt"
                    >
                      <input
                        type="checkbox"
                        checked={file.inContext}
                        onChange={() => onToggleFileContext(file.id)}
                        className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                      />
                      <span className="hidden sm:inline">Active</span>
                    </label>

                    {/* Delete File */}
                    <button
                      type="button"
                      onClick={() => onDeleteFile(file.id)}
                      title="Remove file"
                      className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Active files auto-ingested into sparring prompts</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
