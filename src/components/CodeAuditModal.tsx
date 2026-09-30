import React, { useState } from 'react';
import { X, ShieldCheck, Check, Copy, AlertTriangle, ArrowRight } from 'lucide-react';
import { AuditResult, FileItem } from '../types';

interface CodeAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  auditResult: AuditResult | null;
  isLoading: boolean;
  onApplyRefactor: (fileId: string, newCode: string) => void;
}

export const CodeAuditModal: React.FC<CodeAuditModalProps> = ({
  isOpen,
  onClose,
  file,
  auditResult,
  isLoading,
  onApplyRefactor,
}) => {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!isOpen || !file) return null;

  const handleCopy = () => {
    if (!auditResult?.refactoredCode) return;
    navigator.clipboard.writeText(auditResult.refactoredCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!auditResult?.refactoredCode || !file) return;
    onApplyRefactor(file.id, auditResult.refactoredCode);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1200);
  };

  const score = auditResult?.qualityScore ?? 0;
  let scoreClass = 'text-emerald-400 bg-emerald-950/80 border-emerald-700';
  if (score < 75) scoreClass = 'text-amber-400 bg-amber-950/80 border-amber-700';
  if (score < 55) scoreClass = 'text-rose-400 bg-rose-950/80 border-rose-700';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auditModalTitle"
    >
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-cyan-800/80 p-5 flex flex-col gap-4 shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-cyan-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 id="auditModalTitle" className="font-mono font-bold text-sm text-slate-100">
                Gemini AST & Security Audit: {file.name}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {file.sizeFormatted} · {file.ext}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-300 font-mono">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing AST, race conditions, memory leaks & security with Gemini 3.8 Flash...</span>
            </div>
          ) : auditResult ? (
            <>
              {/* Quality Score Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-mono text-xs text-slate-200 font-bold block">
                    CODE HEALTH & SAFETY SCORE
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Deep structured diagnostic via Gemini Schema
                  </span>
                </div>
                <div className={`text-base font-mono font-bold px-3 py-1 rounded-xl border ${scoreClass}`}>
                  {score} / 100
                </div>
              </div>

              {/* Diagnostic Summary */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-cyan-400 font-semibold block">
                  EXECUTIVE DIAGNOSTIC
                </span>
                <p className="text-slate-200 text-xs leading-relaxed">{auditResult.summary}</p>
              </div>

              {/* Vulnerabilities */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-rose-400 font-semibold block">
                  IDENTIFIED VULNERABILITIES & CODE SMELLS
                </span>
                {auditResult.vulnerabilities.length === 0 ? (
                  <p className="text-slate-400 font-mono text-[11px]">No critical vulnerabilities detected.</p>
                ) : (
                  <div className="space-y-1.5">
                    {auditResult.vulnerabilities.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-rose-950/25 border border-rose-900/50 text-rose-200 text-xs flex items-start gap-2.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-rose-300">{v.issue}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-900/80 text-rose-200 font-mono">
                              {v.severity}
                            </span>
                          </div>
                          {v.lineHint && (
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              Location: {v.lineHint}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Architectural Fixes */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-emerald-400 font-semibold block">
                  ARCHITECTURAL FIXES & OPTIMIZATIONS
                </span>
                <div className="space-y-1">
                  {auditResult.optimizations.map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-emerald-950/25 border border-emerald-900/50 text-emerald-200 text-xs flex items-start gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refactored Code */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                    HARDENED DROP-IN REPLACEMENT
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>{applied ? 'Applied to File!' : 'Apply Refactor'}</span>
                    </button>
                  </div>
                </div>

                <pre className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800 text-cyan-200 max-h-64 leading-relaxed">
                  <code>{auditResult.refactoredCode}</code>
                </pre>
              </div>
            </>
          ) : (
            <div className="text-slate-400 font-mono text-center py-8">
              No audit report available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
