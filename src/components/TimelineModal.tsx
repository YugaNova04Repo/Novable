import React, { useState } from 'react';
import { X, History, RotateCcw } from 'lucide-react';
import { UniverseSnapshot } from '../game/Engine';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  snapshots: UniverseSnapshot[];
  onRestoreSnapshot: (snapshot: UniverseSnapshot) => void;
  onClose: () => void;
}

export default function TimelineModal({ snapshots, onRestoreSnapshot, onClose }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number>(snapshots.length - 1);

  if (snapshots.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 pointer-events-auto">
        <div className="relative w-full max-w-md bg-[#0F141E] border border-white/15 rounded-3xl p-6 text-white text-center space-y-4">
          <History size={32} className="mx-auto text-cyan-400 opacity-60" />
          <h3 className="font-bold text-lg">No Time Snapshots Recorded Yet</h3>
          <p className="text-xs text-white/60 font-mono">
            The universe records timeline snapshots every 5 seconds. Continue running the simulation to build history!
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-mono text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentSnap = snapshots[Math.min(selectedIndex, snapshots.length - 1)] || snapshots[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 pointer-events-auto">
      <div className="relative w-full max-w-lg bg-[#0F141E] border border-white/15 rounded-3xl p-6 text-white shadow-2xl space-y-6 font-mono text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Timeline Scrubber (Time-Rewind)</h2>
            <p className="text-[10px] text-white/50">Scrub backward through recorded universe state history</p>
          </div>
        </div>

        <div className="space-y-4 bg-black/40 border border-white/10 p-4 rounded-2xl">
          <div className="flex justify-between text-cyan-300">
            <span>Snapshot #{selectedIndex + 1} / {snapshots.length}</span>
            <span>T = {Math.floor(currentSnap.time / 1000)}s</span>
          </div>

          <input
            type="range"
            min="0"
            max={snapshots.length - 1}
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-white/70">
            <div>Particles: {currentSnap.particles.length}</div>
            <div>Temp: {Math.round(currentSnap.temp)} K</div>
          </div>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            onRestoreSnapshot(currentSnap);
            onClose();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <RotateCcw size={16} />
          <span>Resume Universe From This Point</span>
        </button>
      </div>
    </div>
  );
}
