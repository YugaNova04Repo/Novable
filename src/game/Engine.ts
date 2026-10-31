import { Particle, FloatingText, Shockwave, ToolType, ElementDefinition } from './types';
import { ELEMENTS, REACTION_RULES } from './constants';
import { soundEngine } from './SoundEngine';

class SpatialHashGrid {
  cellSize: number;
  cells: Map<string, Particle[]> = new Map();

  constructor(cellSize: number = 60) {
    this.cellSize = cellSize;
  }

  clear() {
    this.cells.clear();
  }

  insert(particle: Particle) {
    const key = `${Math.floor(particle.x / this.cellSize)}_${Math.floor(particle.y / this.cellSize)}`;
    let bucket = this.cells.get(key);
    if (!bucket) {
      bucket = [];
      this.cells.set(key, bucket);
    }
    bucket.push(particle);
  }

  getNearby(particle: Particle): Particle[] {
    const cx = Math.floor(particle.x / this.cellSize);
    const cy = Math.floor(particle.y / this.cellSize);
    const nearby: Particle[] = [];
    for (let x = cx - 1; x <= cx + 1; x++) {
      for (let y = cy - 1; y <= cy + 1; y++) {
        const bucket = this.cells.get(`${x}_${y}`);
        if (bucket) {
          for (const p of bucket) {
            if (p.id !== particle.id) nearby.push(p);
          }
        }
      }
    }
    return nearby;
  }
}

export interface UniverseSnapshot {
  time: number;
  particles: { elementId: string; x: number; y: number; vx: number; vy: number; mass: number; temp: number }[];
  temp: number;
  pressure: number;
}

export class GameEngine {
  particles: Particle[] = [];
  floatingTexts: FloatingText[] = [];
  shockwaves: Shockwave[] = [];
  spatialGrid = new SpatialHashGrid(65);
  
  universeAge: number = 0;
  pressure: number = 1.0;
  temp: number = 15000;
  timeWarp: number = 1;
  isPaused: boolean = false;
  hasFusionCatalyst: boolean = false; // Milestone 3 buff

  // Active Toolbelt
  activeTool: ToolType = 'grab';
  activeSpawnElementId: string = 'hydrogen';
  isAttracting: boolean = false;
  attractX: number = 0;
  attractY: number = 0;
  draggedParticleId: string | null = null;

  // Selection & Lasso Stamp
  lassoStart: { x: number; y: number } | null = null;
  lassoEnd: { x: number; y: number } | null = null;
  customStamps: { id: string; name: string; elements: string[] }[] = [];

  // Time-Rewind Snapshot Buffer (30 slots)
  snapshots: UniverseSnapshot[] = [];
  snapshotTimer: number = 0;

  // Callbacks
  onDiscover?: (elementId: string) => void;

  constructor() {
    try {
      const savedStamps = localStorage.getItem('genesis_custom_stamps');
      if (savedStamps) {
        this.customStamps = JSON.parse(savedStamps);
      }
    } catch {
      // Ignore
    }
  }

  init() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.universeAge = 0;
    this.snapshots = [];
  }

  spawnParticle(elementId: string, x: number, y: number, customVx?: number, customVy?: number) {
    const def = ELEMENTS[elementId];
    if (!def) return;

    this.particles.push({
      id: Math.random().toString(36).substring(2, 9),
      elementId,
      x,
      y,
      vx: customVx ?? (Math.random() - 0.5) * 3,
      vy: customVy ?? (Math.random() - 0.5) * 3,
      radius: Math.max(4, Math.min(28, Math.cbrt((def.mass || 1) + 2) * 3.8)),
      temp: this.temp,
      energy: def.mass,
      mass: def.mass || 1,
      charge: def.atomicNumber ? def.atomicNumber * 0.1 : 0,
      state: 'gas',
      trail: []
    });
  }

  initiateBigBang(width: number, height: number) {
    this.init();
    this.temp = 30000;
    this.pressure = 50;
    soundEngine.playBigBang();
    this.addShockwave(width / 2, height / 2, '#00F0FF');

    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.spawnParticle('up_quark', cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.spawnParticle('down_quark', cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      this.spawnParticle('electron', cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.spawnParticle('energy_packet', cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    this.addFloatingText('Big Bang Initialized! T = 0', cx, cy - 40, '#00F0FF');
  }

  addFloatingText(text: string, x: number, y: number, color: string = '#ffffff') {
    this.floatingTexts.push({
      id: Math.random().toString(36),
      text,
      x,
      y,
      color,
      life: 0,
      maxLife: 60
    });
  }

  addShockwave(x: number, y: number, color: string = '#ffffff', maxRadius: number = 180) {
    this.shockwaves.push({
      id: Math.random().toString(36),
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      opacity: 0.8
    });
  }

  getTotalKineticEnergy(): number {
    let ke = 0;
    for (const p of this.particles) {
      const vSq = p.vx * p.vx + p.vy * p.vy;
      ke += 0.5 * p.mass * vSq;
    }
    return ke;
  }

  saveSnapshot() {
    const snap: UniverseSnapshot = {
      time: this.universeAge,
      temp: this.temp,
      pressure: this.pressure,
      particles: this.particles.map(p => ({
        elementId: p.elementId,
        x: p.x,
        y: p.y,
        vx: p.vx,
        vy: p.vy,
        mass: p.mass,
        temp: p.temp
      }))
    };
    this.snapshots.push(snap);
    if (this.snapshots.length > 30) {
      this.snapshots.shift();
    }
  }

  restoreSnapshot(snap: UniverseSnapshot) {
    this.universeAge = snap.time;
    this.temp = snap.temp;
    this.pressure = snap.pressure;
    this.particles = snap.particles.map(sp => {
      const def = ELEMENTS[sp.elementId];
      return {
        id: Math.random().toString(36).substring(2, 9),
        elementId: sp.elementId,
        x: sp.x,
        y: sp.y,
        vx: sp.vx,
        vy: sp.vy,
        radius: Math.max(4, Math.min(28, Math.cbrt((def?.mass || 1) + 2) * 3.8)),
        temp: sp.temp,
        energy: def?.mass || 1,
        mass: sp.mass,
        charge: 0,
        state: 'gas',
        trail: []
      };
    });
  }

  saveCustomStamp(name: string, rect: { x1: number; y1: number; x2: number; y2: number }) {
    const matched = this.particles.filter(p => 
      p.x >= Math.min(rect.x1, rect.x2) && p.x <= Math.max(rect.x1, rect.x2) &&
      p.y >= Math.min(rect.y1, rect.y2) && p.y <= Math.max(rect.y1, rect.y2)
    );
    if (matched.length === 0) return;

    const stamp = {
      id: Math.random().toString(36).substring(2, 8),
      name: name || `Stamp #${this.customStamps.length + 1}`,
      elements: matched.map(p => p.elementId)
    };
    this.customStamps.push(stamp);
    try {
      localStorage.setItem('genesis_custom_stamps', JSON.stringify(this.customStamps));
    } catch {
      // Ignore
    }
  }

  update(width: number, height: number) {
    if (this.isPaused) return;

    const dt = 0.016 * this.timeWarp;
    this.universeAge += dt * 1000;

    // Snapshot timer (every 5 seconds)
    this.snapshotTimer += dt;
    if (this.snapshotTimer >= 5.0) {
      this.snapshotTimer = 0;
      this.saveSnapshot();
    }

    // Floating text update
    this.floatingTexts.forEach(ft => {
      ft.life++;
      ft.y -= 0.6;
    });
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life < ft.maxLife);

    // Shockwaves update
    this.shockwaves.forEach(sw => {
      sw.radius += 5 * this.timeWarp;
      sw.opacity -= 0.025 * this.timeWarp;
    });
    this.shockwaves = this.shockwaves.filter(sw => sw.opacity > 0);

    // Apply mutual physical forces (gravitational & electromagnetic interactions)
    this.applyMutualForces();

    // Populate Spatial Hash Grid for O(N) collision detection
    this.spatialGrid.clear();
    this.particles.forEach(p => this.spatialGrid.insert(p));

    const consumedIds = new Set<string>();

    // Update particles & check collisions via Spatial Hash Grid
    this.particles.forEach(p => {
      p.temp = this.temp;

      if (!p.trail) p.trail = [];
      p.trail.unshift({ x: p.x, y: p.y });
      if (p.trail.length > 8) p.trail.pop();

      // Position update
      p.x += p.vx * this.timeWarp;
      p.y += p.vy * this.timeWarp;

      // Friction / Damping
      p.vx *= 0.992;
      p.vy *= 0.992;

      // Wall bounce
      const margin = p.radius;
      if (p.x < margin) { p.x = margin; p.vx *= -0.7; }
      if (p.x > width - margin) { p.x = width - margin; p.vx *= -0.7; }
      if (p.y < margin) { p.y = margin; p.vy *= -0.7; }
      if (p.y > height - margin) { p.y = height - margin; p.vy *= -0.7; }

      if (consumedIds.has(p.id)) return;

      // Check nearby particles in spatial hash cells
      const nearby = this.spatialGrid.getNearby(p);
      for (const p2 of nearby) {
        if (consumedIds.has(p.id) || consumedIds.has(p2.id)) continue;

        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p.radius + p2.radius;

        if (dist < minDist) {
          // Elastic collision bounce
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const kx = p.vx - p2.vx;
          const ky = p.vy - p2.vy;
          const colImpulse = 2 * (nx * kx + ny * ky) / (p.mass + p2.mass);

          p.vx -= colImpulse * p2.mass * nx * 0.5;
          p.vy -= colImpulse * p2.mass * ny * 0.5;
          p2.vx += colImpulse * p.mass * nx * 0.5;
          p2.vy += colImpulse * p.mass * ny * 0.5;

          const impactVelocity = Math.sqrt(kx * kx + ky * ky);
          if (impactVelocity > 0.5) {
            soundEngine.playCollision(impactVelocity, p.mass + p2.mass);

            if (impactVelocity > 4.0) {
              const midX = (p.x + p2.x) / 2;
              const midY = (p.y + p2.y) / 2;
              const shockRadius = Math.min(250, Math.max(40, impactVelocity * 18));
              this.addShockwave(midX, midY, '#00F0FF', shockRadius);
            }
          }

          // Check Reaction Rules
          const matchedRule = REACTION_RULES.find(rule => {
            if (rule.inputs.length === 2) {
              return (
                (rule.inputs[0] === p.elementId && rule.inputs[1] === p2.elementId) ||
                (rule.inputs[0] === p2.elementId && rule.inputs[1] === p.elementId)
              );
            }
            return false;
          });

          if (matchedRule) {
            const catalystMultiplier = this.hasFusionCatalyst ? 1.35 : 1.0;
            const tempOk = 
              (!matchedRule.minTemp || this.temp >= matchedRule.minTemp / catalystMultiplier) &&
              (!matchedRule.maxTemp || this.temp <= matchedRule.maxTemp * catalystMultiplier);
            const pressureOk =
              (!matchedRule.minPressure || this.pressure >= matchedRule.minPressure) &&
              (!matchedRule.maxPressure || this.pressure <= matchedRule.maxPressure);

            if (tempOk && pressureOk) {
              consumedIds.add(p.id);
              consumedIds.add(p2.id);

              const midX = (p.x + p2.x) / 2;
              const midY = (p.y + p2.y) / 2;

              this.spawnParticle(matchedRule.output, midX, midY, (p.vx + p2.vx) / 2, (p.vy + p2.vy) / 2);
              this.addShockwave(midX, midY, ELEMENTS[matchedRule.output]?.color || '#ffffff');
              this.addFloatingText(`+${ELEMENTS[matchedRule.output]?.name || matchedRule.output}!`, midX, midY - 15, '#00F0FF');
              soundEngine.playDiscovery();

              if (this.onDiscover) {
                this.onDiscover(matchedRule.output);
              }
            } else {
              // Diagnostic failure micro-label
              p.failedReason = !tempOk ? (this.temp > (matchedRule.maxTemp || 1e9) ? 'Too Hot!' : 'Too Cold!') : 'Need Pressure!';
            }
          }
        }
      }
    });

    this.particles = this.particles.filter(p => !consumedIds.has(p.id));
    this.checkComplexReactions();
  }

  private checkComplexReactions() {
    const complexRules = REACTION_RULES.filter(r => r.inputs.length >= 3);
    if (complexRules.length === 0 || this.particles.length < 3) return;

    for (const rule of complexRules) {
      const inputCounts: Record<string, number> = {};
      rule.inputs.forEach(id => {
        inputCounts[id] = (inputCounts[id] || 0) + 1;
      });

      let matchedParticles: Particle[] = [];
      const usedIds = new Set<string>();

      let allFound = true;
      for (const [reqId, count] of Object.entries(inputCounts)) {
        const found = this.particles.filter(p => p.elementId === reqId && !usedIds.has(p.id));
        if (found.length >= count) {
          for (let i = 0; i < count; i++) {
            matchedParticles.push(found[i]);
            usedIds.add(found[i].id);
          }
        } else {
          allFound = false;
          break;
        }
      }

      if (allFound && matchedParticles.length > 0) {
        const catalystMultiplier = this.hasFusionCatalyst ? 1.35 : 1.0;
        const tempOk = 
          (!rule.minTemp || this.temp >= rule.minTemp / catalystMultiplier) &&
          (!rule.maxTemp || this.temp <= rule.maxTemp * catalystMultiplier);
        const pressureOk =
          (!rule.minPressure || this.pressure >= rule.minPressure) &&
          (!rule.maxPressure || this.pressure <= rule.maxPressure);

        if (tempOk && pressureOk) {
          const avgX = matchedParticles.reduce((acc, p) => acc + p.x, 0) / matchedParticles.length;
          const avgY = matchedParticles.reduce((acc, p) => acc + p.y, 0) / matchedParticles.length;

          const removeSet = new Set(matchedParticles.map(p => p.id));
          this.particles = this.particles.filter(p => !removeSet.has(p.id));

          this.spawnParticle(rule.output, avgX, avgY);
          this.addShockwave(avgX, avgY, ELEMENTS[rule.output]?.color || '#FACC15');
          this.addFloatingText(`Synthesis: ${ELEMENTS[rule.output]?.name}!`, avgX, avgY - 20, '#FACC15');
          soundEngine.playDiscovery();

          if (this.onDiscover) {
            this.onDiscover(rule.output);
          }
          break;
        }
      }
    }
  }

  applyMutualForces() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSq = dx * dx + dy * dy + 100;
        const dist = Math.sqrt(distSq);

        const gravForce = (p1.mass * p2.mass * 0.00004) / distSq;
        const emForce = -(p1.charge * p2.charge * 0.4) / distSq;

        const totalForce = gravForce + emForce;
        const fx = (dx / dist) * totalForce;
        const fy = (dy / dist) * totalForce;

        p1.vx += fx / p1.mass;
        p1.vy += fy / p1.mass;
        p2.vx -= fx / p2.mass;
        p2.vy -= fy / p2.mass;
      }
    }
  }
}
