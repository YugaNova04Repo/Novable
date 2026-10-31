import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Atom, CheckCircle2, Lock, Grid, Sparkles, Sun } from 'lucide-react';
import { EPOCHS, ELEMENTS, REACTION_RULES } from '../game/constants';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  discovered: Set<string>;
  onBack: () => void;
}

export default function BlueprintsPage({ discovered, onBack }: Props) {
  const [selectedEpochId, setSelectedEpochId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'reactions' | 'periodic' | 'hrChart'>('reactions');

  const chemicalElements = Object.values(ELEMENTS).filter(el => el.category === 'element' && el.atomicNumber);
  const astrophysicsObjects = Object.values(ELEMENTS).filter(el => el.category === 'astrophysics');

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
            <h1 className="text-lg font-bold">Genesis Codex & Scientific Matrices</h1>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-2xl font-mono text-xs">
          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('reactions'); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all ${
              activeTab === 'reactions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Atom size={14} />
            <span>Reaction Blueprints</span>
          </button>

          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('periodic'); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all ${
              activeTab === 'periodic'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Grid size={14} />
            <span>Periodic Table Matrix</span>
          </button>

          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('hrChart'); }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all ${
              activeTab === 'hrChart'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sun size={14} />
            <span>H-R Stellar Chart</span>
          </button>
        </div>

        <div className="font-mono text-xs text-cyan-300">
          Discovered: {discovered.size} / {Object.keys(ELEMENTS).length}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'reactions' ? (
          <>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
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
                                  {rule.inputs.map((inp, i) => {
                                    const inDef = ELEMENTS[inp];
                                    return (
                                      <React.Fragment key={i}>
                                        <span
                                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-bold"
                                          style={{ color: inDef?.color || '#ffffff' }}
                                        >
                                          {inDef?.name || inp}
                                        </span>
                                        {i < rule.inputs.length - 1 && <span className="text-white/40">+</span>}
                                      </React.Fragment>
                                    );
                                  })}
                                </div>
                                <span className="text-cyan-400">→</span>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                  {isOutputDiscovered ? (
                                    <>
                                      <CheckCircle2 size={16} className="text-green-400" />
                                      <span className="font-bold text-white/90">{outputDef?.name} ({outputDef?.symbol})</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock size={16} className="text-white/30" />
                                      <span className="italic text-white/40">??? Locked Discovery</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-white/60 font-sans">{rule.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </>
        ) : activeTab === 'periodic' ? (
          /* Periodic Table Matrix */
          <div className="flex-1 p-6 overflow-y-auto font-mono">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="bg-[#0F141E]/80 border border-white/10 p-6 rounded-3xl">
                <h2 className="text-2xl font-bold font-sans">Interactive Periodic Table Matrix</h2>
                <p className="text-xs text-white/60 mt-1">Chemical elements organized by atomic number and group valence states.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {chemicalElements.map(el => {
                  const isDiscovered = el.unlockedByDefault || discovered.has(el.id);
                  return (
                    <div
                      key={el.id}
                      className={`p-3 rounded-2xl border flex flex-col justify-between h-28 transition-all ${
                        isDiscovered
                          ? 'bg-white/5 border-white/15 hover:border-cyan-500/50 shadow-lg'
                          : 'bg-black/40 border-white/5 opacity-40'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-white/40">
                        <span>Z={el.atomicNumber}</span>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isDiscovered ? el.color : '#475569' }} />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: isDiscovered ? el.color : '#94A3B8' }}>
                          {isDiscovered ? el.symbol : '?'}
                        </div>
                        <div className="text-[10px] truncate text-white/80 mt-1">
                          {isDiscovered ? el.name : 'Locked'}
                        </div>
                      </div>
                      <div className="text-[9px] text-white/40 text-center">
                        {isDiscovered ? `${el.mass} u` : '???'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Hertzsprung-Russell Stellar Chart */
          <div className="flex-1 p-6 overflow-y-auto font-mono">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-[#0F141E]/80 border border-white/10 p-6 rounded-3xl">
                <h2 className="text-2xl font-bold font-sans">Hertzsprung-Russell Stellar Evolution Chart</h2>
                <p className="text-xs text-white/60 mt-1">Mapping stellar luminosity against effective core temperature.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {astrophysicsObjects.map(obj => {
                  const isDiscovered = obj.unlockedByDefault || discovered.has(obj.id);
                  return (
                    <div
                      key={obj.id}
                      className={`p-5 rounded-2xl border flex items-center gap-4 transition-all ${
                        isDiscovered
                          ? 'bg-white/5 border-white/15'
                          : 'bg-black/40 border-white/5 opacity-40'
                      }`}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg border border-white/20 shrink-0"
                        style={{ backgroundColor: isDiscovered ? `${obj.color}22` : '#1E293B', color: isDiscovered ? obj.color : '#64748B' }}
                      >
                        {isDiscovered ? obj.symbol : '?'}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-white/90">{isDiscovered ? obj.name : 'Unknown Cosmic Structure'}</div>
                        <div className="text-[11px] text-cyan-400">Core Temp: {isDiscovered && obj.boilingPoint ? `${obj.boilingPoint.toLocaleString()} K` : '???'}</div>
                        <p className="text-xs text-white/60 font-sans leading-relaxed">{isDiscovered ? obj.description : 'Synthesize heavy elements and stellar precursors to unlock.'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
