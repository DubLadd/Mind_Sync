import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audio';

interface AudioVisualizerProps {
  mode: 'idle' | 'recording' | 'speaking';
  autoPlay: boolean;
  onToggleAutoPlay: (enabled: boolean) => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  mode,
  autoPlay,
  onToggleAutoPlay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = audioEngine.analyserNode;

      if (mode === 'idle' || !analyser) {
        // Draw elegant baseline idle harmonic wave
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        const time = Date.now() * 0.003;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.035 + time) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.88;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        if (mode === 'recording') {
          gradient.addColorStop(0, '#0891b2');
          gradient.addColorStop(1, '#06b6d4');
        } else {
          gradient.addColorStop(0, '#059669');
          gradient.addColorStop(1, '#10b981');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, Math.max(2, barHeight));

        x += barWidth + 1;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [mode]);

  return (
    <div className="glass-card rounded-xl p-3 border border-slate-800 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-mono text-slate-300">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              mode === 'recording'
                ? 'bg-cyan-400 animate-ping'
                : mode === 'speaking'
                ? 'bg-emerald-400 animate-ping'
                : 'bg-slate-500'
            }`}
          />
          <span className="font-medium">
            {mode === 'recording'
              ? 'Listening Input'
              : mode === 'speaking'
              ? 'AI Voice Stream'
              : 'Web Audio Idle'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 tabular-nums">FFT 64 · 24kHz</span>
      </div>

      <div className="relative rounded-lg overflow-hidden bg-slate-950/80 border border-slate-900 h-18 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={72}
          className="w-full h-full block"
          aria-label="Real-time Web Audio spectrum analyzer"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
        <label
          htmlFor="autoPlayCheck"
          className="flex items-center gap-2 cursor-pointer hover:text-white select-none transition-colors"
        >
          <input
            id="autoPlayCheck"
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => onToggleAutoPlay(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          />
          <span>Auto-play neural speech</span>
        </label>
        <span className="text-[11px] font-mono text-slate-500">
          {mode !== 'idle' ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>
    </div>
  );
};
