import React, { useState } from 'react';
import { Category, ElementDefinition } from '../game/types';
import { ELEMENTS } from '../game/constants';
import { Search, Sparkles, Atom, Beaker, Globe, Shield } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  discovered: Set<string>;
  onSpawnElement: (elementId: string, x: number, y: number) => void;
  onInspect: (element: ElementDefinition) => void;
}

export default function CodexDock({ discovered, onSpawnElement, onInspect }: Props) {
  const [activeTab, setActiveTab] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: Category | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <Sparkles size={14} /> },
    { id: 'quantum', label: 'Quantum', icon: <Atom size={14} /> },
    { id: 'subatomic', label: 'Subatomic', icon: <Shield size={14} /> },
    { id: 'element', label: 'Elements', icon: <Atom size={14} /> },
    { id: 'molecule', label: 'Molecules', icon: <Beaker size={14} /> },
    { id: 'astrophysics', label: 'Cosmic', icon: <Globe size={14} /> },
  ];

  const filteredElements = Object.values(ELEMENTS).filter(el => {
    const isDiscovered = el.unlockedByDefault || discovered.has(el.id);
    if (!isDiscovered) return false;

    if (activeTab !== 'all' && el.category !== activeTab) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return el.name.toLowerCase().includes(q) || el.symbol.toLowerCase().includes(q);
    }

    return true;
  });

  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.setData('text/plain', elementId);
    soundEngine.playClick();
  };

  const handleBadgeClick = (el: ElementDefinition) => {
    soundEngine.playClick();
    // Spawn in center or near center
    onSpawnElement(el.id, window.innerWidth / 2 + (Math.random() - 0.5) * 60, window.innerHeight / 2 + (Math.random() - 0.5) * 60);
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-4xl bg-[#0F141E]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white shadow-2xl pointer-events-auto">
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveTab(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === cat.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/50 text-cyan-300'
                  : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search Codex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 w-44"
          />
        </div>
      </div>

      {/* Element Badges Grid */}
      <div className="mt-3 flex items-center gap-3 overflow-x-auto py-2 scrollbar-thin">
        {filteredElements.length === 0 ? (
          <div className="w-full text-center py-4 text-xs font-mono text-white/40">
            No matching elements discovered yet. Explore reactions in the crucible!
          </div>
        ) : (
          filteredElements.map(el => (
            <div
              key={el.id}
              draggable
              onDragStart={(e) => handleDragStart(e, el.id)}
              onClick={() => handleBadgeClick(el)}
              onContextMenu={(e) => {
                e.preventDefault();
                onInspect(el);
              }}
              className="group relative shrink-0 w-20 h-24 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-xl p-2 flex flex-col items-center justify-between cursor-grab active:cursor-grabbing transition-all hover:scale-105"
            >
              <div className="w-full flex justify-between items-center text-[9px] font-mono text-white/40">
                <span>{el.atomicNumber || '—'}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: el.color }} />
              </div>

              <div className="text-lg font-bold font-mono tracking-tight" style={{ color: el.color }}>
                {el.symbol}
              </div>

              <div className="w-full text-center truncate text-[10px] font-medium text-white/80 group-hover:text-cyan-300">
                {el.name}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
