import React from 'react';
import { ElementDefinition } from '../game/types';
import { X, Atom, Thermometer, Weight, Info } from 'lucide-react';

interface Props {
  element: ElementDefinition | null;
  onClose: () => void;
}

export default function InspectorModal({ element, onClose }: Props) {
  if (!element) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="relative w-full max-w-md bg-[#0F141E] border border-white/15 rounded-3xl p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-4 mb-6">
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
        </div>
      </div>
    </div>
  );
}
