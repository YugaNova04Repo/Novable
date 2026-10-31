import React from 'react';
import { Play, Pause, FastForward, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';
import { Epoch } from '../game/types';

interface Props {
  currentEpoch: Epoch;
  discoveredCount: number;
  totalElements: number;
  temp: number;
  pressure: number;
  universeAge: number;
  isPaused: boolean;
  timeWarp: number;
  muted: boolean;
  onTogglePause: () => void;
  onCycleTimeWarp: () => void;
  onClearCrucible: () => void;
  onToggleMute: () => void;
  onOpenSettings: () => void;
}

export default function Header({
  currentEpoch,
  discoveredCount,
  totalElements,
  temp,
  pressure,
  universeAge,
  isPaused,
  timeWarp,
  muted,
  onTogglePause,
  onCycleTimeWarp,
  onClearCrucible,
  onToggleMute,
  onOpenSettings
}: Props) {
  const progress = Math.min(100, (discoveredCount / currentEpoch.requiredDiscoveries) * 100);

  // Format universe age
  const formatAge = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  return (
    <header className="relative z-20 bg-[#0F141E]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-white">
      {/* Epoch & Progress */}
      <div className="flex flex-col gap-1 min-w-[280px]">
        <div className="flex items-center justify-between text-xs font-mono tracking-wider text-cyan-400">
          <span>{currentEpoch.title}</span>
          <span>{currentEpoch.subtitle}</span>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Live Telemetry */}
      <div className="flex items-center gap-6 bg-black/40 px-4 py-1.5 rounded-xl border border-white/5 font-mono text-xs">
        <div className="flex flex-col">
          <span className="text-white/40 text-[10px]">TIME (T)</span>
          <span className="text-cyan-300 font-bold">{formatAge(universeAge)}</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/40 text-[10px]">TEMP</span>
          <span className={`font-bold ${temp > 5000 ? 'text-red-400 animate-pulse' : temp < 300 ? 'text-cyan-200' : 'text-amber-300'}`}>
            {temp.toLocaleString()} K
          </span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/40 text-[10px]">PRESSURE</span>
          <span className="text-fuchsia-300 font-bold">{pressure.toFixed(1)} GPa</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/40 text-[10px]">CODEX</span>
          <span className="text-green-300 font-bold">{discoveredCount} / {totalElements}</span>
        </div>
      </div>

      {/* Quick Controls */}
      <div className="flex items-center gap-2">
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
          onClick={onOpenSettings}
          title="Settings / Big Crunch"
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
