import React from 'react';
import { X, ChevronRight, HelpCircle } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  step: number; // 1 to 5
  onNext: () => void;
  onSkip: () => void;
}

export default function TutorialOverlay({ step, onNext, onSkip }: Props) {
  const steps = [
    {
      title: 'Step 1: The Big Bang',
      text: 'Welcome to Genesis. You hold the rules of reality. Tap Continue to trigger the Big Bang (T=0).'
    },
    {
      title: 'Step 2: The Crucible',
      text: 'Energy and quarks are expanding! Drag or fling particles across the canvas to watch them collide and fuse.'
    },
    {
      title: 'Step 3: Environmental Deck',
      text: 'Temperature and pressure dictate reality. Tap TEMP or PRESSURE in the header to open the Environmental Deck and adjust thermal states.'
    },
    {
      title: 'Step 4: The Codex Drawer',
      text: 'Every discovered particle or element is cataloged here. Click any badge to inspect its scientific lore or spawn it.'
    },
    {
      title: 'Step 5: Active Milestones',
      text: 'Complete milestones to unlock powerful catalysts and advance through the 5 Cosmic Epochs. Good luck!'
    }
  ];

  const current = steps[step - 1] || steps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
      <div className="relative w-full max-w-md bg-[#0F141E] border border-cyan-500/40 rounded-3xl p-6 text-white shadow-2xl font-mono space-y-4">
        <button
          onClick={() => {
            soundEngine.playClick();
            onSkip();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-cyan-300">{current.title}</h3>
            <div className="text-[10px] text-white/50">Guided Onboarding Tutorial ({step} / 5)</div>
          </div>
        </div>

        <p className="text-white/80 font-sans text-sm leading-relaxed">
          {current.text}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={() => {
              soundEngine.playClick();
              onSkip();
            }}
            className="text-xs text-white/50 hover:text-white"
          >
            Skip Tutorial
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onNext();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
          >
            <span>{step === 5 ? 'Start Exploring' : 'Next Step'}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
