import React from 'react';
import { ToolType, ElementDefinition } from '../game/types';
import { Hand, Magnet, Zap, Snowflake, Brush, Eye, Trash2, Sparkles, SquareDashedMousePointer } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';
import { ELEMENTS } from '../game/constants';

interface Props {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  activeSpawnElementId: string;
}

export default function Toolbelt({ activeTool, setActiveTool, activeSpawnElementId }: Props) {
  const tools: { id: ToolType; label: string; icon: React.ReactNode }[] = [
    { id: 'grab', label: 'Grab & Sling', icon: <Hand size={18} /> },
    { id: 'attractor', label: 'Gravity Well', icon: <Magnet size={18} /> },
    { id: 'laser', label: 'Thermal Laser (+Heat)', icon: <Zap size={18} /> },
    { id: 'cryo', label: 'Cryo-Beam (-Heat)', icon: <Snowflake size={18} /> },
    { id: 'spawn', label: 'Spawn Brush', icon: <Brush size={18} /> },
    { id: 'inspector', label: 'Inspector', icon: <Eye size={18} /> },
    { id: 'eraser', label: 'Antimatter Eraser', icon: <Trash2 size={18} /> },
    { id: 'spectroscope', label: 'Spectroscope Analyzer', icon: <Sparkles size={18} /> },
    { id: 'lasso', label: 'Lasso Stamp Selector', icon: <SquareDashedMousePointer size={18} /> },
  ];

  const activeDef: ElementDefinition = ELEMENTS[activeSpawnElementId] || ELEMENTS['hydrogen'];

  return (
    <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1 sm:gap-1.5 bg-[#0F141E]/85 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 sm:p-2 shadow-2xl pointer-events-auto max-h-[85vh] overflow-y-auto scrollbar-none">
      <div className="text-[9px] font-mono uppercase tracking-wider text-center text-white/40 pb-1 border-b border-white/10 hidden sm:block">
        Tools
      </div>

      {tools.map(tool => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => {
              soundEngine.playClick();
              setActiveTool(tool.id);
            }}
            title={tool.label}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isActive
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-lg'
                : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white/70 hover:text-white'
            }`}
          >
            {tool.icon}
          </button>
        );
      })}

      {activeTool === 'spawn' && (
        <div className="pt-2 border-t border-white/10 flex flex-col items-center">
          <div className="text-[8px] font-mono text-white/40 mb-1">ACTIVE</div>
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-xs border border-white/20 shadow-inner"
            style={{ backgroundColor: `${activeDef.color}33`, color: activeDef.color }}
            title={activeDef.name}
          >
            {activeDef.symbol}
          </div>
        </div>
      )}
    </div>
  );
}
