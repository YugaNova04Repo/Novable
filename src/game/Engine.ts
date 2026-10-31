import { Particle, ReactionRule, FloatingText, Shockwave, UniverseSnapshot, ElementDefinition, ToolType } from './types';
import { ELEMENTS, REACTION_RULES } from './constants';
import { soundEngine } from './SoundEngine';

export type { UniverseSnapshot };

export class SpatialHashGrid {
  cellSize: number;
  buckets: Map<string, Particle[]>;

  constructor(cellSize: number = 65) {
    this.cellSize = cellSize;
    this.buckets = new Map();
  }

  clear() {
    this.buckets.clear();
  }

  getKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  insert(p: Particle) {
    const key = this.getKey(p.x, p.y);
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = [];
      this.buckets.set(key, bucket);
    }
    bucket.push(p);
  }

  getNearby(p: Particle): Particle[] {
    const nearby: Particle[] = [];
    const minCx = Math.floor((p.x - p.radius) / this.cellSize);
    const maxCx = Math.floor((p.x + p.radius) / this.cellSize);
    const minCy = Math.floor((p.y - p.radius) / this.cellSize);
    const maxCy = Math.floor((p.y + p.radius) / this.cellSize);

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = `${cx},${cy}`;
        const bucket = this.buckets.get(key);
        if (bucket) {
          for (const other of bucket) {
            if (other.id !== p.id) {
              nearby.push(other);
            }
          }
        }
      }
    }
    return nearby;
  }
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
  hasFusionCatalyst: boolean = false;

  // Physics Lab Constants
  gravScale: number = 1.0;
  emScale: number = 1.0;
  thermalScale: number = 1.0;

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
  customStamps: { id: string; name: string; code: string; elements: string[] }[] = [];

  // Time-Rewind Snapshot Buffer (30 slots)
  snapshots: UniverseSnapshot[] = [];
  snapshotTimer: number = 0;

  // High-Refresh-Rate (HRR) Delta-Time Tracking
  lastFrameTimestamp: number = 0;

  // Callbacks
  onDiscover?: (elementId: string) => void;

  constructor() {
    try {
      const savedStamps = localStorage.getItem('novagen_custom_stamps') || localStorage.getItem('genesis_custom_stamps');
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

  initiateBigBang(width: number = 1000, height: number = 800) {
    this.init();
    this.temp = 50000;
    this.pressure = 100;
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const types = ['energy_packet', 'up_quark', 'down_quark', 'electron'];
      const chosen = types[Math.floor(Math.random() * types.length)];
      this.spawnParticle(chosen, cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 20, vx, vy);
    }
    this.addShockwave(cx, cy, '#FF00FE', 400);
    this.addFloatingText('BIG BANG (T=0)', cx, cy - 30, '#00F0FF');
    soundEngine.playBigBang();
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

  addShockwave(x: number, y: number, color: string, maxRadius: number = 180) {
    this.shockwaves.push({
      id: Math.random().toString(36).substring(2, 8),
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      opacity: 1.0
    });
  }

  addFloatingText(text: string, x: number, y: number, color: string = '#00F0FF') {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 8),
      text,
      x,
      y,
      color,
      life: 0,
      maxLife: 60
    });
  }

  getTotalKineticEnergy(): number {
    return this.particles.reduce((acc, p) => {
      const speedSq = p.vx * p.vx + p.vy * p.vy;
      return acc + 0.5 * p.mass * speedSq;
    }, 0);
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
    this.particles = snap.particles.map((sp: UniverseSnapshot['particles'][number]) => {
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
    const minX = Math.min(rect.x1, rect.x2);
    const maxX = Math.max(rect.x1, rect.x2);
    const minY = Math.min(rect.y1, rect.y2);
    const maxY = Math.max(rect.y1, rect.y2);
    
    const matched = this.particles.filter(p => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY);
    if (matched.length === 0) return;

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const relParticles = matched.map(p => ({
      elementId: p.elementId,
      dx: p.x - centerX,
      dy: p.y - centerY
    }));

    const rawData = JSON.stringify({
      name: name || `Assembly #${this.customStamps.length + 1}`,
      particles: relParticles
    });

    const code = 'GEN-STAMP-' + btoa(rawData);

    const stamp = {
      id: Math.random().toString(36).substring(2, 8),
      name: name || `Assembly #${this.customStamps.length + 1}`,
      code,
      elements: Array.from(new Set(matched.map(p => p.elementId)))
    };

    this.customStamps.push(stamp);
    try {
      localStorage.setItem('novagen_custom_stamps', JSON.stringify(this.customStamps));
      localStorage.setItem('genesis_custom_stamps', JSON.stringify(this.customStamps));
    } catch {
      // Ignore
    }
  }

  importStampCode(codeStr: string, spawnX: number, spawnY: number): boolean {
    try {
      const clean = codeStr.replace('GEN-STAMP-', '').trim();
      const decoded = JSON.parse(atob(clean));
      if (decoded.particles && Array.isArray(decoded.particles)) {
        decoded.particles.forEach((p: { elementId: string; dx: number; dy: number }) => {
          this.spawnParticle(p.elementId, spawnX + p.dx, spawnY + p.dy);
        });
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  }

  update(width: number, height: number, customDeltaSec?: number) {
    if (this.isPaused) return;

    const now = performance.now();
    let rawDeltaSec = customDeltaSec ?? (this.lastFrameTimestamp > 0 ? (now - this.lastFrameTimestamp) / 1000 : 0.016);
    this.lastFrameTimestamp = now;

    if (rawDeltaSec <= 0 || rawDeltaSec > 0.05) rawDeltaSec = 0.016;

    const timeFactor = rawDeltaSec / 0.016;
    const dt = rawDeltaSec * this.timeWarp;
    this.universeAge += dt * 1000;

    // Snapshot timer (every 5 seconds)
    this.snapshotTimer += dt;
    if (this.snapshotTimer >= 5.0) {
      this.snapshotTimer = 0;
      this.saveSnapshot();
    }

    // Floating text update
    this.floatingTexts.forEach(ft => {
      ft.life += timeFactor;
      ft.y -= 0.6 * timeFactor;
    });
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life < ft.maxLife);

    // Shockwaves update
    this.shockwaves.forEach(sw => {
      sw.radius += 5 * this.timeWarp * timeFactor;
      sw.opacity -= 0.025 * this.timeWarp * timeFactor;
    });
    this.shockwaves = this.shockwaves.filter(sw => sw.opacity > 0);

    // Apply mutual physical forces & gravity well
    this.applyMutualForces(timeFactor);

    // Populate Spatial Hash Grid for O(N) collision detection
    this.spatialGrid.clear();
    this.particles.forEach(p => this.spatialGrid.insert(p));

    const consumedIds = new Set<string>();

    // Update particles & check collisions via Spatial Hash Grid
    this.particles.forEach(p => {
      p.temp = this.temp * this.thermalScale;

      // Real Phase Transitions
      const def = ELEMENTS[p.elementId];
      if (p.temp > 10000) {
        p.state = 'plasma';
      } else if (def?.boilingPoint && p.temp >= def.boilingPoint) {
        p.state = 'gas';
      } else if (def?.meltingPoint && p.temp >= def.meltingPoint) {
        p.state = 'liquid';
      } else if (def?.meltingPoint && p.temp < def.meltingPoint) {
        p.state = 'solid';
      } else {
        p.state = p.temp > 3000 ? 'gas' : 'solid';
      }

      if (!p.trail) p.trail = [];
      p.trail.unshift({ x: p.x, y: p.y });
      if (p.trail.length > 8) p.trail.pop();

      // Position update
      p.x += p.vx * this.timeWarp * timeFactor;
      p.y += p.vy * this.timeWarp * timeFactor;

      // Friction / Damping
      p.vx *= Math.pow(0.992, timeFactor);
      p.vy *= Math.pow(0.992, timeFactor);

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
          // Matter-Antimatter Annihilation Check
          const isElectronPositron = (p.elementId === 'electron' && p2.elementId === 'positron') || (p.elementId === 'positron' && p2.elementId === 'electron');
          const isProtonAntiproton = (p.elementId === 'proton' && p2.elementId === 'antiproton') || (p.elementId === 'antiproton' && p2.elementId === 'proton');
          
          if (isElectronPositron || isProtonAntiproton) {
            consumedIds.add(p.id);
            consumedIds.add(p2.id);

            const midX = (p.x + p2.x) / 2;
            const midY = (p.y + p2.y) / 2;

            this.spawnParticle('photon', midX - 8, midY, -10, (Math.random() - 0.5) * 6);
            this.spawnParticle('energy_packet', midX + 8, midY, 10, (Math.random() - 0.5) * 6);
            this.addShockwave(midX, midY, '#EC4899', 300);
            this.addFloatingText('E = mc² Annihilation!', midX, midY - 20, '#FF00FE');
            soundEngine.playBigBang();
            break;
          }

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
              this.addFloatingText(`Synthesis: ${ELEMENTS[matchedRule.output]?.name || matchedRule.output}!`, midX, midY - 20, '#FACC15');
              soundEngine.playDiscovery();

              if (this.onDiscover) {
                this.onDiscover(matchedRule.output);
              }
              break;
            }
          }
        }
      }
    });

    // Remove consumed particles
    if (consumedIds.size > 0) {
      this.particles = this.particles.filter(p => !consumedIds.has(p.id));
    }
  }

  applyMutualForces(timeFactor: number = 1.0) {
    // Gravity Well (Attractor Tool)
    if (this.isAttracting) {
      this.particles.forEach(p => {
        const dx = this.attractX - p.x;
        const dy = this.attractY - p.y;
        const distSq = dx * dx + dy * dy + 100;
        const dist = Math.sqrt(distSq);
        const force = (800 * this.gravScale * timeFactor) / distSq;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      });
    }

    // Mutual Gravitational and Electromagnetic Forces
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSq = dx * dx + dy * dy + 100;
        const dist = Math.sqrt(distSq);

        const gravForce = (p1.mass * p2.mass * 0.00004 * this.gravScale * timeFactor) / distSq;
        const emForce = -(p1.charge * p2.charge * 0.4 * this.emScale * timeFactor) / distSq;

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

  calculateEntropy(): number {
    if (this.particles.length <= 1) return 0.0;
    let avgVx = 0, avgVy = 0;
    this.particles.forEach(p => { avgVx += p.vx; avgVy += p.vy; });
    avgVx /= this.particles.length;
    avgVy /= this.particles.length;

    let velocityVariance = 0;
    this.particles.forEach(p => {
      const dvx = p.vx - avgVx;
      const dvy = p.vy - avgVy;
      velocityVariance += (dvx * dvx + dvy * dvy);
    });
    velocityVariance /= this.particles.length;

    const entropy = Math.log(velocityVariance + 1) * (this.temp / 1000) * Math.min(5.0, this.particles.length * 0.1);
    return Number(entropy.toFixed(2));
  }
}
