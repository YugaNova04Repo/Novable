import React from 'react';
import { Play, Pause, FastForward, RotateCcw, Volume2, VolumeX, Settings, Menu, Thermometer, Gauge, BookOpen, Trophy, Sliders } from 'lucide-react';
import { Epoch } from '../game/types';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  currentEpoch: Epoch;
  discoveredCount: number;
  totalElements: number;
  temp: number;
  pressure: number;
  universeAge: number;
  kineticEnergy: number;
  isPaused: boolean;
  timeWarp: number;
  muted: boolean;
  onTogglePause: () => void;
  onCycleTimeWarp: () => void;
  onClearCrucible: () => void;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenBlueprints: () => void;
  onOpenChallenges: () => void;
  onOpenTimeline: () => void;
  onOpenLab: () => void;
  onReturnToTitle: () => void;
  onToggleEnvDeck: () => void;
}

export default function Header({
  currentEpoch,
  discoveredCount,
  totalElements,
  temp,
  pressure,
  universeAge,
  kineticEnergy,
  isPaused,
  timeWarp,
  muted,
  onTogglePause,
  onCycleTimeWarp,
  onClearCrucible,
  onToggleMute,
  onOpenSettings,
  onOpenBlueprints,
  onOpenChallenges,
  onOpenTimeline,
  onOpenLab,
  onReturnToTitle,
  onToggleEnvDeck
}: Props) {
  const progress = Math.min(100, (discoveredCount / currentEpoch.requiredDiscoveries) * 100);

  const formatAge = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  return (
    <header className="relative z-20 bg-[#0F141E]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
      {/* Left: Menu & Epoch */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            soundEngine.playClick();
            onReturnToTitle();
          }}
          title="Return to Main Menu"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <Menu size={18} />
        </button>

        <div className="flex flex-col gap-1 min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-mono tracking-wider text-cyan-400">
            <span>{currentEpoch.title}</span>
            <span className="text-white/50">{currentEpoch.subtitle}</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle: Interactive Telemetry Bar */}
      <div className="flex items-center gap-4 bg-black/40 px-4 py-1.5 rounded-xl border border-white/5 font-mono text-xs flex-wrap justify-center">
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenTimeline();
          }}
          className="flex flex-col text-left hover:bg-white/5 px-2 py-1 rounded-lg transition-all cursor-pointer group"
          title="Open Timeline Scrubber (Time-Rewind)"
        >
          <span className="text-white/40 text-[10px]">TIME (T)</span>
          <span className="text-cyan-300 font-bold group-hover:underline">{formatAge(universeAge)}</span>
        </button>
        <div className="w-px h-6 bg-white/10" />

        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleEnvDeck();
          }}
          className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-lg transition-all cursor-pointer group"
          title="Toggle Environmental Deck"
        >
          <Thermometer size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col text-left">
            <span className="text-white/40 text-[10px]">TEMP</span>
            <span className="font-bold text-amber-300">{temp.toLocaleString()} K</span>
          </div>
        </button>

        <div className="w-px h-6 bg-white/10" />

        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleEnvDeck();
          }}
          className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-lg transition-all cursor-pointer group"
          title="Toggle Environmental Deck"
        >
          <Gauge size={14} className="text-fuchsia-400 group-hover:scale-110 transition-transform" />
          <div className="flex flex-col text-left">
            <span className="text-white/40 text-[10px]">PRESSURE</span>
            <span className="font-bold text-fuchsia-300">{pressure.toFixed(1)} GPa</span>
          </div>
        </button>

        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/40 text-[10px]">KINETIC ENERGY</span>
          <span className="text-cyan-300 font-bold">{kineticEnergy > 1000 ? `${(kineticEnergy / 1000).toFixed(1)}k` : kineticEnergy.toFixed(0)} J</span>
        </div>

        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/40 text-[10px]">CODEX</span>
          <span className="text-green-300 font-bold">{discoveredCount} / {totalElements}</span>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenBlueprints();
          }}
          title="Recipe Blueprints & Tech-Tree"
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 text-white/70 transition-all"
        >
          <BookOpen size={16} />
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenChallenges();
          }}
          title="Sandbox Challenge Scenarios"
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-amber-500/20 hover:text-amber-300 text-white/70 transition-all"
        >
          <Trophy size={16} />
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenLab();
          }}
          title="Advanced Physics Research Lab"
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 text-white/70 transition-all"
        >
          <Sliders size={16} />
        </button>

        <button
          onClick={onTogglePause}
          title={isPaused ? "Resume" : "Pause"}
          className={`p-2 rounded-lg border transition-all ${isPaused ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>

        <button
          onClick={onCycleTimeWarp}
          title="Time Warp"
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-mono text-xs text-cyan-400 flex items-center gap-1.5"
        >
          <FastForward size={14} />
          <span>{timeWarp}x</span>
        </button>

        <button
          onClick={onClearCrucible}
          title="Clear Crucible"
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 text-white/70 transition-all"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={onToggleMute}
          title={muted ? "Unmute Audio" : "Mute Audio"}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenSettings();
          }}
          title="System Settings / Save"
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
