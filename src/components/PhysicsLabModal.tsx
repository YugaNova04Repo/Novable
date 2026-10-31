import React, { useState } from 'react';
import { X, Sliders, Download } from 'lucide-react';
import { GameEngine } from '../game/Engine';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  engine: GameEngine;
  onClose: () => void;
}

export function ResearchDataExporter({ engine }: { engine: GameEngine }) {
  const exportCSV = () => {
    soundEngine.playClick();
    const headers = 'Timestamp (ms),Particle Count,Temperature (K),Pressure (GPa),Kinetic Energy (J)\n';
    let rows = '';
    if (engine.snapshots.length > 0) {
      rows = engine.snapshots.map(s => `${s.time},${s.particles.length},${s.temp},${s.pressure},${engine.getTotalKineticEnergy()}`).join('\n');
    } else {
      rows = `0,${engine.particles.length},${engine.temp},${engine.pressure},${engine.getTotalKineticEnergy()}\n`;
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-research-telemetry-${Math.floor(Date.now() / 1000)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
      <div className="flex items-center gap-2 text-cyan-400 font-bold">
        <Download size={16} />
        <span>Research Data Exporter (CSV)</span>
      </div>
      <p className="text-white/60 text-[11px] font-sans">
        Export real-time simulation state variables (temperature, pressure, particle counts, and kinetic energy) into a downloadable CSV file format for external scientific analysis.
      </p>
      <button
        onClick={exportCSV}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
      >
        <Download size={14} />
        <span>Download Telemetry (.CSV)</span>
      </button>
    </div>
  );
}

export default function PhysicsLabModal({ engine, onClose }: Props) {
  const [gravScale, setGravScale] = useState<number>(1.0);
  const [thermalScale, setThermalScale] = useState<number>(1.0);

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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans">Advanced Physics Research Lab</h2>
            <p className="text-[10px] text-white/50">Tune fundamental physical constants & export telemetry logs</p>
          </div>
        </div>

        <div className="space-y-4 bg-black/40 border border-white/10 p-4 rounded-2xl">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Gravitational Constant (G Scale): {gravScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={gravScale}
              onChange={(e) => setGravScale(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between">
              <span>Thermal Scaling Factor: {thermalScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={thermalScale}
              onChange={(e) => {
                const val = Number(e.target.value);
                setThermalScale(val);
                engine.temp *= val;
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>
        </div>

        <ResearchDataExporter engine={engine} />
      </div>
    </div>
  );
}
