import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from './game/Engine';
import { ELEMENTS, EPOCHS, MILESTONES } from './game/constants';
import { ElementDefinition, Milestone } from './game/types';
import { soundEngine } from './game/SoundEngine';

import Header from './components/Header';
import MilestoneWidget from './components/MilestoneWidget';
import GameCanvas from './components/GameCanvas';
import CodexDock from './components/CodexDock';
import InspectorModal from './components/InspectorModal';
import DiscoveryToast from './components/DiscoveryToast';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [engine] = useState(() => new GameEngine());
  const [temp, setTemp] = useState<number>(10000); // Start hot at Big Bang
  const [pressure] = useState<number>(1.2);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeWarp, setTimeWarp] = useState<number>(1);
  const [muted, setMuted] = useState<boolean>(false);
  const [universeAge, setUniverseAge] = useState<number>(0);

  // LocalStorage sync for discoveries
  const [discovered, setDiscovered] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('genesis_discovered');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // Ignore
    }
    return new Set(['up_quark', 'down_quark', 'electron', 'proton', 'neutron', 'hydrogen']);
  });

  // Milestones state
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem('genesis_milestones');
      if (saved) {
        const completedIds: string[] = JSON.parse(saved);
        return MILESTONES.map(m => ({
          ...m,
          completed: completedIds.includes(m.id)
        }));
      }
    } catch {
      // Ignore
    }
    return MILESTONES;
  });

  const [inspectElement, setInspectElement] = useState<ElementDefinition | null>(null);
  const [latestDiscovery, setLatestDiscovery] = useState<ElementDefinition | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Sync engine state loop for React UI updates
  const [, setTick] = useState(0);

  useEffect(() => {
    let animId: number;
    const updateLoop = () => {
      if (!isPaused) {
        setUniverseAge(engine.universeAge);
        // Gradually cool universe if temp > 300
        setTemp(t => Math.max(300, t - 0.2 * timeWarp));
      }
      setTick(t => t + 1);
      animId = requestAnimationFrame(updateLoop);
    };
    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [engine, isPaused, timeWarp]);

  // Handle new discoveries
  const handleDiscover = (elementId: string) => {
    setDiscovered(prev => {
      if (prev.has(elementId)) return prev;
      const next = new Set(prev);
      next.add(elementId);

      // Save to localStorage
      try {
        localStorage.setItem('genesis_discovered', JSON.stringify(Array.from(next)));
      } catch {
        // Ignore
      }

      const def = ELEMENTS[elementId];
      if (def) {
        setLatestDiscovery(def);
        soundEngine.playDiscovery();
      }

      return next;
    });
  };

  // Wire discover callback
  useEffect(() => {
    engine.onDiscover = handleDiscover;
  }, [engine]);

  // Check milestones
  useEffect(() => {
    setMilestones(prev => {
      let updated = false;
      const next = prev.map(m => {
        if (!m.completed) {
          const isComplete = m.check({
            discovered,
            temp,
            pressure,
            particleCount: engine.particles.length
          });
          if (isComplete) {
            updated = true;
            soundEngine.playDiscovery();
            return { ...m, completed: true };
          }
        }
        return m;
      });

      if (updated) {
        try {
          const completedIds = next.filter(m => m.completed).map(m => m.id);
          localStorage.setItem('genesis_milestones', JSON.stringify(completedIds));
        } catch {
          // Ignore
        }
      }

      return updated ? next : prev;
    });
  }, [discovered, temp, pressure, engine.particles.length]);

  // Determine current epoch based on discovery count
  const discoveredCount = discovered.size;
  const currentEpoch = [...EPOCHS].reverse().find(e => discoveredCount >= e.requiredDiscoveries) || EPOCHS[0];

  // Quick actions
  const handleTogglePause = () => {
    setIsPaused(p => !p);
    engine.isPaused = !isPaused;
    soundEngine.playClick();
  };

  const handleCycleTimeWarp = () => {
    const warps = [1, 5, 10, 50];
    const nextWarp = warps[(warps.indexOf(timeWarp) + 1) % warps.length];
    setTimeWarp(nextWarp);
    engine.timeWarp = nextWarp;
    soundEngine.playClick();
  };

  const handleClearCrucible = () => {
    engine.particles = [];
    soundEngine.playClick();
  };

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    soundEngine.muted = nextMuted;
    soundEngine.playClick();
  };

  const handleResetUniverse = () => {
    engine.initiateBigBang(window.innerWidth, window.innerHeight, 15000);
    setTemp(15000);
    setUniverseAge(0);
    setDiscovered(new Set(['up_quark', 'down_quark', 'electron', 'proton', 'neutron', 'hydrogen']));
    setMilestones(MILESTONES);
    try {
      localStorage.removeItem('genesis_discovered');
      localStorage.removeItem('genesis_milestones');
    } catch {
      // Ignore
    }
  };

  const handleSpawnElement = (elementId: string, x: number, y: number) => {
    engine.spawnParticle(elementId, x, y);
    soundEngine.playClick();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090E] select-none">
      {/* Top Telemetry Header */}
      <Header
        currentEpoch={currentEpoch}
        discoveredCount={discoveredCount}
        totalElements={Object.keys(ELEMENTS).length}
        temp={Math.round(temp)}
        pressure={pressure}
        universeAge={universeAge}
        isPaused={isPaused}
        timeWarp={timeWarp}
        muted={muted}
        onTogglePause={handleTogglePause}
        onCycleTimeWarp={handleCycleTimeWarp}
        onClearCrucible={handleClearCrucible}
        onToggleMute={handleToggleMute}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Viewport Container */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Milestone Widget */}
        <MilestoneWidget milestones={milestones} />

        {/* Canvas Crucible */}
        <GameCanvas
          engine={engine}
          temp={temp}
          onSpawnElement={handleSpawnElement}
        />

        {/* Bottom Element Codex Dock */}
        <CodexDock
          discovered={discovered}
          onSpawnElement={handleSpawnElement}
          onInspect={(el) => setInspectElement(el)}
        />
      </div>

      {/* Modals & Toasts */}
      <DiscoveryToast
        element={latestDiscovery}
        onDismiss={() => setLatestDiscovery(null)}
      />

      {inspectElement && (
        <InspectorModal
          element={inspectElement}
          onClose={() => setInspectElement(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          muted={muted}
          onToggleMute={handleToggleMute}
          onResetUniverse={handleResetUniverse}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
