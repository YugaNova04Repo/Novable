import React, { useEffect, useState } from 'react';
import { Activity, Cpu, Layers, Zap, X } from 'lucide-react';
import { GameEngine } from '../game/Engine';

interface Props {
  engine: GameEngine;
  onClose?: () => void;
}

export default function PerformanceMonitor({ engine, onClose }: Props) {
  const [metrics, setMetrics] = useState({
    fps: 60,
    frameTimeMs: 16.6,
    particleCount: 0,
    activeGridCells: 0,
    kineticEnergy: 0,
    entropy: 0
  });

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const monitorLoop = () => {
      const now = performance.now();
      const deltaMs = now - lastTime;
      lastTime = now;
      frameCount++;

      if (now - fpsTimer >= 500) {
        const measuredFps = Math.round((frameCount * 1000) / (now - fpsTimer));
        setMetrics({
          fps: measuredFps,
          frameTimeMs: Number(deltaMs.toFixed(1)),
          particleCount: engine.particles.length,
          activeGridCells: engine.spatialGrid.buckets.size,
          kineticEnergy: Math.round(engine.getTotalKineticEnergy()),
          entropy: engine.calculateEntropy()
        });
        frameCount = 0;
        fpsTimer = now;
      }

      animId = requestAnimationFrame(monitorLoop);
    };

    animId = requestAnimationFrame(monitorLoop);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  return (
    <div className="fixed top-16 right-4 z-40 bg-[#0F141E]/85 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-3.5 text-white font-mono text-xs shadow-2xl pointer-events-auto min-w-[220px] space-y-2.5 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between pb-2 border-b border-white/10 text-cyan-400">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
          <Activity size={14} className="animate-pulse text-cyan-400" />
          <span>Diagnostic Performance Monitor</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-xl">
          <span className="text-white/50 text-[10px] flex items-center gap-1">
            <Cpu size={12} className="text-cyan-400" /> Frame Time / FPS:
          </span>
          <span className="font-bold text-cyan-300">
            {metrics.frameTimeMs} ms ({metrics.fps} FPS)
          </span>
        </div>

        <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-xl">
          <span className="text-white/50 text-[10px] flex items-center gap-1">
            <Layers size={12} className="text-fuchsia-400" /> Particles:
          </span>
          <span className="font-bold text-fuchsia-300">
            {metrics.particleCount} Active
          </span>
        </div>

        <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-xl">
          <span className="text-white/50 text-[10px] flex items-center gap-1">
            <Zap size={12} className="text-amber-400" /> Spatial Grid Cells:
          </span>
          <span className="font-bold text-amber-300">
            {metrics.activeGridCells} Cells
          </span>
        </div>

        <div className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-xl text-[10px]">
          <span className="text-white/50">Entropy / Kinetic E:</span>
          <span className="font-bold text-green-300">
            {metrics.entropy} k_B / {metrics.kineticEnergy} J
          </span>
        </div>
      </div>
    </div>
  );
}
