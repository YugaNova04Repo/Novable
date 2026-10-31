import React, { useState } from 'react';
import { X, Save, Download, Upload, RotateCcw, Volume2, VolumeX, LogOut, Check } from 'lucide-react';
import { soundEngine } from '../game/SoundEngine';

interface Props {
  muted: boolean;
  showQuantumField: boolean;
  showDebugPhysics: boolean;
  onToggleMute: () => void;
  onToggleQuantumField: () => void;
  onToggleDebugPhysics: () => void;
  onSaveNow: () => void;
  onExportSave: () => void;
  onImportString: (saveStr: string) => void;
  onResetUniverse: () => void;
  onReturnToTitle: () => void;
  onClose: () => void;
}

export default function SystemModal({
  muted,
  showQuantumField,
  showDebugPhysics,
  onToggleMute,
  onToggleQuantumField,
  onToggleDebugPhysics,
  onSaveNow,
  onExportSave,
  onImportString,
  onResetUniverse,
  onReturnToTitle,
  onClose
}: Props) {
  const [importInput, setImportInput] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 pointer-events-auto">
      <div className="relative w-full max-w-lg bg-[#0F141E] border border-white/15 rounded-3xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold mb-6">System & Universe Settings</h2>

        <div className="space-y-6 font-mono text-xs">
          {/* Save & Export */}
          <div className="space-y-2">
            <div className="text-white/40 uppercase tracking-wider text-[10px]">Data & Backup</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onSaveNow();
                  setShowSavedToast(true);
                  setTimeout(() => setShowSavedToast(false), 2500);
                }}
                className="py-3 px-4 rounded-xl bg-cyan-600/20 border border-cyan-500/40 hover:bg-cyan-600/30 text-cyan-300 font-bold flex items-center justify-center gap-2 transition-all"
              >
                {showSavedToast ? <Check size={16} /> : <Save size={16} />}
                <span>{showSavedToast ? 'Saved!' : 'Save Progress'}</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onExportSave();
                }}
                className="py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Download size={16} className="text-cyan-400" />
                <span>Export Save (.JSON)</span>
              </button>
            </div>
          </div>

          {/* Import Save */}
          <div className="space-y-2">
            <div className="text-white/40 uppercase tracking-wider text-[10px]">Import Save String</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste save JSON string here..."
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={() => {
                  if (importInput.trim()) {
                    onImportString(importInput.trim());
                    setImportInput('');
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold flex items-center gap-2"
              >
                <Upload size={14} />
                <span>Import</span>
              </button>
            </div>
          </div>

          {/* Visual & Audio Preferences */}
          <div className="space-y-2">
            <div className="text-white/40 uppercase tracking-wider text-[10px]">Visual & Audio Preferences</div>
            <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
              <span>Web Audio Synthesizer</span>
              <button
                onClick={onToggleMute}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2"
              >
                {muted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-green-400" />}
                <span>{muted ? 'Muted' : 'Active'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
              <span>Quantum Field Visualization</span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onToggleQuantumField();
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  showQuantumField 
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                    : 'bg-white/10 border-white/10 text-white/70'
                }`}
              >
                <span>{showQuantumField ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
              <span>Debug Physics (Spatial Grid & Hitboxes)</span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onToggleDebugPhysics();
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  showDebugPhysics 
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                    : 'bg-white/10 border-white/10 text-white/70'
                }`}
              >
                <span>{showDebugPhysics ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between bg-cyan-950/20 border border-cyan-500/30 p-4 rounded-xl">
              <div>
                <div className="font-bold text-cyan-300">PWA Offline Standalone Mode</div>
                <div className="text-[10px] text-white/50 mt-0.5">Install Genesis as a native app on your home screen</div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  alert('To install Genesis offline:\n1. Tap your browser menu or share icon.\n2. Select "Add to Home Screen" or "Install App".\nEnjoy 100% offline standalone simulation!');
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
              >
                Install App
              </button>
            </div>
          </div>

          {/* Navigation & Reset */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                soundEngine.playClick();
                onReturnToTitle();
              }}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={16} className="text-cyan-400" />
              <span>Save & Return to Title Screen</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to trigger a Big Crunch? All progress will be wiped!')) {
                  onResetUniverse();
                  onClose();
                }
              }}
              className="w-full py-3 rounded-xl bg-red-950/30 border border-red-500/30 hover:bg-red-900/40 text-red-300 font-bold flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={16} />
              <span>Big Crunch Reset Universe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
