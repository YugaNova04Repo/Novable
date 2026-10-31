import React, { useState } from 'react';
import { Milestone } from '../game/types';
import { Target, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  milestones: Milestone[];
}

export default function MilestoneWidget({ milestones }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const activeMilestone = milestones.find(m => !m.completed) || milestones[milestones.length - 1];

  return (
    <div className="absolute top-20 left-4 z-10 w-80 bg-[#0F141E]/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-white shadow-2xl pointer-events-auto">
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
          <Target size={16} />
          <span>Active Objective</span>
        </div>
        <button className="text-white/60 hover:text-white">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-2">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-white/90">{activeMilestone.title}</h4>
                <p className="text-xs text-white/60 mt-0.5">{activeMilestone.description}</p>
              </div>
              {activeMilestone.completed ? (
                <CheckCircle2 size={18} className="text-green-400 shrink-0" />
              ) : (
                <Circle size={18} className="text-white/30 shrink-0" />
              )}
            </div>
            <div className="mt-2 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded inline-block border border-cyan-500/20">
              Reward: {activeMilestone.reward}
            </div>
          </div>

          <div className="text-[10px] text-white/40 text-center font-mono">
            Milestones completed: {milestones.filter(m => m.completed).length} / {milestones.length}
          </div>
        </div>
      )}
    </div>
  );
}
