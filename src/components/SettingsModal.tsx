import React from 'react';
import { X, Settings, RotateCcw, Volume2, Languages, Cpu } from 'lucide-react';
import { PersonaConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sttLang: string;
  onChangeSttLang: (lang: string) => void;
  voiceName: string;
  onChangeVoiceName: (voice: any) => void;
  customPrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
  onResetPromptToDefault: () => void;
  activePersona: PersonaConfig;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sttLang,
  onChangeSttLang,
  voiceName,
  onChangeVoiceName,
  customPrompt,
  onChangeCustomPrompt,
  onResetPromptToDefault,
  activePersona,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settingsModalTitle"
    >
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 p-6 flex flex-col gap-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 id="settingsModalTitle" className="font-mono font-bold text-base text-slate-100">
              Agent & Speech Configuration
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 text-xs font-sans">
          {/* Active Persona Banner */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-mono text-xs font-bold text-slate-200">
                  {activePersona.name}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {activePersona.badge}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Server-Side GenAI
            </span>
          </div>

          {/* STT Language Selector */}
          <div className="space-y-1.5">
            <label htmlFor="sttLangSelect" className="font-mono text-slate-200 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>Speech-to-Text Language</span>
            </label>
            <select
              id="sttLangSelect"
              value={sttLang}
              onChange={(e) => onChangeSttLang(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs cursor-pointer"
            >
              <option value="en-US">English (United States)</option>
              <option value="en-GB">English (United Kingdom)</option>
              <option value="es-ES">Spanish (Spain)</option>
              <option value="de-DE">German (Germany)</option>
              <option value="fr-FR">French (France)</option>
              <option value="tr-TR">Turkish (Türkiye)</option>
              <option value="ja-JP">Japanese (Japan)</option>
            </select>
          </div>

          {/* Gemini Neural Voice Selector */}
          <div className="space-y-1.5">
            <label htmlFor="voiceSelect" className="font-mono text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gemini Neural Voice Persona</span>
            </label>
            <select
              id="voiceSelect"
              value={voiceName}
              onChange={(e) => onChangeVoiceName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs cursor-pointer"
            >
              <option value="Fenrir">Fenrir (Excitable, Deep, Dynamic)</option>
              <option value="Zephyr">Zephyr (Bright, Fast, Razor Sharp)</option>
              <option value="Puck">Puck (Upbeat, Witty, Conversational)</option>
              <option value="Kore">Kore (Firm, Grounded, Analytical)</option>
              <option value="Aoede">Aoede (Breezy, Natural, Pragmatic)</option>
              <option value="Charon">Charon (Informative, Deep, Strategic)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Powered by gemini-3.8-flash-lite-tts (24kHz studio-quality WAV audio).
            </p>
          </div>

          {/* System Persona Prompt Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="customPromptArea" className="font-mono text-slate-200 block">
                Active System Prompt
              </label>
              <button
                type="button"
                onClick={onResetPromptToDefault}
                className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to {activePersona.name}</span>
              </button>
            </div>
            <textarea
              id="customPromptArea"
              rows={4}
              value={customPrompt}
              onChange={(e) => onChangeCustomPrompt(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
