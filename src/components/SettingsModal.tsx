import React from 'react';
import { X, RotateCcw, Volume2, ShieldAlert } from 'lucide-react';

interface Props {
  muted: boolean;
  onToggleMute: () => void;
  onResetUniverse: () => void;
  onClose: () => void;
}

export default function SettingsModal({ muted, onToggleMute, onResetUniverse, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="relative w-full max-w-md bg-[#0F141E] border border-white/15 rounded-3xl p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold mb-6">Genesis Settings & Big Crunch</h2>

        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
            <span>Audio Synthesizer</span>
            <button
              onClick={onToggleMute}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2"
            >
              <Volume2 size={16} />
              <span>{muted ? 'Muted' : 'Active'}</span>
            </button>
          </div>

          <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <ShieldAlert size={16} />
              <span>Reset Universe (Big Crunch)</span>
            </div>
            <p className="text-white/70 font-sans text-xs">
              Warning: Initiating a Big Crunch will collapse the spacetime continuum, resetting all discovered elements, milestones, and universe age back to T = 0.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Are you certain you want to trigger a Big Crunch?')) {
                  onResetUniverse();
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <RotateCcw size={16} />
              <span>Initiate Big Crunch</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
