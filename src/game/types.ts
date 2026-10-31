export type Category = 'quantum' | 'subatomic' | 'element' | 'molecule' | 'astrophysics';

export interface ElementDefinition {
  id: string;
  name: string;
  symbol: string;
  category: Category;
  atomicNumber?: number;
  mass: number; // in atomic mass units or MeV
  boilingPoint?: number; // Kelvin
  meltingPoint?: number; // Kelvin
  description: string;
  color: string;
  radius: number;
  unlockedByDefault?: boolean;
}

export interface Particle {
  id: string;
  elementId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  temp: number;
  energy: number;
  mass: number;
  charge: number;
  state: 'solid' | 'liquid' | 'gas' | 'plasma' | 'energy';
  life?: number; // For temporary effects
  maxLife?: number;
}

export interface ReactionRule {
  inputs: string[]; // Element IDs required
  output: string;
  minTemp?: number;
  maxTemp?: number;
  minPressure?: number;
  energyChange: number; // MeV or kJ
  description: string;
}

export interface Epoch {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  requiredDiscoveries: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
  check: (state: { discovered: Set<string>; temp: number; pressure: number; particleCount: number }) => boolean;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface Shockwave {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  opacity: number;
}
