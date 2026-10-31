import React from 'react';
import { Power, Sparkles } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  onWake: () => void;
}

export default function HibernationScreen({ onWake }: Props) {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-[#05070A] text-white p-6 select-none">
      <div className="max-w-md w-full bg-[#0F141E]/90 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
          <Power size={32} className="animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Simulation Hibernating</h2>
          <p className="text-xs text-white/60 font-mono leading-relaxed">
            All quantum states and spacetime variables are safely stored. It is safe to close this tab or keep it in standby mode.
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            onWake();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
        >
          <Sparkles size={18} />
          <span>Wake Simulation</span>
        </button>
      </div>
    </div>
  );
}
