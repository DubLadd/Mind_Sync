import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  Save,
  Download,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Bug,
  Sparkles,
  Zap,
  Lightbulb,
  ArrowUpRight,
  Loader2,
  Terminal,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { User, FileItem } from '../types';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface DevStudioViewProps {
  user: User | null;
  onSaveToFileRepo: (file: FileItem) => void;
  onSaveToDrive?: (filename: string, code: string, mimeType: string) => void;
  initialCode?: string;
  initialLanguage?: 'html' | 'jsx' | 'tsx';
}

type DevAction = 'analyze' | 'debug_fix' | 'improve' | 'brainstorm' | 'upgrade';

const STARTER_SNIPPETS = {
  tsx: `import React, { useState, useEffect } from 'react';

interface MetricItem {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

export default function NeuralDashboard(): React.ReactElement {
  const [metrics, setMetrics] = useState<MetricItem[]>([
    { id: '1', label: 'Inference Latency', value: 24, unit: 'ms', trend: 'down' },
    { id: '2', label: 'Dialectic Friction', value: 87, unit: '%', trend: 'up' },
    { id: '3', label: 'Epistemic Certainty', value: 92, unit: '%', trend: 'stable' },
  ]);

  const [counter, setCounter] = useState<number>(0);

  const handlePulse = () => {
    setCounter((prev) => prev + 1);
    setMetrics((prev) =>
      prev.map((m) => ({
        ...m,
        value: Math.max(10, Math.min(99, m.value + (Math.floor(Math.random() * 9) - 4))),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-900/90 border border-cyan-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="font-mono text-sm font-bold tracking-wider text-cyan-300">
              NEURAL SPAR CORE v3.1
            </h1>
          </div>
          <span className="font-mono text-xs text-slate-400">Pulse: #{counter}</span>
        </div>

        <div className="space-y-3 mb-5">
          {metrics.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800"
            >
              <span className="text-xs font-mono text-slate-300">{item.label}</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-cyan-400">
                <span>{item.value}</span>
                <span className="text-slate-500 text-xs">{item.unit}</span>
                <span className="text-[10px] ml-1">
                  {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '●'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handlePulse}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          Inject Cognitive Pulse
        </button>
      </div>
    </div>
  );
}`,

  jsx: `import React, { useState } from 'react';

export default function CyberCard() {
  const [active, setActive] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center font-mono">
      <div 
        onClick={() => setActive(!active)}
        className={\`w-80 p-6 rounded-2xl border transition-all duration-300 cursor-pointer \${
          active 
            ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-105' 
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }\`}
      >
        <div className="text-xs text-cyan-400 font-bold mb-2">● LIVE PREVIEW NODE</div>
        <h2 className="text-lg font-bold text-slate-100 mb-2">Dialectic Reactor</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Click to toggle state engagement and observe real-time CSS transition dynamics.
        </p>
        <div className="text-[11px] text-slate-500">
          State: <span className="text-white font-bold">{active ? 'ENGAGED' : 'STANDBY'}</span>
        </div>
      </div>
    </div>
  );
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dialectic Arena</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-6 font-mono">
  <div class="max-w-lg w-full bg-slate-900 border border-emerald-800/80 rounded-2xl p-6 shadow-2xl">
    <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
      <h1 class="text-sm font-bold text-emerald-400">HTML5 DIALECTIC CANVAS</h1>
      <span class="text-xs text-slate-500">v1.0</span>
    </div>
    <canvas id="matrixCanvas" width="400" height="180" class="w-full bg-slate-950 rounded-xl mb-4 border border-slate-800"></canvas>
    <button id="glowBtn" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md">
      Pulse Particle Density
    </button>
  </div>

  <script>
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    let particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5,
    }));

    function draw() {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#10b981';
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      });
      requestAnimationFrame(draw);
    }
    draw();

    document.getElementById('glowBtn').addEventListener('click', () => {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 3,
        speedY: (Math.random() - 0.5) * 3,
      });
    });
  </script>
</body>
</html>`,
};

export const DevStudioView: React.FC<DevStudioViewProps> = ({
  user,
  onSaveToFileRepo,
  onSaveToDrive,
  initialCode,
  initialLanguage = 'tsx',
}) => {
  const [language, setLanguage] = useState<'html' | 'jsx' | 'tsx'>(initialLanguage);
  const [code, setCode] = useState<string>(initialCode || STARTER_SNIPPETS[initialLanguage]);
  const [previewSnippet, setPreviewSnippet] = useState<string>(code);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isExecutingAgent, setIsExecutingAgent] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<DevAction | null>(null);
  const [agentResponse, setAgentResponse] = useState<any>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<Array<{ type: string; message: string; time: string }>>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Synchronize preview on code update with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewSnippet(code);
    }, 400);
    return () => clearTimeout(timer);
  }, [code]);

  // Listen to postMessage from iframe for console telemetry
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.__devStudioLog) {
        setConsoleLogs((prev) => [
          ...prev.slice(-30),
          {
            type: event.data.level,
            message: event.data.args.join(' '),
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Generate iframe sandbox document
  const getIframeDoc = () => {
    if (language === 'html') {
      return previewSnippet;
    }

    // JSX or TSX: Bundle Babel Standalone, React 19, ReactDOM, Tailwind CSS
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; padding: 0; background: #020617; color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; }
    #root-error { color: #f43f5e; background: #1e1b4b; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 16px; white-space: pre-wrap; }
  </style>
  <script>
    // Intercept console
    const _origLog = console.log;
    const _origErr = console.error;
    const _origWarn = console.warn;
    function sendLog(level, args) {
      try {
        window.parent.postMessage({
          __devStudioLog: true,
          level,
          args: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a))
        }, '*');
      } catch(e) {}
    }
    console.log = (...args) => { _origLog(...args); sendLog('log', args); };
    console.error = (...args) => { _origErr(...args); sendLog('error', args); };
    console.warn = (...args) => { _origWarn(...args); sendLog('warn', args); };
  </script>
</head>
<body>
  <div id="root"></div>
  <div id="root-error" style="display:none;"></div>

  <script type="text/babel" data-presets="react,typescript">
    try {
      const React = window.React;
      const ReactDOM = window.ReactDOM;
      const { useState, useEffect, useRef, useMemo, useCallback } = React;

      ${cleanImports(previewSnippet)}

      const TargetApp = typeof NeuralDashboard !== 'undefined' ? NeuralDashboard :
                        typeof CyberCard !== 'undefined' ? CyberCard :
                        typeof App !== 'undefined' ? App :
                        typeof defaultExport !== 'undefined' ? defaultExport : null;

      if (TargetApp) {
        ReactDOM.render(<TargetApp />, document.getElementById('root'));
      } else {
        document.getElementById('root').innerHTML = '<div style="padding:20px; font-family:monospace; color:#38bdf8;">Component ready. Ensure you declare an export default component.</div>';
      }
    } catch(err) {
      console.error('Render Error:', err);
      const errBox = document.getElementById('root-error');
      errBox.style.display = 'block';
      errBox.textContent = 'Runtime Exception:\\n' + (err.stack || err.message);
    }
  </script>
</body>
</html>`;
  };

  // Strip standard external module imports for in-browser transpilation
  function cleanImports(source: string): string {
    let cleaned = source
      .replace(/import\s+React.*?from\s+['"].*?['"];?/g, '')
      .replace(/import\s+\{.*?\}\s+from\s+['"]react['"];?/g, '')
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, '// [external import stripped for live sandbox]')
      .replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'const $1 = function $1')
      .replace(/export\s+default\s+/g, 'const defaultExport = ');
    return cleaned;
  }

  const handleLanguageSwitch = (newLang: 'html' | 'jsx' | 'tsx') => {
    setLanguage(newLang);
    setCode(STARTER_SNIPPETS[newLang]);
    setAgentResponse(null);
  };

  // Execute Senior AI Dev Agent Action
  const handleRunDevAction = async (action: DevAction) => {
    setActiveAction(action);
    setIsExecutingAgent(true);
    setAgentResponse(null);

    try {
      const res = await fetch('/api/dev/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          code,
          language,
          instructions: customInstructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action execution failed');
      setAgentResponse(data);
    } catch (err: any) {
      alert(`Senior Dev Agent error: ${err.message}`);
    } finally {
      setIsExecutingAgent(false);
    }
  };

  // One-click apply Senior AI Dev code to editor
  const handleApplyImprovedCode = () => {
    if (agentResponse?.improvedCode) {
      setCode(agentResponse.improvedCode);
      setSaveStatus('Applied Senior AI Dev Code to Editor');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Save Code Snippet to Firestore and local repo
  const handleSaveCode = async () => {
    const filename = `snippet_${Date.now()}.${language}`;
    const fileId = `file_${Date.now()}`;

    // 1. Save to File Repository
    const fileItem: FileItem = {
      id: fileId,
      name: filename,
      ext: language.toUpperCase(),
      size: new Blob([code]).size,
      sizeFormatted: `${(new Blob([code]).size / 1024).toFixed(1)} KB`,
      mimeType: language === 'html' ? 'text/html' : 'text/javascript',
      category: 'code',
      isCode: true,
      isAudio: false,
      isImage: false,
      inContext: true,
      content: code,
    };
    onSaveToFileRepo(fileItem);

    // 2. If authenticated, persist to Firestore `/snippets/{snippetId}`
    if (user) {
      try {
        const snippetDocRef = doc(db, 'snippets', fileId);
        await setDoc(snippetDocRef, {
          id: fileId,
          userId: user.id,
          title: filename,
          language,
          code,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setSaveStatus(`Saved to Firestore & Workspace (${filename})`);
      } catch (e: any) {
        console.warn('Firestore snippet save note:', e?.message);
        setSaveStatus(`Saved to Workspace Repository (${filename})`);
      }
    } else {
      setSaveStatus(`Saved to Workspace Repository (${filename})`);
    }

    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Download File to local disk
  const handleDownloadCode = () => {
    const filename = `code_artifact_${Date.now()}.${language}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Studio Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-mono text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>SENIOR AI DEV CODE STUDIO</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                gemini-3.1-pro-preview
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Live IDE with AST Analysis, Deep Debugging, Refactoring & Sandboxed Execution
            </p>
          </div>
        </div>

        {/* Language Tabs & Save Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleLanguageSwitch('tsx')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                language === 'tsx'
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TSX
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('jsx')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                language === 'jsx'
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              JSX
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSwitch('html')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                language === 'html'
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              HTML
            </button>
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={handleSaveCode}
            title="Save snippet to repository and Firestore"
            className="px-3 py-1.5 rounded-xl bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-700/80 text-cyan-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Code</span>
          </button>

          {onSaveToDrive && (
            <button
              type="button"
              onClick={() =>
                onSaveToDrive(
                  `code_snippet_${Date.now()}.${language}`,
                  code,
                  language === 'html' ? 'text/html' : 'text/javascript'
                )
              }
              title="Save snippet to Google Drive"
              className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>To Drive</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadCode}
            title="Download code artifact to disk"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy clean code"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Senior AI Dev Agent Command Strip */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>SENIOR DEV AGENT:</span>
          </span>

          <button
            type="button"
            disabled={isExecutingAgent}
            onClick={() => handleRunDevAction('analyze')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Perform deep architectural AST analysis, security audit, and complexity scan"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analyze</span>
          </button>

          <button
            type="button"
            disabled={isExecutingAgent}
            onClick={() => handleRunDevAction('debug_fix')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-rose-500 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Diagnose syntax flaws, runtime errors, and produce hardened fix"
          >
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>Debug & Fix</span>
          </button>

          <button
            type="button"
            disabled={isExecutingAgent}
            onClick={() => handleRunDevAction('improve')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Optimize performance, eliminate unnecessary re-renders, and harden types"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Improve</span>
          </button>

          <button
            type="button"
            disabled={isExecutingAgent}
            onClick={() => handleRunDevAction('brainstorm')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Brainstorm 3 architectural patterns and reactive pipeline alternatives"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Brainstorm</span>
          </button>

          <button
            type="button"
            disabled={isExecutingAgent}
            onClick={() => handleRunDevAction('upgrade')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Upgrade to modern idioms (React 19, strict TypeScript, Tailwind v4)"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upgrade</span>
          </button>
        </div>

        {/* Optional Custom Instructions Input */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Agent guidance (e.g. 'add strict null checks')..."
            className="w-full bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveStatus && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 px-4 py-1.5 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Interactive Code Editor */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 min-w-0 bg-slate-950">
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>SOURCE EDITOR ({language.toUpperCase()})</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {code.split('\n').length} lines · {(new Blob([code]).size / 1024).toFixed(1)} KB
            </span>
          </div>

          <div className="flex-1 relative overflow-auto p-4 font-mono text-xs leading-relaxed bg-slate-950">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full min-h-[300px] bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none resize-none font-mono text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Right Pane: Live Sandboxed Preview & Senior Dev Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          {/* Preview Controls Bar */}
          <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE IDE SANDBOX PREVIEW</span>
            </div>

            {/* Viewport Dimension Selectors */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setViewport('desktop')}
                className={`p-1 rounded transition-colors ${
                  viewport === 'desktop' ? 'bg-slate-800 text-cyan-300' : 'text-slate-500 hover:text-white'
                }`}
                title="Desktop Viewport (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('tablet')}
                className={`p-1 rounded transition-colors ${
                  viewport === 'tablet' ? 'bg-slate-800 text-cyan-300' : 'text-slate-500 hover:text-white'
                }`}
                title="Tablet Viewport (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewport('mobile')}
                className={`p-1 rounded transition-colors ${
                  viewport === 'mobile' ? 'bg-slate-800 text-cyan-300' : 'text-slate-500 hover:text-white'
                }`}
                title="Mobile Viewport (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3 bg-slate-800 mx-1" />

              <button
                type="button"
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-colors ${
                  isConsoleOpen ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>Logs ({consoleLogs.length})</span>
              </button>
            </div>
          </div>

          {/* Sandboxed iFrame Frame */}
          <div className="flex-1 bg-slate-900/40 p-3 flex items-center justify-center overflow-auto relative">
            <div
              className={`h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl transition-all ${
                viewport === 'desktop' ? 'w-full' : viewport === 'tablet' ? 'w-[768px]' : 'w-[375px]'
              }`}
            >
              <iframe
                ref={iframeRef}
                srcDoc={getIframeDoc()}
                title="Live Sandboxed Code Preview"
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-0"
              />
            </div>

            {/* Senior AI Dev Agent Execution Spinner */}
            {isExecutingAgent && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-cyan-300 font-mono text-xs">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span>Senior AI Dev Agent ({activeAction}) in progress...</span>
              </div>
            )}
          </div>

          {/* Console Output Drawer */}
          {isConsoleOpen && (
            <div className="h-36 bg-slate-950 border-t border-slate-800 flex flex-col text-xs font-mono">
              <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>PREVIEW DEBUG CONSOLE</span>
                </span>
                <button
                  type="button"
                  onClick={() => setConsoleLogs([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {consoleLogs.length === 0 ? (
                  <div className="text-slate-600 italic">No console events captured yet...</div>
                ) : (
                  consoleLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`text-[11px] leading-tight ${
                        log.type === 'error'
                          ? 'text-rose-400'
                          : log.type === 'warn'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-slate-600 mr-2">[{log.time}]</span>
                      <span>{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Senior Dev Agent Response Panel */}
          {agentResponse && (
            <div className="h-64 bg-slate-900 border-t border-slate-800 flex flex-col text-xs font-mono overflow-hidden">
              <div className="px-4 py-2 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-slate-100">
                    SENIOR DEV AGENT REPORT ({activeAction?.toUpperCase()})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyImprovedCode}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply Code to Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgentResponse(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {/* Summary */}
                {agentResponse.summary && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
                    {agentResponse.summary}
                  </div>
                )}

                {/* Issues Found */}
                {agentResponse.issuesFound && agentResponse.issuesFound.length > 0 && (
                  <div>
                    <span className="text-rose-400 font-bold block mb-1">ISSUES IDENTIFIED:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {agentResponse.issuesFound.map((issue: string, idx: number) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Key Changes */}
                {agentResponse.keyChanges && agentResponse.keyChanges.length > 0 && (
                  <div>
                    <span className="text-emerald-400 font-bold block mb-1">KEY IMPROVEMENTS MADE:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {agentResponse.keyChanges.map((change: string, idx: number) => (
                        <li key={idx}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detailed Analysis */}
                {agentResponse.analysis && (
                  <div className="pt-2 border-t border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {agentResponse.analysis}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
