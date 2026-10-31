import { Particle, FloatingText, Shockwave } from './types';
import { ELEMENTS, REACTION_RULES } from './constants';
import { soundEngine } from './SoundEngine';

export class GameEngine {
  particles: Particle[] = [];
  floatingTexts: FloatingText[] = [];
  shockwaves: Shockwave[] = [];
  
  universeAge: number = 0; // in seconds or years
  pressure: number = 1.0; // GPa
  timeWarp: number = 1;
  isPaused: boolean = false;

  // Viewport transform
  panX: number = 0;
  panY: number = 0;
  zoom: number = 1;

  // Dragging interaction
  draggingElementId: string | null = null;
  dragStartX: number = 0;
  dragStartY: number = 0;
  dragCurrentX: number = 0;
  dragCurrentY: number = 0;

  // Callbacks
  onDiscover?: (elementId: string) => void;

  constructor() {}

  init() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
    this.universeAge = 0;
  }

  spawnParticle(elementId: string, x: number, y: number, customVx?: number, customVy?: number) {
    const def = ELEMENTS[elementId];
    if (!def) return;

    this.particles.push({
      id: Math.random().toString(36).substring(2, 9),
      elementId,
      x,
      y,
      vx: customVx ?? (Math.random() - 0.5) * 4,
      vy: customVy ?? (Math.random() - 0.5) * 4,
      radius: def.radius,
      temp: 300,
      energy: def.mass,
      mass: def.mass,
      charge: def.atomicNumber ? def.atomicNumber * 0.1 : 0,
      state: 'gas'
    });
  }

  initiateBigBang(width: number, height: number, temp: number) {
    this.init();
    soundEngine.playBigBang();
    this.addShockwave(width / 2, height / 2, '#00F0FF');

    // Spawn initial quarks and electrons
    const cx = width / 2;
    const cy = height / 2;
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.spawnParticle('up_quark', cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.spawnParticle('down_quark', cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      this.spawnParticle('electron', cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    this.addFloatingText('Big Bang Initiated! T = 0', cx, cy - 40, '#00F0FF');
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

  addShockwave(x: number, y: number, color: string = '#ffffff') {
    this.shockwaves.push({
      id: Math.random().toString(36),
      x,
      y,
      radius: 5,
      maxRadius: 150,
      color,
      opacity: 0.8
    });
  }

  update(width: number, height: number, globalTemp: number) {
    if (this.isPaused) return;

    const dt = 0.016 * this.timeWarp;
    this.universeAge += dt * 1000;

    // Update floating texts
    this.floatingTexts.forEach(ft => {
      ft.life++;
      ft.y -= 0.5;
    });
    this.floatingTexts = this.floatingTexts.filter(ft => ft.life < ft.maxLife);

    // Update shockwaves
    this.shockwaves.forEach(sw => {
      sw.radius += 4 * this.timeWarp;
      sw.opacity -= 0.02 * this.timeWarp;
    });
    this.shockwaves = this.shockwaves.filter(sw => sw.opacity > 0);

    // Center reaction zone gravity pull towards center
    const cx = width / 2;
    const cy = height / 2;

    // Update particles
    this.particles.forEach(p => {
      p.x += p.vx * this.timeWarp;
      p.y += p.vy * this.timeWarp;

      // Subtle friction / damping
      p.vx *= 0.995;
      p.vy *= 0.995;

      // Wall bounce
      const margin = p.radius;
      if (p.x < margin) { p.x = margin; p.vx *= -0.8; }
      if (p.x > width - margin) { p.x = width - margin; p.vx *= -0.8; }
      if (p.y < margin) { p.y = margin; p.vy *= -0.8; }
      if (p.y > height - margin) { p.y = height - margin; p.vy *= -0.8; }

      p.temp = globalTemp;
    });

    // Check collisions and reaction rules
    const consumedIds = new Set<string>();

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];

        if (consumedIds.has(p1.id) || consumedIds.has(p2.id)) continue;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist) {
          // Elastic collision bounce
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const kx = p1.vx - p2.vx;
          const ky = p1.vy - p2.vy;
          const p = 2 * (nx * kx + ny * ky) / (p1.mass + p2.mass);

          p1.vx -= p * p2.mass * nx * 0.5;
          p1.vy -= p * p2.mass * ny * 0.5;
          p2.vx += p * p1.mass * nx * 0.5;
          p2.vy += p * p1.mass * ny * 0.5;

          if (Math.abs(kx) + Math.abs(ky) > 2) {
            soundEngine.playCollision(p1.mass + p2.mass);
          }

          // Check chemical / nuclear reactions between p1 and p2
          const matchedRule = REACTION_RULES.find(rule => {
            if (rule.inputs.length === 2) {
              return (
                (rule.inputs[0] === p1.elementId && rule.inputs[1] === p2.elementId) ||
                (rule.inputs[0] === p2.elementId && rule.inputs[1] === p1.elementId)
              );
            }
            return false;
          });

          if (matchedRule) {
            // Check temp constraints
            const tempOk = 
              (!matchedRule.minTemp || globalTemp >= matchedRule.minTemp) &&
              (!matchedRule.maxTemp || globalTemp <= matchedRule.maxTemp);

            if (tempOk) {
              consumedIds.add(p1.id);
              consumedIds.add(p2.id);

              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;

              this.spawnParticle(matchedRule.output, midX, midY, (p1.vx + p2.vx) / 2, (p1.vy + p2.vy) / 2);
              this.addShockwave(midX, midY, ELEMENTS[matchedRule.output]?.color || '#ffffff');
              this.addFloatingText(`+${matchedRule.output.toUpperCase()}!`, midX, midY - 15, '#00F0FF');

              if (this.onDiscover) {
                this.onDiscover(matchedRule.output);
              }
            }
          }
        }
      }
    }

    this.particles = this.particles.filter(p => !consumedIds.has(p.id));

    // 3-input or 4-input complex check near center reaction reticle
    this.checkComplexReactions(width, height, globalTemp);
  }

  private checkComplexReactions(width: number, height: number, globalTemp: number) {
    // Check if any rules with 3+ inputs match particles close to each other
    const complexRules = REACTION_RULES.filter(r => r.inputs.length >= 3);
    if (complexRules.length === 0 || this.particles.length < 3) return;

    for (const rule of complexRules) {
      // Find if we have all input types in particles
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
        const tempOk = 
          (!rule.minTemp || globalTemp >= rule.minTemp) &&
          (!rule.maxTemp || globalTemp <= rule.maxTemp);

        if (tempOk) {
          // Check if they are reasonably close to each other (clustering near center or each other)
          const avgX = matchedParticles.reduce((acc, p) => acc + p.x, 0) / matchedParticles.length;
          const avgY = matchedParticles.reduce((acc, p) => acc + p.y, 0) / matchedParticles.length;

          // Remove matched particles
          const removeSet = new Set(matchedParticles.map(p => p.id));
          this.particles = this.particles.filter(p => !removeSet.has(p.id));

          this.spawnParticle(rule.output, avgX, avgY);
          this.addShockwave(avgX, avgY, ELEMENTS[rule.output]?.color || '#FF007A');
          this.addFloatingText(`Synthesis: ${ELEMENTS[rule.output]?.name}!`, avgX, avgY - 20, '#FFB800');
          soundEngine.playDiscovery();

          if (this.onDiscover) {
            this.onDiscover(rule.output);
          }
          break;
        }
      }
    }
  }
}
