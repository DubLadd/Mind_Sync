import React, { useState } from 'react';
import { FolderCode, Settings, Trash2, Mic, Sparkles, User as UserIcon, LogOut, Share2, History, Plus, HardDrive } from 'lucide-react';
import { PERSONA_PRESETS } from '../utils/personas';
import { User, CustomPersona } from '../types';
import { ShortcutsTooltip } from './ShortcutsTooltip';

interface TopBarProps {
  activePersonaId: string;
  onSelectPersona: (id: string) => void;
  customPersonas?: CustomPersona[];
  onOpenCustomPersonaModal?: () => void;
  onOpenSessionsHistory?: () => void;
  onOpenGoogleDrive?: () => void;
  activeView?: 'spar' | 'code';
  onSelectView?: (view: 'spar' | 'code') => void;
  onOpenFiles: () => void;
  onOpenSettings: () => void;
  onClearChat: () => void;
  activeFileCount: number;
  totalFileCount: number;
  voiceName: string;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenShareMilestone: () => void;
  onFocusInput: () => void;
  onToggleMic: () => void;
  onExport: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activePersonaId,
  onSelectPersona,
  customPersonas = [],
  onOpenCustomPersonaModal,
  onOpenSessionsHistory,
  onOpenGoogleDrive,
  activeView = 'spar',
  onSelectView,
  onOpenFiles,
  onOpenSettings,
  onClearChat,
  activeFileCount,
  voiceName,
  user,
  onOpenAuth,
  onLogout,
  onOpenShareMilestone,
  onFocusInput,
  onToggleMic,
  onExport,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="glass-panel shrink-0 border-b border-slate-800 px-4 py-3 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-500 p-[1px] shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <a
            href="/"
            className="text-base sm:text-lg font-mono font-bold tracking-tight text-slate-100 hover:text-white transition-colors"
          >
            MIND_SYNC
          </a>

          {/* Primary View Toggle: Sparring vs Dev Studio */}
          {onSelectView && (
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono ml-1 sm:ml-3">
              <button
                type="button"
                onClick={() => onSelectView('spar')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeView === 'spar'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-800/60'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sparring
              </button>
              <button
                type="button"
                onClick={() => onSelectView('code')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'code'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-800/60'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Code Studio</span>
              </button>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Persona Switcher (Segmented Controls + Custom Personas) */}
        <nav
          className="hidden lg:flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 max-w-[480px] overflow-x-auto"
          aria-label="Sparring Modes"
        >
          {Object.values(PERSONA_PRESETS).map((p) => {
            const isActive = activePersonaId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPersona(p.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {p.name}
              </button>
            );
          })}

          {/* User's Custom Personas */}
          {customPersonas.map((cp) => {
            const isActive = activePersonaId === cp.id;
            return (
              <button
                key={cp.id}
                type="button"
                onClick={() => onSelectPersona(cp.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-emerald-300 shadow-sm border border-emerald-800/60'
                    : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/40'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{cp.name}</span>
              </button>
            );
          })}

          {/* Create Custom Persona Button */}
          {onOpenCustomPersonaModal && (
            <button
              type="button"
              onClick={onOpenCustomPersonaModal}
              title="Create a new Custom Persona with System Prompt & Voice"
              className="px-2 py-1.5 rounded-lg text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/60 transition-colors flex items-center gap-1 cursor-pointer ml-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Previous Sessions Drawer Button */}
          {onOpenSessionsHistory && (
            <button
              type="button"
              onClick={onOpenSessionsHistory}
              title="View and resume previous sparring sessions from Firestore"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 border border-slate-700/80 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Sessions</span>
            </button>
          )}

          {/* Shortcuts Tooltip */}
          <ShortcutsTooltip
            onFocusInput={onFocusInput}
            onToggleMic={onToggleMic}
            onExport={onExport}
          />

          {/* Social Share Milestone */}
          <button
            type="button"
            onClick={onOpenShareMilestone}
            title="Broadcast Sparring Milestone to Social Media"
            className="p-2 sm:px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 border border-slate-700/80 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">Share</span>
          </button>

          {/* Active Voice Persona Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <Mic className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Voice: {voiceName}</span>
          </div>

          {/* Google Drive Workspace Button */}
          {onOpenGoogleDrive && (
            <button
              type="button"
              onClick={onOpenGoogleDrive}
              title="Google Drive: Browse, Import, and Save Files"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 border border-slate-700/80 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Drive</span>
            </button>
          )}

          {/* Files Manager Button */}
          <button
            type="button"
            onClick={onOpenFiles}
            title="Open Local File Manager (JSX, TSX, Audio, Images)"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          >
            <FolderCode className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Files</span>
            {activeFileCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] tabular-nums font-bold">
                {activeFileCount}
              </span>
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            title="Configure Persona and Speech"
            className="p-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span className="hidden sm:inline">Config</span>
          </button>

          {/* User Account / Auth Menu */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/80 text-cyan-200 flex items-center gap-1.5 text-xs font-mono transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline font-semibold truncate max-w-[80px]">
                  {user.name}
                </span>
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl border border-cyan-800/80 shadow-2xl p-3 z-50 text-xs font-mono space-y-2">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="font-bold text-slate-100 block truncate">{user.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{user.email}</span>
                      <span className="text-[9px] text-emerald-400 block mt-1">● Account Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Clear Session */}
          <button
            type="button"
            onClick={onClearChat}
            title="Reset Sparring Session"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700/80 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
