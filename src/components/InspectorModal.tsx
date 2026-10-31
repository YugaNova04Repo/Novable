import React, { useState } from 'react';
import { ElementDefinition } from '../game/types';
import { X, Thermometer, Weight, Info, Magnet, Quote } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';
import FeynmanVisualizer from './FeynmanVisualizer';

interface Props {
  element: ElementDefinition | null;
  onClose: () => void;
}

export default function InspectorModal({ element, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'physics' | 'feynman'>('overview');

  if (!element) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="relative w-full max-w-md bg-[#0F141E] border border-white/15 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold font-mono shadow-inner border border-white/20"
            style={{ backgroundColor: `${element.color}22`, color: element.color }}
          >
            {element.symbol}
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              {element.category}
            </div>
            <h2 className="text-2xl font-bold">{element.name}</h2>
            <div className="text-xs text-white/50 font-mono mt-0.5">Atomic Number: {element.atomicNumber || 'N/A'}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-white/10 pb-3 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('overview'); }}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            Overview
          </button>
          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('physics'); }}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${activeTab === 'physics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            Physical Interaction
          </button>
          <button
            onClick={() => { soundEngine.playClick(); setActiveTab('feynman'); }}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${activeTab === 'feynman' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-white/60 hover:text-white'}`}
          >
            Feynman View
          </button>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                <Weight size={18} className="text-cyan-400" />
                <div>
                  <div className="text-white/40 text-[10px]">ATOMIC MASS</div>
                  <div className="font-bold text-white/90">{element.mass} u</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                <Thermometer size={18} className="text-amber-400" />
                <div>
                  <div className="text-white/40 text-[10px]">BOILING POINT</div>
                  <div className="font-bold text-white/90">{element.boilingPoint ? `${element.boilingPoint} K` : 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <Info size={14} />
                <span className="font-bold">Scientific Description</span>
              </div>
              <p className="text-white/70 leading-relaxed font-sans text-sm">
                {element.description}
              </p>
            </div>

            {/* Reflective Codex Quote */}
            <div className="bg-gradient-to-r from-fuchsia-950/30 to-cyan-950/30 border border-fuchsia-500/30 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-fuchsia-400">
                <Quote size={14} />
                <span className="font-bold uppercase tracking-wider text-[10px]">Reflective Context</span>
              </div>
              <p className="text-white/80 italic font-sans text-xs">
                &ldquo;{element.quote || 'We are a way for the cosmos to know itself.'}&rdquo;
              </p>
              <div className="text-right text-[10px] text-white/50 font-mono">
                — {element.quoteAuthor || 'Carl Sagan'}
              </div>
            </div>
          </div>
        ) : activeTab === 'physics' ? (
          <div className="space-y-4 font-mono text-xs">
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-fuchsia-400">
                <Magnet size={16} />
                <span className="font-bold">Mutual Force Registry</span>
              </div>
              <div className="space-y-2 text-white/80">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/50">Gravitational Mass:</span>
                  <span className="font-bold text-cyan-300">{element.mass} u</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span className="text-white/50">Elementary Charge:</span>
                  <span className="font-bold text-fuchsia-300">{element.atomicNumber ? `+${element.atomicNumber * 0.1}` : '0.0'} e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Interaction Mode:</span>
                  <span className="font-bold text-green-300">Attractive / Coulombic</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FeynmanVisualizer element={element} />
            <p className="text-[11px] text-white/60 font-mono text-center">
              Quantum mechanical wave packet representation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
