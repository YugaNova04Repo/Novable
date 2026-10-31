import React, { useEffect, useRef } from 'react';
import { ElementDefinition } from '../game/types';

interface Props {
  element: ElementDefinition;
  width?: number;
  height?: number;
}

export default function FeynmanVisualizer({ element, width = 280, height = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      ctx.fillStyle = '#0B0F17';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw quantum wave interference / orbital rings
      ctx.strokeStyle = element.color;
      ctx.lineWidth = 1.5;

      if (element.category === 'quantum' || element.category === 'subatomic') {
        // Wave interference ripples
        for (let r = 20; r < 90; r += 20) {
          ctx.globalAlpha = Math.max(0, 1 - (r / 90) - (Math.sin(t - r * 0.1) * 0.2));
          ctx.beginPath();
          ctx.arc(cx, cy, r + Math.sin(t + r) * 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (element.category === 'molecule') {
        // Molecular bond angle representation
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(cx - 30, cy, 18, 0, Math.PI * 2);
        ctx.arc(cx + 30, cy, 18, 0, Math.PI * 2);
        ctx.fillStyle = element.color;
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy);
        ctx.lineTo(cx + 30, cy);
        ctx.stroke();
      } else {
        // Electron orbital lobes
        for (let i = 0; i < 3; i++) {
          const angle = t + (i * Math.PI * 2) / 3;
          const ox = cx + Math.cos(angle) * 35;
          const oy = cy + Math.sin(angle) * 35;

          ctx.globalAlpha = 0.6;
          ctx.fillStyle = element.color;
          ctx.beginPath();
          ctx.arc(ox, oy, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [element, width, height]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 p-2 shadow-inner">
      <div className="text-[10px] font-mono text-cyan-400 mb-1 px-1">Feynman Micro-Visualizer: {element.name}</div>
      <canvas ref={canvasRef} width={width} height={height} className="w-full rounded-xl block" />
    </div>
  );
}
