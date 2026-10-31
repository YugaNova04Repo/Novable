import React from 'react';
import { Play, RotateCcw, Upload, BookOpen, Power } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';
import NovaGenLogo from './NovaGenLogo';

interface Props {
  hasSave: boolean;
  savedEpochTitle?: string;
  savedDiscoveries?: number;
  totalElements: number;
  onContinue: () => void;
  onNewGame: () => void;
  onOpenImport: () => void;
  onOpenBlueprints: () => void;
  onHibernate: () => void;
}

export default function TitleScreen({
  hasSave,
  savedEpochTitle,
  savedDiscoveries = 0,
  totalElements,
  onContinue,
  onNewGame,
  onOpenImport,
  onOpenBlueprints,
  onHibernate
}: Props) {
  return (
    <div className="relative flex flex-col items-center justify-center h-[100dvh] w-[100dvw] bg-[#07090E] text-white p-6 overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/30 via-transparent to-fuchsia-950/20 pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <NovaGenLogo size={84} />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs tracking-widest uppercase">
            <span>Cosmic Sandbox Simulation Engine</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 font-bold text-[10px]">v0.0.4</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
            NOVAGEN
          </h1>

          <p className="text-xs sm:text-sm text-white/70 font-mono max-w-md">
            The Quantum & Cosmic Rule Engine · From Planck Singularity to Living Biospheres
          </p>
        </div>

        <div className="space-y-3 bg-[#0F141E]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
          {hasSave && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onContinue();
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-3 transition-all shadow-lg group"
            >
              <Play size={20} className="group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div>Continue Universe</div>
                <div className="text-[10px] font-mono text-cyan-200 opacity-80">
                  {savedEpochTitle} · {savedDiscoveries} / {totalElements} Discovered
                </div>
              </div>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              if (hasSave) {
                if (window.confirm('Starting a new game will overwrite your current universe. Proceed?')) {
                  onNewGame();
                }
              } else {
                onNewGame();
              }
            }}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg ${
              hasSave 
                ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white' 
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
            }`}
          >
            <RotateCcw size={20} />
            <span>New Game (Big Bang)</span>
          </button>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenImport();
              }}
              className="py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-mono text-xs text-white/80 flex items-center justify-center gap-2 transition-all"
            >
              <Upload size={16} className="text-fuchsia-400" />
              <span>Import Save</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenBlueprints();
              }}
              className="py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-mono text-xs text-white/80 flex items-center justify-center gap-2 transition-all"
            >
              <BookOpen size={16} className="text-cyan-400" />
              <span>Codex & Blueprints</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onHibernate();
            }}
            className="w-full py-3 rounded-xl bg-red-950/20 border border-red-500/20 hover:bg-red-900/30 font-mono text-xs text-red-300 flex items-center justify-center gap-2 transition-all mt-2"
          >
            <Power size={16} />
            <span>Exit Simulation (Hibernate)</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-white/30">
          NovaGen v0.0.4 · 100% Offline · High-Refresh-Rate Deterministic Engine
        </div>
      </div>
    </div>
  );
}
