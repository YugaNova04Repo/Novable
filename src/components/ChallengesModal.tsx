import React, { useState } from 'react';
import { X, Trophy, Play, CheckCircle2 } from 'lucide-react';
import { CHALLENGES, ChallengeScenario } from '../game/constants';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  onStartChallenge: (challenge: ChallengeScenario) => void;
  onClose: () => void;
}

export default function ChallengesModal({ onStartChallenge, onClose }: Props) {
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('genesis_completed_challenges');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-[#0F141E] border border-white/15 rounded-3xl p-6 text-white shadow-2xl max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Sandbox Challenge Scenarios</h2>
            <p className="text-xs text-white/50 font-mono">Test your thermodynamic & chemical mastery across 5 timed puzzles</p>
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {CHALLENGES.map(ch => {
            const isCompleted = completedIds.includes(ch.id);
            return (
              <div
                key={ch.id}
                className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{ch.title}</h3>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-500/30">
                        <CheckCircle2 size={12} />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 font-sans">{ch.description}</p>
                  <div className="text-[10px] text-cyan-300">Reward: {ch.rewardText} · Time Limit: {ch.timeLimitSeconds}s</div>
                </div>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onStartChallenge(ch);
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center gap-2 shrink-0 transition-all shadow-lg"
                >
                  <Play size={14} />
                  <span>Launch Scenario</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
