import React, { useState } from 'react';
import {
  Volume2,
  Activity,
  Users2,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Download,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import { ChatMessage, TelemetryData } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  onSpeak: (text: string) => void;
  onDissect: (messageId: string, text: string) => void;
  onDualDebate: (text: string) => void;
  onGenerateDiagram: (messageId: string, text: string) => void;
  onShare: (text: string, title?: string) => void;
  isSpeakingThis: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onSpeak,
  onDissect,
  onDualDebate,
  onGenerateDiagram,
  onShare,
  isSpeakingThis,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isDissecting, setIsDissecting] = useState(false);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDissectClick = async () => {
    setIsDissecting(true);
    try {
      await onDissect(message.id, message.text);
    } finally {
      setIsDissecting(false);
    }
  };

  const handleDiagramClick = async () => {
    setIsGeneratingDiagram(true);
    try {
      await onGenerateDiagram(message.id, message.text);
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

  // Helper to format text with code blocks and bold
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0]?.trim() || '';
        const code = lines.slice(1).join('\n') || lines[0];
        return (
          <div key={idx} className="my-2.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            {lang && (
              <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-[10px] font-mono text-cyan-400">
                {lang}
              </div>
            )}
            <pre className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto text-cyan-200">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Inline code and bold formatting
      return (
        <span key={idx} className="whitespace-pre-wrap">
          {part.split(/(`[^`]+`)/g).map((sub, sIdx) => {
            if (sub.startsWith('`') && sub.endsWith('`')) {
              return (
                <code
                  key={sIdx}
                  className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-xs border border-slate-800"
                >
                  {sub.slice(1, -1)}
                </code>
              );
            }
            return sub;
          })}
        </span>
      );
    });
  };

  return (
    <div className={`flex gap-3 max-w-3xl my-3 ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-mono text-xs font-bold text-white shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
            : 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-600'
        }`}
      >
        {isUser ? 'YOU' : 'AI'}
      </div>

      {/* Bubble Container */}
      <div className="space-y-1.5 max-w-[85%]">
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-700/60 text-slate-100 rounded-tr-none'
              : 'glass-card border border-slate-700/80 text-slate-100 rounded-tl-none shadow-sm'
          }`}
        >
          {/* Attached Files List in user bubble */}
          {message.attachedFiles && message.attachedFiles.length > 0 && (
            <div className="mb-2.5 pb-2 border-b border-indigo-800/50 flex flex-wrap items-center gap-1.5 text-xs text-indigo-200">
              <span className="font-semibold text-cyan-300">Attached:</span>
              {message.attachedFiles.map((f, i) => (
                <span key={i} className="font-mono text-[11px] bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-700/60">
                  [{f.ext}] {f.name}
                </span>
              ))}
            </div>
          )}

          {/* Attached Image Preview */}
          {message.imageSrc && (
            <div className="mb-2.5 rounded-xl overflow-hidden border border-white/10 max-h-64">
              <img
                src={message.imageSrc}
                alt="Attached visual"
                className="w-full h-auto object-contain max-h-60 rounded-lg"
              />
            </div>
          )}

          {/* Message Content */}
          <div className="space-y-2">
            {message.isGenerating ? (
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Processing high-velocity sparring mirror...</span>
              </div>
            ) : (
              renderFormattedText(message.text)
            )}
          </div>

          {/* Citations & Grounded Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-cyan-950 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>GROUNDED SOURCES & CITATIONS</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.slice(0, 5).map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-900/90 text-cyan-300 hover:text-white border border-cyan-800/60 hover:border-cyan-500 transition-colors font-mono truncate max-w-[200px]"
                  >
                    [{i + 1}] {src.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Telemetry Card Inline */}
          {message.telemetry && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-amber-600/50 flex flex-col gap-2.5 text-xs font-sans">
              <div className="flex items-center justify-between border-b border-amber-800/40 pb-2">
                <div className="flex items-center gap-1.5 font-mono text-amber-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>ARGUMENT_TELEMETRY</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] text-slate-400">FRICTION:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 font-bold tabular-nums">
                    {message.telemetry.frictionScore}% · {message.telemetry.epistemicHealth}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-0.5">CORE THESIS:</span>
                <p className="text-slate-200 bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-medium">
                  {message.telemetry.coreThesis}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono text-rose-400 block mb-1">
                  VULNERABILITIES & FALLACIES:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {message.telemetry.logicalFallacies.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/70 text-rose-300 text-[11px] font-mono"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-amber-400 block mb-1">
                  UNSTATED PREMISES:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                  {message.telemetry.hiddenAssumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <span className="text-[11px] font-mono text-cyan-400 block mb-0.5">
                  STEEL-MAN OBJECTION:
                </span>
                <p className="text-slate-300 italic bg-cyan-950/20 p-2 rounded-lg border border-cyan-900/50">
                  {message.telemetry.steelmanCounter}
                </p>
              </div>

              <div className="flex items-start gap-2 bg-amber-950/30 p-2.5 rounded-lg border border-amber-700/50 text-amber-200">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-amber-400 block">
                    Devastating Pivot Question:
                  </span>
                  <span className="font-semibold text-xs">{message.telemetry.piercingQuestion}</span>
                </div>
              </div>
            </div>
          )}

          {/* Generated Diagram Card Inline */}
          {message.visualDiagramUrl && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-emerald-600/50 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-emerald-800/40 pb-1.5">
                <span className="font-mono text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>CONCEPT_MATRIX</span>
                </span>
                <a
                  href={message.visualDiagramUrl}
                  download="mind-sync-concept.png"
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:text-white flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>PNG</span>
                </a>
              </div>
              <div className="rounded-xl overflow-hidden border border-emerald-900/60 bg-slate-900">
                <img
                  src={message.visualDiagramUrl}
                  alt="Mental model diagram"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          )}

          {/* AI Action Tool Bar */}
          {!isUser && !message.isGenerating && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">MIND_SYNC</span>
                <span>·</span>
                <span>Gemini 3.8</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Dissect Telemetry */}
                <button
                  type="button"
                  onClick={handleDissectClick}
                  disabled={isDissecting}
                  className="hover:text-amber-300 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 transition-colors"
                  title="Perform Structured Logic & Fallacy Dissection"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isDissecting ? 'Dissecting...' : 'Dissect'}</span>
                </button>

                {/* Dual-Speaker Debate Arena */}
                <button
                  type="button"
                  onClick={() => onDualDebate(message.text)}
                  className="hover:text-violet-300 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 transition-colors"
                  title="Generate 2-Voice Adversarial Debate Audio"
                >
                  <Users2 className="w-3.5 h-3.5 text-violet-400" />
                  <span>Dual Spar</span>
                </button>

                {/* Mental Model Diagram */}
                <button
                  type="button"
                  onClick={handleDiagramClick}
                  disabled={isGeneratingDiagram}
                  className="hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 transition-colors"
                  title="Generate Conceptual Blueprint Matrix"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isGeneratingDiagram ? 'Generating...' : 'Matrix'}</span>
                </button>

                {/* Voice Replay */}
                <button
                  type="button"
                  onClick={() => onSpeak(message.text)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors ${
                    isSpeakingThis
                      ? 'bg-cyan-900/60 text-cyan-200 border-cyan-500'
                      : 'bg-slate-800/80 text-slate-300 hover:text-cyan-300 border-slate-700/60'
                  }`}
                  title="Synthesize Voice Audio"
                >
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isSpeakingThis ? 'Speaking...' : 'Speech'}</span>
                </button>

                {/* Share to Social Media */}
                <button
                  type="button"
                  onClick={() => onShare(message.text, 'AI Sparring Mirror Insight')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors"
                  title="Share Insight to Twitter, Facebook, or Instagram"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Share</span>
                </button>

                {/* Copy Text */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
                  title="Copy message"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={`text-[10px] font-mono text-slate-500 block ${
            isUser ? 'text-right pr-1' : 'pl-1'
          }`}
        >
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};
