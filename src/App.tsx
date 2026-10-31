import React, { useState, useEffect } from 'react';
import { GameEngine, UniverseSnapshot } from './game/Engine';
import { ELEMENTS, EPOCHS, MILESTONES, ChallengeScenario } from './game/constants';
import { ElementDefinition, Milestone, ViewState, ToolType } from './game/types';
import { soundEngine } from './game/SoundEngine';

import TitleScreen from './components/TitleScreen';
import HibernationScreen from './components/HibernationScreen';
import BlueprintsPage from './components/BlueprintsPage';
import SystemModal from './components/SystemModal';
import ChallengesModal from './components/ChallengesModal';
import TimelineModal from './components/TimelineModal';
import PhysicsLabModal from './components/PhysicsLabModal';
import Header from './components/Header';
import MilestoneWidget from './components/MilestoneWidget';
import GameCanvas from './components/GameCanvas';
import CodexDock from './components/CodexDock';
import InspectorModal from './components/InspectorModal';
import DiscoveryToast from './components/DiscoveryToast';
import EnvironmentalDeck from './components/EnvironmentalDeck';
import Toolbelt from './components/Toolbelt';

export default function App() {
  const [engine] = useState(() => new GameEngine());
  const [viewState, setViewState] = useState<ViewState>('title');
  const [temp, setTemp] = useState<number>(15000);
  const [pressure, setPressure] = useState<number>(50);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeWarp, setTimeWarp] = useState<number>(1);
  const [muted, setMuted] = useState<boolean>(false);
  const [universeAge, setUniverseAge] = useState<number>(0);
  const [kineticEnergy, setKineticEnergy] = useState<number>(0);

  // Active Toolbelt & Spawn brush
  const [activeTool, setActiveTool] = useState<ToolType>('grab');
  const [activeSpawnElementId, setActiveSpawnElementId] = useState<string>('hydrogen');

  // Modals & Overlay Toggles
  const [showEnvDeck, setShowEnvDeck] = useState<boolean>(false);
  const [showSystemModal, setShowSystemModal] = useState<boolean>(false);
  const [showQuantumField, setShowQuantumField] = useState<boolean>(false);
  const [showDebugPhysics, setShowDebugPhysics] = useState<boolean>(false);
  const [showChallengesModal, setShowChallengesModal] = useState<boolean>(false);
  const [showTimelineModal, setShowTimelineModal] = useState<boolean>(false);
  const [showLabModal, setShowLabModal] = useState<boolean>(false);
  const [inspectElement, setInspectElement] = useState<ElementDefinition | null>(null);
  const [latestDiscovery, setLatestDiscovery] = useState<ElementDefinition | null>(null);

  // Challenge Scenario tracking
  const [activeChallenge, setActiveChallenge] = useState<ChallengeScenario | null>(null);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState<number>(0);

  // Discovered set persistence
  const [discovered, setDiscovered] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('genesis_discovered');
      if (saved) return new Set(JSON.parse(saved));
    } catch {
      // Ignore
    }
    return new Set(['energy_packet', 'up_quark', 'down_quark', 'electron', 'proton', 'neutron', 'hydrogen']);
  });

  const discoveredCount = discovered.size;
  const currentEpoch = [...EPOCHS].reverse().find(e => discoveredCount >= e.requiredDiscoveries) || EPOCHS[0];

  // Milestones persistence
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

  // Check milestone buffs (e.g., Milestone 3 Fusion Catalyst)
  useEffect(() => {
    const m3 = milestones.find(m => m.id === 'm3');
    if (m3 && m3.completed) {
      engine.hasFusionCatalyst = true;
    }
  }, [milestones, engine]);

  // Ambient & Generative Music effect
  useEffect(() => {
    if (!muted && viewState === 'crucible') {
      soundEngine.startAmbient(temp);
      soundEngine.startGenerativeMusic(currentEpoch.id);
    } else {
      soundEngine.stopAmbient();
    }
    soundEngine.updateAmbient(temp);
  }, [temp, muted, viewState, currentEpoch.id]);

  // Challenge timer loop
  useEffect(() => {
    if (!activeChallenge || isPaused) return;
    const timer = setInterval(() => {
      setChallengeTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          alert(`Challenge Failed: Time expired for "${activeChallenge.title}"!`);
          setActiveChallenge(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeChallenge, isPaused]);

  // Check challenge completion
  useEffect(() => {
    if (!activeChallenge) return;
    const count = engine.particles.filter(p => p.elementId === activeChallenge.targetElementId).length;
    if (count >= activeChallenge.targetCount) {
      alert(`Challenge Completed Successfully: "${activeChallenge.title}"!\nReward: ${activeChallenge.rewardText}`);
      try {
        const saved = JSON.parse(localStorage.getItem('genesis_completed_challenges') || '[]');
        if (!saved.includes(activeChallenge.id)) {
          saved.push(activeChallenge.id);
          localStorage.setItem('genesis_completed_challenges', JSON.stringify(saved));
        }
      } catch {
        // Ignore
      }
      setActiveChallenge(null);
    }
  }, [engine.particles, activeChallenge]);

  // Sync engine state loop
  const [, setTick] = useState(0);

  useEffect(() => {
    let animId: number;
    const updateLoop = () => {
      if (!isPaused && viewState === 'crucible') {
        setUniverseAge(engine.universeAge);
        setKineticEnergy(engine.getTotalKineticEnergy());
        engine.temp = temp;
        engine.pressure = pressure;
      }
      setTick(t => t + 1);
      animId = requestAnimationFrame(updateLoop);
    };
    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [engine, isPaused, viewState, temp, pressure]);

  // Handle discoveries
  const handleDiscover = (elementId: string) => {
    setDiscovered(prev => {
      if (prev.has(elementId)) return prev;
      const next = new Set(prev);
      next.add(elementId);

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

  const handleSaveNow = () => {
    try {
      localStorage.setItem('genesis_discovered', JSON.stringify(Array.from(discovered)));
      localStorage.setItem('genesis_milestones', JSON.stringify(milestones.filter(m => m.completed).map(m => m.id)));
      localStorage.setItem('genesis_temp', temp.toString());
      localStorage.setItem('genesis_pressure', pressure.toString());
    } catch {
      // Ignore
    }
  };

  const handleExportSave = () => {
    const saveData = {
      discovered: Array.from(discovered),
      milestones: milestones.filter(m => m.completed).map(m => m.id),
      temp,
      pressure,
      universeAge
    };
    const jsonStr = JSON.stringify(saveData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genesis-universe-save-${Math.floor(Date.now() / 1000)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportString = (saveStr: string) => {
    try {
      const data = JSON.parse(saveStr);
      if (data.discovered) {
        setDiscovered(new Set(data.discovered));
        localStorage.setItem('genesis_discovered', JSON.stringify(data.discovered));
      }
      if (data.milestones) {
        setMilestones(MILESTONES.map(m => ({
          ...m,
          completed: data.milestones.includes(m.id)
        })));
        localStorage.setItem('genesis_milestones', JSON.stringify(data.milestones));
      }
      if (data.temp) setTemp(data.temp);
      if (data.pressure) setPressure(data.pressure);
      alert('Save successfully imported!');
    } catch {
      alert('Invalid save string or JSON file.');
    }
  };

  const handleResetUniverse = () => {
    engine.initiateBigBang(window.innerWidth, window.innerHeight);
    setTemp(30000);
    setPressure(50);
    setUniverseAge(0);
    setDiscovered(new Set(['energy_packet', 'up_quark', 'down_quark', 'electron', 'proton', 'neutron', 'hydrogen']));
    setMilestones(MILESTONES);
    setActiveChallenge(null);
    try {
      localStorage.removeItem('genesis_discovered');
      localStorage.removeItem('genesis_milestones');
    } catch {
      // Ignore
    }
  };

  if (viewState === 'title') {
    const hasSave = discovered.size > 7;
    return (
      <TitleScreen
        hasSave={hasSave}
        savedEpochTitle={currentEpoch.title}
        savedDiscoveries={discovered.size}
        totalElements={Object.keys(ELEMENTS).length}
        onContinue={() => {
          setViewState('crucible');
        }}
        onNewGame={() => {
          handleResetUniverse();
          setViewState('crucible');
        }}
        onOpenImport={() => {
          const str = prompt('Paste your Genesis save JSON string here:');
          if (str) handleImportString(str);
        }}
        onOpenBlueprints={() => {
          setViewState('blueprints');
        }}
        onHibernate={() => {
          setViewState('hibernation');
        }}
      />
    );
  }

  if (viewState === 'hibernation') {
    return (
      <HibernationScreen
        onWake={() => setViewState('title')}
      />
    );
  }

  if (viewState === 'blueprints') {
    return (
      <BlueprintsPage
        discovered={discovered}
        onBack={() => setViewState('title')}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090E] select-none">
      <Header
        currentEpoch={currentEpoch}
        discoveredCount={discovered.size}
        totalElements={Object.keys(ELEMENTS).length}
        temp={Math.round(temp)}
        pressure={pressure}
        universeAge={universeAge}
        kineticEnergy={kineticEnergy}
        isPaused={isPaused}
        timeWarp={timeWarp}
        muted={muted}
        onTogglePause={() => {
          setIsPaused(p => !p);
          engine.isPaused = !isPaused;
          soundEngine.playClick();
        }}
        onCycleTimeWarp={() => {
          const warps = [1, 5, 10, 50];
          const nextWarp = warps[(warps.indexOf(timeWarp) + 1) % warps.length];
          setTimeWarp(nextWarp);
          engine.timeWarp = nextWarp;
          soundEngine.playClick();
        }}
        onClearCrucible={() => {
          engine.particles = [];
          soundEngine.playClick();
        }}
        onToggleMute={() => {
          const nextMuted = !muted;
          setMuted(nextMuted);
          soundEngine.muted = nextMuted;
          soundEngine.playClick();
        }}
        onOpenSettings={() => setShowSystemModal(true)}
        onOpenBlueprints={() => setViewState('blueprints')}
        onOpenChallenges={() => setShowChallengesModal(true)}
        onOpenTimeline={() => setShowTimelineModal(true)}
        onOpenLab={() => setShowLabModal(true)}
        onReturnToTitle={() => {
          handleSaveNow();
          setViewState('title');
        }}
        onToggleEnvDeck={() => setShowEnvDeck(d => !d)}
      />

      {/* Active Challenge Banner if running */}
      {activeChallenge && (
        <div className="bg-amber-950/80 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono text-amber-200 flex items-center justify-between z-20">
          <span>Challenge: <b>{activeChallenge.title}</b> — Goal: {activeChallenge.targetCount} {activeChallenge.targetElementId}</span>
          <span className="font-bold text-amber-400">Time Left: {challengeTimeLeft}s</span>
        </div>
      )}

      <div className="relative flex-1 flex overflow-hidden">
        <MilestoneWidget milestones={milestones} />

        <Toolbelt
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          activeSpawnElementId={activeSpawnElementId}
        />

        {showEnvDeck && (
          <EnvironmentalDeck
            temp={temp}
            pressure={pressure}
            onChangeTemp={setTemp}
            onChangePressure={setPressure}
            onClose={() => setShowEnvDeck(false)}
          />
        )}

        <GameCanvas
          engine={engine}
          temp={temp}
          activeTool={activeTool}
          activeSpawnElementId={activeSpawnElementId}
          showQuantumField={showQuantumField}
          showDebugPhysics={showDebugPhysics}
          onSpawnElement={(id, x, y) => engine.spawnParticle(id, x, y)}
        />

        <CodexDock
          discovered={discovered}
          activeSpawnElementId={activeSpawnElementId}
          onSelectSpawnElement={setActiveSpawnElementId}
          onSpawnElement={(id, x, y) => engine.spawnParticle(id, x, y)}
          onInspect={(el) => setInspectElement(el)}
        />
      </div>

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

      {showChallengesModal && (
        <ChallengesModal
          onStartChallenge={(ch) => {
            setActiveChallenge(ch);
            setChallengeTimeLeft(ch.timeLimitSeconds);
            engine.particles = [];
            ch.initialParticles.forEach(id => {
              engine.spawnParticle(id, window.innerWidth / 2 + (Math.random() - 0.5) * 100, window.innerHeight / 2 + (Math.random() - 0.5) * 100);
            });
          }}
          onClose={() => setShowChallengesModal(false)}
        />
      )}

      {showTimelineModal && (
        <TimelineModal
          snapshots={engine.snapshots}
          onRestoreSnapshot={(snap) => {
            engine.restoreSnapshot(snap);
            setUniverseAge(snap.time);
            setTemp(snap.temp);
            setPressure(snap.pressure);
          }}
          onClose={() => setShowTimelineModal(false)}
        />
      )}

      {showLabModal && (
        <PhysicsLabModal
          engine={engine}
          onClose={() => setShowLabModal(false)}
        />
      )}

      {showSystemModal && (
        <SystemModal
          muted={muted}
          showQuantumField={showQuantumField}
          showDebugPhysics={showDebugPhysics}
          onToggleMute={() => {
            const nextMuted = !muted;
            setMuted(nextMuted);
            soundEngine.muted = nextMuted;
          }}
          onToggleQuantumField={() => setShowQuantumField(q => !q)}
          onToggleDebugPhysics={() => setShowDebugPhysics(d => !d)}
          onSaveNow={handleSaveNow}
          onExportSave={handleExportSave}
          onImportString={handleImportString}
          onResetUniverse={handleResetUniverse}
          onReturnToTitle={() => {
            handleSaveNow();
            setShowSystemModal(false);
            setViewState('title');
          }}
          onClose={() => setShowSystemModal(false)}
        />
      )}
    </div>
  );
}
