import React from 'react';
import { X, Thermometer, Gauge } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  temp: number;
  pressure: number;
  onChangeTemp: (newTemp: number) => void;
  onChangePressure: (newPress: number) => void;
  onClose: () => void;
}

export default function EnvironmentalDeck({ temp, pressure, onChangeTemp, onChangePressure, onClose }: Props) {
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-96 bg-[#0F141E]/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 text-white shadow-2xl pointer-events-auto font-mono text-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <span className="text-cyan-400 font-bold uppercase tracking-wider">Environmental Control Deck</span>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Temperature Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-amber-300">
            <Thermometer size={14} />
            <span>Temperature: {temp.toLocaleString()} K</span>
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100000"
          step="100"
          value={temp}
          onChange={(e) => onChangeTemp(Number(e.target.value))}
          className="w-full accent-amber-400 cursor-pointer"
        />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => { soundEngine.playClick(); onChangeTemp(10); }}
            className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300"
          >
            Absolute Zero
          </button>
          <button
            onClick={() => { soundEngine.playClick(); onChangeTemp(3000); }}
            className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300"
          >
            Cool (3k K)
          </button>
          <button
            onClick={() => { soundEngine.playClick(); onChangeTemp(50000); }}
            className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-red-400"
          >
            Core (50k K)
          </button>
        </div>
      </div>

      {/* Pressure Control */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-fuchsia-300">
            <Gauge size={14} />
            <span>Pressure: {pressure.toFixed(1)} GPa</span>
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="500"
          step="1"
          value={pressure}
          onChange={(e) => onChangePressure(Number(e.target.value))}
          className="w-full accent-fuchsia-400 cursor-pointer"
        />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => { soundEngine.playClick(); onChangePressure(1); }}
            className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
          >
            Vacuum (1 GPa)
          </button>
          <button
            onClick={() => { soundEngine.playClick(); onChangePressure(100); }}
            className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"
          >
            Mantle (100 GPa)
          </button>
          <button
            onClick={() => { soundEngine.playClick(); onChangePressure(500); }}
            className="py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-fuchsia-300"
          >
            Core (500 GPa)
          </button>
        </div>
      </div>
    </div>
  );
}
