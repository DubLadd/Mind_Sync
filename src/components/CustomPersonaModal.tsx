import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  Trash2,
  Check,
  UserCheck,
  Zap,
  Sliders,
  Radio,
  Loader2,
  Flame,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { User, CustomPersona } from '../types';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, getDocs, collection, query, where } from 'firebase/firestore';

interface CustomPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onPersonaSaved: (persona: CustomPersona) => void;
  existingCustomPersonas: CustomPersona[];
  onDeleteCustomPersona: (personaId: string) => void;
}

const TEMPLATE_PROMPTS = [
  {
    title: 'Socratic Epistemic Inquisitor',
    friction: 'High',
    prompt: `You are the Socratic Inquisitor. Never accept a premise without rigorous cross-examination. Always question definition of terms, identify unstated assumptions, and force the user to examine the logical consequences of their stance. Answer questions primarily with deeper, piercing questions.`,
  },
  {
    title: 'Principal Staff Architect',
    friction: 'Extreme',
    prompt: `You are a battle-hardened Principal Staff Software Engineer. You evaluate every technical proposition with extreme scrutiny: zero-allocation performance, network failure modes, distributed system consistency, concurrency pitfalls, and operational maintenance burdens. Demand quantifiable benchmarks and point out unmitigated failure cascades.`,
  },
  {
    title: 'Venture Contrarian',
    friction: 'High',
    prompt: `You are a contrarian tech investor and market strategist. You immediately challenge market consensus, unit economics, moat durability, and distribution bottlenecks. Demand to know what non-obvious truth the user believes that almost nobody agrees with.`,
  },
  {
    title: 'Executive Steelmanner',
    friction: 'Medium',
    prompt: `You are an elite Executive Debate Coach. Your primary duty is to build the strongest possible opposing argument (steelman) against any idea presented, even if controversial. Guide the user to discover their blind spots by exploring the strongest version of their detractors' viewpoints.`,
  },
];

export const CustomPersonaModal: React.FC<CustomPersonaModalProps> = ({
  isOpen,
  onClose,
  user,
  onPersonaSaved,
  existingCustomPersonas,
  onDeleteCustomPersona,
}) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [badge, setBadge] = useState('CUSTOM');
  const [voice, setVoice] = useState<'Fenrir' | 'Zephyr' | 'Puck' | 'Kore' | 'Aoede' | 'Charon'>('Fenrir');
  const [frictionLevel, setFrictionLevel] = useState<'Low' | 'Medium' | 'High' | 'Extreme'>('High');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: (typeof TEMPLATE_PROMPTS)[0]) => {
    setName(tmpl.title);
    setTagline(`Specialized ${tmpl.friction} Friction sparring partner`);
    setBadge(tmpl.friction.toUpperCase());
    setFrictionLevel(tmpl.friction as any);
    setSystemPrompt(tmpl.prompt);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !systemPrompt.trim()) {
      setErrorMessage('Name and System Prompt are required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const personaId = `custom_${Date.now()}`;
    const newPersona: CustomPersona = {
      id: personaId,
      userId: user ? user.id : 'guest',
      name: name.trim(),
      tagline: tagline.trim() || 'Custom Configured Sparring Partner',
      badge: badge.trim().toUpperCase() || 'CUSTOM',
      description: tagline.trim() || 'Custom System Prompt',
      voice,
      frictionLevel,
      systemPrompt: systemPrompt.trim(),
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    // 1. If signed in, store to Firestore
    if (user) {
      try {
        const personaDocRef = doc(db, 'personas', personaId);
        await setDoc(personaDocRef, newPersona);
      } catch (err: any) {
        console.warn('Firestore custom persona save warning:', err);
      }
    }

    // 2. Persist to local storage for instant availability
    try {
      const stored = localStorage.getItem('mind_sync_custom_personas');
      const list: CustomPersona[] = stored ? JSON.parse(stored) : [];
      list.push(newPersona);
      localStorage.setItem('mind_sync_custom_personas', JSON.stringify(list));
    } catch (e) {}

    setIsSaving(false);
    setStatusMessage(`Saved "${newPersona.name}" to Persona Dropdown!`);
    onPersonaSaved(newPersona);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this custom persona configuration?')) {
      if (user) {
        try {
          await deleteDoc(doc(db, 'personas', id));
        } catch (e) {}
      }
      onDeleteCustomPersona(id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-cyan-800/80 p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>CUSTOM PERSONA CREATOR</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Firestore Synced
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Design, name, and tune system prompt architectures
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

        {/* Existing Custom Personas List (if any) */}
        {existingCustomPersonas.length > 0 && (
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>YOUR SAVED CUSTOM PERSONAS ({existingCustomPersonas.length}):</span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
              {existingCustomPersonas.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-cyan-900/60 text-xs font-mono"
                >
                  <span className="text-cyan-400 font-bold">{p.name}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {p.badge}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(p.id, e)}
                    className="text-slate-500 hover:text-rose-400 transition-colors ml-1"
                    title="Delete custom persona"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Template Starters */}
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">
            QUICK ARCHITECTURE TEMPLATES:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {TEMPLATE_PROMPTS.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-600/70 text-left transition-all flex items-start justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-200">{tmpl.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {tmpl.prompt}
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0 ml-1">
                  {tmpl.friction}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Persona Form */}
        <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Persona Name:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adversarial Tech Lead"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Tagline / Subtitle:</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Ruthless architecture evaluator"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 block mb-1">Badge Tag:</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. CRITICAL"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 uppercase placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">TTS Voice Tone:</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Fenrir">Fenrir (Authoritative Deep)</option>
                <option value="Zephyr">Zephyr (Precise Analytical)</option>
                <option value="Puck">Puck (Dynamic Socratic)</option>
                <option value="Kore">Kore (Sharp Philosophical)</option>
                <option value="Aoede">Aoede (Clear Resonant)</option>
                <option value="Charon">Charon (Intense Resolute)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Friction Level:</label>
              <select
                value={frictionLevel}
                onChange={(e) => setFrictionLevel(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Low">Low (Supportive Nuance)</option>
                <option value="Medium">Medium (Balanced Challenge)</option>
                <option value="High">High (Relentless Cross-Exam)</option>
                <option value="Extreme">Extreme (Unfiltered Dissection)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">
              System Prompt Architecture:
            </label>
            <textarea
              rows={5}
              required
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define behavioral rules, tone of voice, dialectic method, and core constraints..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Persona to Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Persona & Add to Dropdown</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
