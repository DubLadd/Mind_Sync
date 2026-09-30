import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Search,
  Download,
  Upload,
  ExternalLink,
  Trash2,
  FileCode,
  FileText,
  FileAudio,
  FileImage,
  File as FileGeneric,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Plus,
  ShieldAlert,
} from 'lucide-react';
import {
  GoogleDriveFile,
  listDriveFiles,
  fetchDriveFileContent,
  uploadFileToDrive,
  deleteFileFromDrive,
  ensureDriveAccessToken,
} from '../utils/googleDrive';
import { FileItem, User } from '../types';
import { getCachedAccessToken } from '../firebase';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onImportFile: (file: FileItem) => void;
  currentExportContent?: {
    name: string;
    content: string;
    mimeType: string;
  };
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  user,
  onImportFile,
  currentExportContent,
}) => {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [importingFileId, setImportingFileId] = useState<string | null>(null);

  // Export State
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportFilename, setExportFilename] = useState<string>(
    currentExportContent?.name || `mind-sync-spar-${Date.now()}.md`
  );

  // Destructive Confirmation Dialog State (MANDATORY per Workspace Skill)
  const [pendingDeleteFile, setPendingDeleteFile] = useState<GoogleDriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const hasToken = Boolean(getCachedAccessToken());

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      if (currentExportContent) {
        setExportFilename(currentExportContent.name);
      }
      handleFetchFiles();
    }
  }, [isOpen]);

  const handleFetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const driveFiles = await listDriveFiles(searchQuery);
      setFiles(driveFiles);
    } catch (err: any) {
      console.warn('Drive list warning:', err);
      setError(err?.message || 'Could not load Google Drive files.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await ensureDriveAccessToken();
      await handleFetchFiles();
    } catch (err: any) {
      setError(err?.message || 'Authentication with Google Drive failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportToContext = async (driveFile: GoogleDriveFile) => {
    setImportingFileId(driveFile.id);
    setError(null);

    try {
      const { content, isBinary, dataUrl } = await fetchDriveFileContent(
        driveFile.id,
        driveFile.mimeType
      );

      const ext = driveFile.name.split('.').pop()?.toUpperCase() || 'DRIVE';
      const isCode =
        ['JSX', 'TSX', 'HTML', 'HTM', 'JS', 'TS', 'PY', 'JSON', 'CSS', 'MD', 'TXT', 'SQL', 'YAML'].includes(
          ext
        ) || driveFile.mimeType.includes('text') || driveFile.mimeType.includes('json');

      const isAudio = driveFile.mimeType.startsWith('audio/');
      const isImage = driveFile.mimeType.startsWith('image/');

      const fileItem: FileItem = {
        id: `drive_${driveFile.id}`,
        name: driveFile.name,
        ext,
        size: Number(driveFile.size) || content.length,
        sizeFormatted: `${((Number(driveFile.size) || content.length) / 1024).toFixed(1)} KB`,
        mimeType: driveFile.mimeType,
        category: isCode ? 'code' : isAudio ? 'audio' : isImage ? 'image' : 'other',
        isCode,
        isAudio,
        isImage,
        inContext: true,
        content: content || undefined,
        dataUrl: dataUrl || undefined,
      };

      onImportFile(fileItem);
      setSuccessMsg(`Imported "${driveFile.name}" into Sparring Context!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(`Failed to import "${driveFile.name}": ${err.message}`);
    } finally {
      setImportingFileId(null);
    }
  };

  const handleUploadCurrentContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExportContent || !exportFilename.trim()) return;

    setIsExporting(true);
    setError(null);
    try {
      const created = await uploadFileToDrive(
        exportFilename.trim(),
        currentExportContent.content,
        currentExportContent.mimeType || 'text/plain'
      );
      setSuccessMsg(`Successfully saved "${created.name}" to your Google Drive!`);
      handleFetchFiles();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload to Google Drive.');
    } finally {
      setIsExporting(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!pendingDeleteFile) return;
    setIsDeleting(true);
    try {
      await deleteFileFromDrive(pendingDeleteFile.id);
      setFiles((prev) => prev.filter((f) => f.id !== pendingDeleteFile.id));
      setSuccessMsg(`Deleted "${pendingDeleteFile.name}" from Google Drive.`);
      setPendingDeleteFile(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete file from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-cyan-800/80 p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-600 to-indigo-600 p-[1px] shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>GOOGLE DRIVE WORKSPACE</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                  OAuth Connected
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Browse, import files into context, and export sparring dossiers to Drive
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

        {/* Notifications */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-mono flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleConnect}
              className="px-3 py-1 rounded bg-rose-900 hover:bg-rose-800 text-white text-[11px] font-bold"
            >
              Re-Authenticate
            </button>
          </div>
        )}

        {/* Export to Google Drive Section (if export content available) */}
        {currentExportContent && (
          <form
            onSubmit={handleUploadCurrentContent}
            className="bg-slate-900/90 p-3 rounded-xl border border-cyan-900/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
          >
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex-1">
                <span className="text-slate-400 block text-[10px]">SAVE TO GOOGLE DRIVE:</span>
                <input
                  type="text"
                  value={exportFilename}
                  onChange={(e) => setExportFilename(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs mt-0.5"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to Drive...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload to Drive</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Search & Refresh Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchFiles()}
              placeholder="Search files in Google Drive..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          <button
            type="button"
            onClick={handleFetchFiles}
            disabled={isLoading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Search</span>
          </button>
        </div>

        {/* Drive Files Table / List */}
        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1">
          {isLoading && files.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
              <span>Accessing Google Drive...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-2">
              <HardDrive className="w-8 h-8 text-slate-600" />
              <span>No files retrieved from Google Drive.</span>
              <button
                type="button"
                onClick={handleConnect}
                className="mt-2 px-4 py-2 rounded-xl bg-cyan-900 hover:bg-cyan-800 text-cyan-200 text-xs font-bold"
              >
                Sign In with Google to Load Drive
              </button>
            </div>
          ) : (
            files.map((file) => {
              const isImporting = importingFileId === file.id;
              const isDoc = file.mimeType.includes('document');
              const isSheet = file.mimeType.includes('spreadsheet');
              const isImage = file.mimeType.startsWith('image/');
              const isAudio = file.mimeType.startsWith('audio/');
              const isCode =
                file.name.endsWith('.ts') ||
                file.name.endsWith('.tsx') ||
                file.name.endsWith('.js') ||
                file.name.endsWith('.jsx') ||
                file.name.endsWith('.html') ||
                file.name.endsWith('.json') ||
                file.name.endsWith('.md');

              const Icon = isCode
                ? FileCode
                : isDoc
                ? FileText
                : isImage
                ? FileImage
                : isAudio
                ? FileAudio
                : FileGeneric;

              return (
                <div
                  key={file.id}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-200 truncate group-hover:text-cyan-300">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="truncate max-w-[200px]">{file.mimeType}</span>
                        {file.modifiedTime && (
                          <span>· {new Date(file.modifiedTime).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* External Link */}
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {/* Import Button */}
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() => handleImportToContext(file)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 hover:border-cyan-600 text-cyan-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Load this file into the active sparring context"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Import to Spar</span>
                        </>
                      )}
                    </button>

                    {/* Delete with Confirmation Dialog (MANDATORY per Workspace Skill) */}
                    <button
                      type="button"
                      onClick={() => setPendingDeleteFile(file)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete file from Google Drive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Destructive Operation Confirmation Dialog (MANDATORY per Workspace Skill) */}
        {pendingDeleteFile && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="glass-panel w-full max-w-md rounded-2xl border border-rose-800/80 p-6 flex flex-col gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-sm text-slate-100">
                    Confirm File Deletion
                  </h3>
                  <p className="text-xs text-rose-300 font-mono">
                    This action will permanently remove the file from your Google Drive.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="text-slate-400">Target File:</div>
                <div className="font-bold text-slate-200 mt-1 break-all">
                  {pendingDeleteFile.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  ID: {pendingDeleteFile.id}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 font-mono text-xs">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setPendingDeleteFile(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteFile}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
