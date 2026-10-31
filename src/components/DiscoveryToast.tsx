import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { ElementDefinition } from '../game/types';

interface Props {
  element: ElementDefinition | null;
  onDismiss: () => void;
}

export default function DiscoveryToast({ element, onDismiss }: Props) {
  useEffect(() => {
    if (!element) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [element, onDismiss]);

  if (!element) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
      <div className="bg-gradient-to-r from-cyan-600/90 via-fuchsia-600/90 to-purple-600/95 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/30 flex items-center justify-center font-bold font-mono text-cyan-300">
          {element.symbol}
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-cyan-200">
            <Sparkles size={12} />
            <span>New Discovery Unlocked!</span>
          </div>
          <div className="font-bold text-lg">{element.name}</div>
        </div>
      </div>
    </div>
  );
}
