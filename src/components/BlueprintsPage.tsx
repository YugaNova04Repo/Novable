import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Atom, CheckCircle2, Lock } from 'lucide-react';
import { EPOCHS, ELEMENTS, REACTION_RULES } from '../game/constants';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  discovered: Set<string>;
  onBack: () => void;
}

export default function BlueprintsPage({ discovered, onBack }: Props) {
  const [selectedEpochId, setSelectedEpochId] = useState<number>(1);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090E] text-white overflow-hidden select-none">
      {/* Top Bar */}
      <div className="bg-[#0F141E]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onBack();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-cyan-400" />
            <h1 className="text-lg font-bold">Genesis Codex & Recipe Blueprints</h1>
          </div>
        </div>

        <div className="font-mono text-xs text-cyan-300">
          Discovered: {discovered.size} / {Object.keys(ELEMENTS).length}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Epoch Navigation Sidebar */}
        <div className="w-80 border-r border-white/10 bg-[#0A0E17] p-4 overflow-y-auto space-y-3">
          <div className="text-xs font-mono text-white/40 px-2 uppercase tracking-wider">Cosmic Epochs</div>
          {EPOCHS.map(epoch => {
            const isSelected = selectedEpochId === epoch.id;
            return (
              <button
                key={epoch.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedEpochId(epoch.id);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-lg'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/80'
                }`}
              >
                <div className="font-mono text-[10px] text-cyan-400 mb-1">{epoch.subtitle}</div>
                <div className="font-bold text-sm">{epoch.title}</div>
                <div className="text-xs text-white/50 mt-1 line-clamp-2">{epoch.description}</div>
              </button>
            );
          })}
        </div>

        {/* Recipe & Element Details */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {(() => {
            const epoch = EPOCHS.find(e => e.id === selectedEpochId)!;
            return (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-[#0F141E]/80 border border-white/10 p-6 rounded-3xl space-y-2">
                  <div className="font-mono text-xs text-cyan-400">{epoch.subtitle}</div>
                  <h2 className="text-2xl font-bold">{epoch.title}</h2>
                  <p className="text-sm text-white/70">{epoch.description}</p>
                </div>

                {/* Reaction Blueprints for this Epoch tier */}
                <div className="space-y-3">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-white/50 flex items-center gap-2">
                    <Atom size={14} className="text-fuchsia-400" />
                    <span>Reaction Blueprints & Syntheses</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REACTION_RULES.map((rule, idx) => {
                      const outputDef = ELEMENTS[rule.output];
                      const isOutputDiscovered = outputDef && (outputDef.unlockedByDefault || discovered.has(outputDef.id));

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                            isOutputDiscovered
                              ? 'bg-white/5 border-white/10'
                              : 'bg-white/[0.02] border-white/5 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-wrap">
                              {rule.inputs.map((inputId, i) => {
                                const inputDef = ELEMENTS[inputId];
                                return (
                                  <React.Fragment key={i}>
                                    {i > 0 && <span className="text-white/40 text-xs">+</span>}
                                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 font-mono text-xs font-bold" style={{ color: inputDef?.color || '#fff' }}>
                                      {inputDef?.symbol || inputId}
                                    </span>
                                  </React.Fragment>
                                );
                              })}
                              <span className="text-cyan-400 font-bold">→</span>
                              <span className="px-3 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 font-mono text-xs font-bold" style={{ color: outputDef?.color || '#00F0FF' }}>
                                {outputDef?.symbol || rule.output}
                              </span>
                            </div>

                            {isOutputDiscovered ? (
                              <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                            ) : (
                              <Lock size={16} className="text-white/30 shrink-0" />
                            )}
                          </div>

                          <div className="text-xs text-white/70 font-sans">
                            {rule.description}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5 font-mono text-[10px] text-white/50">
                            {rule.minTemp && <span>Min Temp: {rule.minTemp}K</span>}
                            {rule.maxTemp && <span>Max Temp: {rule.maxTemp}K</span>}
                            {rule.minPressure && <span>Min Press: {rule.minPressure} GPa</span>}
                            <span className="text-cyan-300">ΔE: {rule.energyChange} MeV</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
