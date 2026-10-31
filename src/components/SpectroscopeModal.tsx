import React, { useEffect, useRef } from 'react';
import { X, Sparkles, Activity } from 'lucide-react';
import { Particle } from '../game/types';
import { ELEMENTS } from '../game/constants';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  particles: Particle[];
  onClose: () => void;
}

export default function SpectroscopeModal({ particles, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Count elements present in crucible
  const elementCounts: Record<string, number> = {};
  particles.forEach(p => {
    elementCounts[p.elementId] = (elementCounts[p.elementId] || 0) + 1;
  });

  const presentElements = Object.keys(elementCounts);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw diffraction grating rainbow background
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0.0, '#7C3AED'); // UV / Violet
    grad.addColorStop(0.2, '#3B82F6'); // Blue
    grad.addColorStop(0.4, '#10B981'); // Green
    grad.addColorStop(0.6, '#F59E0B'); // Yellow
    grad.addColorStop(0.8, '#EF4444'); // Red
    grad.addColorStop(1.0, '#7F1D1D'); // IR

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Overlay Fraunhofer emission/absorption lines based on present elements
    presentElements.forEach((elId, idx) => {
      const def = ELEMENTS[elId];
      if (!def) return;

      const xPos = (idx * 45 + 50) % (width - 60);
      ctx.strokeStyle = def.color || '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, height);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(def.symbol, xPos + 4, 20);
    });
  }, [presentElements]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 pointer-events-auto">
      <div className="relative w-full max-w-lg bg-[#0F141E] border border-white/15 rounded-3xl p-6 text-white shadow-2xl font-mono text-xs space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans">Spectroscopic Emission & Absorption Analyzer</h2>
            <p className="text-[10px] text-white/50">Diffraction grating spectrum analysis of crucible matter</p>
          </div>
        </div>

        <div className="space-y-4 bg-black/40 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-purple-300 font-bold mb-2">
            <Activity size={16} />
            <span>Diffraction Grating Spectrum (Fraunhofer Lines)</span>
          </div>
          <canvas ref={canvasRef} width={440} height={120} className="w-full rounded-xl border border-white/10 block shadow-inner" />
          <div className="text-[11px] text-white/60">
            Detected Elements in View: {presentElements.length > 0 ? presentElements.map(id => ELEMENTS[id]?.name).filter(Boolean).join(', ') : 'None (Vacuum)'}
          </div>
        </div>
      </div>
    </div>
  );
}
