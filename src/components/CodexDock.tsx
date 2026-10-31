import React, { useState } from 'react';
import { Category, ElementDefinition } from '../game/types';
import { ELEMENTS } from '../game/constants';
import { Search, Sparkles, Atom, Beaker, Globe, Shield, ChevronUp, ChevronDown, BookOpen, Copy, Download, Upload, Check } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';
import { GameEngine } from '../game/Engine';

interface Props {
  engine: GameEngine;
  discovered: Set<string>;
  activeSpawnElementId: string;
  onSelectSpawnElement: (elementId: string) => void;
  onSpawnElement: (elementId: string, x: number, y: number) => void;
  onInspect: (element: ElementDefinition) => void;
}

export default function CodexDock({
  engine,
  discovered,
  activeSpawnElementId,
  onSelectSpawnElement,
  onSpawnElement,
  onInspect
}: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Category | 'all' | 'stamps'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [importCodeInput, setImportCodeInput] = useState('');
  const [copiedStampId, setCopiedStampId] = useState<string | null>(null);

  const categories: { id: Category | 'all' | 'stamps'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <Sparkles size={14} /> },
    { id: 'quantum', label: 'Quantum', icon: <Atom size={14} /> },
    { id: 'subatomic', label: 'Subatomic', icon: <Shield size={14} /> },
    { id: 'element', label: 'Elements', icon: <Atom size={14} /> },
    { id: 'molecule', label: 'Molecules', icon: <Beaker size={14} /> },
    { id: 'astrophysics', label: 'Cosmic', icon: <Globe size={14} /> },
    { id: 'stamps', label: 'Custom Stamps', icon: <Copy size={14} /> },
  ];

  const filteredElements = Object.values(ELEMENTS).filter(el => {
    const isDiscovered = el.unlockedByDefault || discovered.has(el.id);
    if (!isDiscovered) return false;

    if (activeTab !== 'all' && activeTab !== 'stamps' && el.category !== activeTab) return false;

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
    onSelectSpawnElement(el.id);
    onSpawnElement(el.id, window.innerWidth / 2 + (Math.random() - 0.5) * 80, window.innerHeight / 2 + (Math.random() - 0.5) * 80);
  };

  const handleExportStampCode = (stamp: { id: string; name: string; code: string }) => {
    soundEngine.playClick();
    navigator.clipboard.writeText(stamp.code);
    setCopiedStampId(stamp.id);
    setTimeout(() => setCopiedStampId(null), 2000);
  };

  const handleImportStamp = () => {
    if (!importCodeInput.trim()) return;
    soundEngine.playClick();
    const success = engine.importStampCode(importCodeInput.trim(), window.innerWidth / 2, window.innerHeight / 2);
    if (success) {
      alert('Custom Stamp imported and spawned into the crucible!');
      setImportCodeInput('');
    } else {
      alert('Invalid GEN-STAMP code format.');
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-5xl bg-[#0F141E]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white shadow-2xl pointer-events-auto transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-white/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
          <BookOpen size={16} />
          <span>Codex Drawer ({discovered.size} Discovered)</span>
        </div>
        <button className="text-white/60 hover:text-white">
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {/* Top Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={(e) => {
                    e.stopPropagation();
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
            {activeTab !== 'stamps' && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search Codex..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 w-44"
                />
              </div>
            )}
          </div>

          {/* Content Area */}
          {activeTab === 'stamps' ? (
            <div className="space-y-4 py-2 font-mono text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste GEN-STAMP-... Code"
                  value={importCodeInput}
                  onChange={(e) => setImportCodeInput(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  onClick={handleImportStamp}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>Import Stamp</span>
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto py-1 scrollbar-thin">
                {engine.customStamps.length === 0 ? (
                  <div className="w-full text-center py-4 text-xs font-mono text-white/40">
                    No custom stamps saved yet. Use the Lasso tool to select particles and save an assembly stamp!
                  </div>
                ) : (
                  engine.customStamps.map(stamp => (
                    <div
                      key={stamp.id}
                      className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-3 w-52 space-y-2"
                    >
                      <div className="font-bold text-cyan-300 truncate">{stamp.name}</div>
                      <div className="text-[10px] text-white/50">{stamp.elements.length} unique element types</div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            engine.importStampCode(stamp.code, window.innerWidth / 2, window.innerHeight / 2);
                          }}
                          className="flex-1 py-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-300 hover:bg-cyan-500/30 text-[10px]"
                        >
                          Spawn Assembly
                        </button>
                        <button
                          onClick={() => handleExportStampCode(stamp)}
                          className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/70"
                          title="Export Stamp Code to Clipboard"
                        >
                          {copiedStampId === stamp.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Element Badges Grid */
            <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-thin">
              {filteredElements.length === 0 ? (
                <div className="w-full text-center py-4 text-xs font-mono text-white/40">
                  No matching elements discovered yet. Explore reactions in the crucible!
                </div>
              ) : (
                filteredElements.map(el => {
                  const isSelected = activeSpawnElementId === el.id;
                  return (
                    <div
                      key={el.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, el.id)}
                      onClick={() => handleBadgeClick(el)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onInspect(el);
                      }}
                      className={`group relative shrink-0 w-20 h-24 rounded-xl p-2 flex flex-col items-center justify-between cursor-grab active:cursor-grabbing transition-all hover:scale-105 border ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 hover:bg-white/10 border-white/10'
                      }`}
                    >
                      <div className="w-full flex justify-between items-center text-[9px] font-mono text-white/40">
                        <span>{el.atomicNumber || '—'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEngine.playClick();
                            onInspect(el);
                          }}
                          title="Inspect & View Feynman Diagram"
                          className="text-white/40 hover:text-cyan-400 transition-colors"
                        >
                          <Atom size={12} />
                        </button>
                      </div>

                      <div className="text-lg font-bold font-mono tracking-tight" style={{ color: el.color }}>
                        {el.symbol}
                      </div>

                      <div className="w-full text-center truncate text-[10px] font-medium text-white/80 group-hover:text-cyan-300">
                        {el.name}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
