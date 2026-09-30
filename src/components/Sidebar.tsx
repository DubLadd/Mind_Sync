import React from 'react';
import {
  Globe,
  Activity,
  Users2,
  FileDown,
  Image as ImageIcon,
  Flame,
  Radio,
  Plus,
  History,
  Sparkles,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { PERSONA_PRESETS } from '../utils/personas';
import { PersonaConfig, CustomPersona } from '../types';

interface SidebarProps {
  visualizerMode: 'idle' | 'recording' | 'speaking';
  autoPlay: boolean;
  onToggleAutoPlay: (enabled: boolean) => void;
  activePersona: PersonaConfig | CustomPersona;
  onSelectPersona: (id: string) => void;
  customPersonas?: CustomPersona[];
  onOpenCustomPersonaModal?: () => void;
  onOpenSessionsHistory?: () => void;
  useSearchGrounding: boolean;
  onToggleSearchGrounding: (enabled: boolean) => void;
  autoTelemetry: boolean;
  onToggleAutoTelemetry: (enabled: boolean) => void;
  onLaunchDualDebate: () => void;
  onLaunchConceptDiagram: () => void;
  onExportSession: () => void;
  statusText: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  visualizerMode,
  autoPlay,
  onToggleAutoPlay,
  activePersona,
  onSelectPersona,
  customPersonas = [],
  onOpenCustomPersonaModal,
  onOpenSessionsHistory,
  useSearchGrounding,
  onToggleSearchGrounding,
  autoTelemetry,
  onToggleAutoTelemetry,
  onLaunchDualDebate,
  onLaunchConceptDiagram,
  onExportSession,
  statusText,
}) => {
  return (
    <aside
      className="w-full md:w-80 glass-panel rounded-2xl p-4 flex flex-col gap-4 shrink-0 overflow-y-auto max-h-full"
      aria-label="Cognitive Control & Audio Dashboard"
    >
      {/* 1. Real-time Web Audio Spectrum Visualizer */}
      <AudioVisualizer
        mode={visualizerMode}
        autoPlay={autoPlay}
        onToggleAutoPlay={onToggleAutoPlay}
      />

      {/* 2. Active Persona Details */}
      <div className="glass-card rounded-xl p-3.5 border border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span>ACTIVE PERSONA</span>
          <span className="text-cyan-400 font-bold">{activePersona.badge}</span>
        </div>
        <div className="text-xs text-slate-200 font-medium">{activePersona.tagline}</div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          {activePersona.description}
        </p>
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Voice: {activePersona.voice}</span>
          <span className="text-emerald-400">Gemini 3.8 Flash</span>
        </div>
      </div>

      {/* 3. Tone Presets Selector (Responsive list) */}
      <div className="glass-card rounded-xl p-3 border border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span className="uppercase tracking-wider">Tone Presets</span>
          <span className="text-[10px] text-cyan-400">Switch Mode</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5" role="radiogroup">
          {Object.values(PERSONA_PRESETS).map((p) => {
            const isActive = activePersona.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onSelectPersona(p.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between border ${
                  isActive
                    ? 'bg-cyan-950/70 border-cyan-700/80 text-cyan-200 font-semibold shadow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {p.id === 'sparring' && <Flame className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  {p.id === 'superagent' && <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {p.id === 'socratic' && <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {p.id === 'concise' && <Radio className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  {p.id === 'redteam' && <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                  <span className="truncate">{p.name}</span>
                </div>
                <span className="text-[10px] opacity-75 shrink-0 font-sans">
                  {p.voice}
                </span>
              </button>
            );
          })}

          {/* User's Custom Personas in Sidebar */}
          {customPersonas.map((cp) => {
            const isActive = activePersona.id === cp.id;
            return (
              <button
                key={cp.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onSelectPersona(cp.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between border cursor-pointer ${
                  isActive
                    ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-200 font-semibold shadow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{cp.name}</span>
                </div>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                  {cp.badge}
                </span>
              </button>
            );
          })}

          {/* Create Custom Persona Button */}
          {onOpenCustomPersonaModal && (
            <button
              type="button"
              onClick={onOpenCustomPersonaModal}
              className="w-full mt-1 py-2 px-3 rounded-lg border border-dashed border-cyan-800/80 hover:border-cyan-500 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Custom Persona</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Past Sparring Sessions Shortcut */}
      {onOpenSessionsHistory && (
        <button
          type="button"
          onClick={onOpenSessionsHistory}
          className="glass-card rounded-xl p-3 border border-slate-800 hover:border-cyan-700/80 transition-all flex items-center justify-between text-xs font-mono text-slate-200 cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400 group-hover:rotate-[-20deg] transition-transform" />
            <span className="font-bold">Past Sessions (Firestore)</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold group-hover:underline">Browse →</span>
        </button>
      )}

      {/* 5. Gemini Engines & Tools */}
      <div className="glass-card rounded-xl p-3 border border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 uppercase tracking-wider">
          <span>Gemini Engines</span>
          <span className="text-[10px] text-cyan-400 font-mono">Tools</span>
        </div>

        {/* Google Grounding Toggle */}
        <label
          htmlFor="groundingToggle"
          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-200 font-medium">Google Grounding</span>
              <span className="text-[10px] text-slate-400">Live search & citations</span>
            </div>
          </div>
          <input
            id="groundingToggle"
            type="checkbox"
            checked={useSearchGrounding}
            onChange={(e) => onToggleSearchGrounding(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          />
        </label>

        {/* Auto Telemetry Scan Toggle */}
        <label
          htmlFor="autoTelemetryToggle"
          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-200 font-medium">Auto Telemetry</span>
              <span className="text-[10px] text-slate-400">Structured JSON fallacy scan</span>
            </div>
          </div>
          <input
            id="autoTelemetryToggle"
            type="checkbox"
            checked={autoTelemetry}
            onChange={(e) => onToggleAutoTelemetry(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
          />
        </label>

        {/* Dual-Voice Arena & Concept Visual Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onLaunchDualDebate}
            className="w-full py-2 px-2.5 rounded-lg bg-gradient-to-r from-violet-950/70 to-indigo-950/70 hover:from-violet-900/80 hover:to-indigo-900/80 border border-violet-700/60 text-violet-200 hover:text-white text-xs font-mono flex items-center justify-between transition-all"
            title="Generate a 2-Voice adversarial debate on current topic"
          >
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-violet-400 shrink-0" />
              <span>Dual-Voice Debate</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-900/80 border border-violet-700 text-violet-300">
              2-TTS
            </span>
          </button>

          <button
            type="button"
            onClick={onLaunchConceptDiagram}
            className="w-full py-2 px-2.5 rounded-lg bg-gradient-to-r from-emerald-950/70 to-cyan-950/70 hover:from-emerald-900/80 hover:to-cyan-900/80 border border-emerald-700/60 text-emerald-200 hover:text-white text-xs font-mono flex items-center justify-between transition-all"
            title="Generate Mental Model Matrix Diagram"
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Concept Matrix</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/80 border border-emerald-700 text-emerald-300">
              IMAGE
            </span>
          </button>

          <button
            type="button"
            onClick={onExportSession}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Dossier</span>
            </div>
            <span className="text-[9px] text-slate-500 font-sans">MD/JSON</span>
          </button>
        </div>
      </div>

      {/* 5. Engine Status Footer */}
      <div className="mt-auto pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>STT: WebSpeech API</span>
        <span className="text-emerald-400 font-bold">{statusText}</span>
      </div>
    </aside>
  );
};
