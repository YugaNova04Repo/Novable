import React from 'react';
import { Play, Pause, FastForward, RotateCcw, Volume2, VolumeX, Settings, Menu, Thermometer, Gauge, BookOpen, Trophy, Sliders, Camera } from 'lucide-react';
import { Epoch } from '../game/types';
import { soundEngine } from '../game/SoundEngine';
import NovaGenLogo from './NovaGenLogo';

interface Props {
  currentEpoch: Epoch;
  discoveredCount: number;
  totalElements: number;
  temp: number;
  pressure: number;
  universeAge: number;
  kineticEnergy: number;
  entropy: number;
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
  entropy,
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

  const handleTakeSnapshot = () => {
    soundEngine.playClick();
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    // Create export composite canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height + 60;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Draw main game canvas
    ctx.drawImage(canvas, 0, 0);

    // Draw bottom telemetry legend banner
    ctx.fillStyle = '#0F141E';
    ctx.fillRect(0, canvas.height, canvas.width, 60);

    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`NOVAGEN v0.0.4: THE QUANTUM & COSMIC RULE ENGINE — ${currentEpoch.title}`, 20, canvas.height + 25);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px monospace';
    ctx.fillText(`Temp: ${temp} K | Pressure: ${pressure.toFixed(1)} GPa | Entropy: ${entropy.toFixed(1)} k_B | Discovered: ${discoveredCount}/${totalElements}`, 20, canvas.height + 45);

    const link = document.createElement('a');
    link.download = `novagen-lab-snapshot-${Math.floor(Date.now() / 1000)}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <header className="relative z-30 w-full bg-[#0F141E]/90 backdrop-blur-md border-b border-white/10 px-3 sm:px-4 py-2 flex items-center justify-between text-white font-mono shadow-2xl select-none">
      {/* Left: Brand & Cosmic Epoch Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => {
            soundEngine.playClick();
            onReturnToTitle();
          }}
          className="flex items-center hover:opacity-80 transition-opacity"
          title="Return to NovaGen Title Screen"
        >
          <NovaGenLogo size={32} showText={true} versionBadge="v0.0.4" />
        </button>

        <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/40 uppercase tracking-wider">{currentEpoch.subtitle}</span>
            <span className="text-xs font-bold text-cyan-300">{currentEpoch.title}</span>
          </div>
          <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Middle: Real-time Telemetry readouts */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
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
            <span className="font-bold text-amber-300">{temp > 10000 ? `${(temp / 1000).toFixed(1)}k` : temp} K</span>
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
          <span className="text-white/40 text-[10px]">ENTROPY (S)</span>
          <span className="text-amber-300 font-bold">{entropy.toFixed(1)} k_B</span>
        </div>

        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-white/40 text-[10px]">CODEX</span>
          <span className="text-green-300 font-bold">{discoveredCount} / {totalElements}</span>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={handleTakeSnapshot}
          title="Export Lab Snapshot PNG"
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 text-white/70 transition-all"
        >
          <Camera size={16} />
        </button>

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
          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 font-mono text-xs text-cyan-400 flex items-center gap-1"
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
