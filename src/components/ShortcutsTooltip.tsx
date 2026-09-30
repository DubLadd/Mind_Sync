import React, { useState } from 'react';
import { Keyboard, X, Command } from 'lucide-react';

interface ShortcutsTooltipProps {
  onFocusInput: () => void;
  onToggleMic: () => void;
  onExport: () => void;
}

export const ShortcutsTooltip: React.FC<ShortcutsTooltipProps> = ({
  onFocusInput,
  onToggleMic,
  onExport,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl+';

  const shortcuts = [
    { key: `${modKey}K`, label: 'Focus Chat Input', action: onFocusInput },
    { key: `${modKey}M`, label: 'Toggle Microphone STT', action: onToggleMic },
    { key: `${modKey}E`, label: 'Export Session Dossier', action: onExport },
    { key: 'Enter', label: 'Send Prompt to Sparring Mirror' },
    { key: 'Esc', label: 'Close Active Modals / Drawers' },
  ];

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Keyboard Shortcuts & Hotkeys"
        className="p-1.5 sm:px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-mono"
      >
        <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Shortcuts</span>
      </button>

      {/* Popover Tooltip */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute bottom-full mb-2 right-0 sm:right-auto sm:left-0 z-50 w-72 glass-panel p-3.5 rounded-xl border border-cyan-800/80 shadow-2xl space-y-2.5 text-xs font-mono"
            role="tooltip"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-slate-100 font-bold">
                <Command className="w-3.5 h-3.5 text-cyan-400" />
                <span>HOTKEYS & SHORTCUTS</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {shortcuts.map((sc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (sc.action) {
                      sc.action();
                      setIsOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between p-1.5 rounded-lg ${
                    sc.action ? 'hover:bg-slate-800/80 cursor-pointer' : ''
                  }`}
                >
                  <span className="text-slate-300 text-[11px]">{sc.label}</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-[10px] tabular-nums">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-500 text-center">
              Active globally across workspace
            </div>
          </div>
        </>
      )}
    </div>
  );
};
