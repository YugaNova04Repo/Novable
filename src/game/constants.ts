import { ElementDefinition, ReactionRule, Epoch, Milestone } from './types';

export const ELEMENTS: Record<string, ElementDefinition> = {
  up_quark: {
    id: 'up_quark',
    name: 'Up Quark',
    symbol: 'u',
    category: 'quantum',
    mass: 2.2,
    description: 'Fundamental constituent of matter carrying a +2/3 electric charge.',
    color: '#00F0FF',
    radius: 3,
    unlockedByDefault: true,
  },
  down_quark: {
    id: 'down_quark',
    name: 'Down Quark',
    symbol: 'd',
    category: 'quantum',
    mass: 4.7,
    description: 'Fundamental constituent of matter carrying a -1/3 electric charge.',
    color: '#FF007A',
    radius: 3,
    unlockedByDefault: true,
  },
  electron: {
    id: 'electron',
    name: 'Electron',
    symbol: 'e⁻',
    category: 'quantum',
    mass: 0.511,
    description: 'Subatomic particle with a negative elementary electric charge.',
    color: '#FFFF00',
    radius: 2,
    unlockedByDefault: true,
  },
  proton: {
    id: 'proton',
    name: 'Proton',
    symbol: 'p⁺',
    category: 'subatomic',
    atomicNumber: 1,
    mass: 938.3,
    description: 'Composite subatomic particle made of two up quarks and one down quark.',
    color: '#FFB800',
    radius: 6,
    unlockedByDefault: true,
  },
  neutron: {
    id: 'neutron',
    name: 'Neutron',
    symbol: 'n⁰',
    category: 'subatomic',
    mass: 939.6,
    description: 'Composite subatomic particle without net electric charge.',
    color: '#A0A0A0',
    radius: 6,
    unlockedByDefault: true,
  },
  hydrogen: {
    id: 'hydrogen',
    name: 'Hydrogen',
    symbol: 'H',
    category: 'element',
    atomicNumber: 1,
    mass: 1.008,
    boilingPoint: 20.28,
    meltingPoint: 14.01,
    description: 'The lightest and most abundant chemical element in the universe.',
    color: '#4DFF4D',
    radius: 9,
    unlockedByDefault: true,
  },
  helium: {
    id: 'helium',
    name: 'Helium',
    symbol: 'He',
    category: 'element',
    atomicNumber: 2,
    mass: 4.0026,
    boilingPoint: 4.22,
    meltingPoint: 0.95,
    description: 'Colorless, odorless, tasteless, non-toxic noble gas.',
    color: '#9933FF',
    radius: 10,
  },
  carbon: {
    id: 'carbon',
    name: 'Carbon',
    symbol: 'C',
    category: 'element',
    atomicNumber: 6,
    mass: 12.011,
    boilingPoint: 4300,
    meltingPoint: 3825,
    description: 'Tetravalent nonmetal, the chemical basis of all known organic life.',
    color: '#333333',
    radius: 12,
  },
  oxygen: {
    id: 'oxygen',
    name: 'Oxygen',
    symbol: 'O',
    category: 'element',
    atomicNumber: 8,
    mass: 15.999,
    boilingPoint: 90.2,
    meltingPoint: 54.36,
    description: 'Highly reactive nonmetal and oxidizing agent.',
    color: '#FF3333',
    radius: 11,
  },
  water: {
    id: 'water',
    name: 'Water',
    symbol: 'H₂O',
    category: 'molecule',
    mass: 18.015,
    boilingPoint: 373.15,
    meltingPoint: 273.15,
    description: 'Universal solvent and essential molecule for planetary habitability.',
    color: '#3399FF',
    radius: 14,
  },
  carbon_dioxide: {
    id: 'carbon_dioxide',
    name: 'Carbon Dioxide',
    symbol: 'CO₂',
    category: 'molecule',
    mass: 44.01,
    boilingPoint: 194.7,
    meltingPoint: 216.6,
    description: 'Colorless gas with density about 53% higher than that of dry air.',
    color: '#996633',
    radius: 15,
  },
  methane: {
    id: 'methane',
    name: 'Methane',
    symbol: 'CH₄',
    category: 'molecule',
    mass: 16.04,
    boilingPoint: 111.6,
    meltingPoint: 90.7,
    description: 'Simplest alkane and principal component of natural gas.',
    color: '#33CC66',
    radius: 14,
  },
  silicate: {
    id: 'silicate',
    name: 'Silicate Dust',
    symbol: 'SiO₄',
    category: 'astrophysics',
    mass: 60.08,
    boilingPoint: 1900,
    meltingPoint: 1700,
    description: 'Refractory mineral dust forming the bedrock of terrestrial planets.',
    color: '#CC9966',
    radius: 16,
  },
  iron: {
    id: 'iron',
    name: 'Iron',
    symbol: 'Fe',
    category: 'element',
    atomicNumber: 26,
    mass: 55.845,
    boilingPoint: 3134,
    meltingPoint: 1811,
    description: 'Transition metal formed in stellar nucleosynthesis of massive stars.',
    color: '#B87333',
    radius: 15,
  },
  plasma_cloud: {
    id: 'plasma_cloud',
    name: 'Plasma Ion',
    symbol: 'Ion+',
    category: 'astrophysics',
    mass: 2.0,
    boilingPoint: 10000,
    meltingPoint: 5000,
    description: 'High-energy ionized gas state fundamental to stellar cores.',
    color: '#FF6600',
    radius: 13,
  }
};

export const REACTION_RULES: ReactionRule[] = [
  // Subatomic formation
  {
    inputs: ['up_quark', 'up_quark', 'down_quark'],
    output: 'proton',
    maxTemp: 10000,
    energyChange: 938,
    description: 'Strong force confinement binds 2 up and 1 down quark into a stable proton.'
  },
  {
    inputs: ['up_quark', 'down_quark', 'down_quark'],
    output: 'neutron',
    maxTemp: 10000,
    energyChange: 939,
    description: 'Strong force confinement binds 1 up and 2 down quarks into a neutron.'
  },
  // Element formation (Nucleosynthesis)
  {
    inputs: ['proton', 'neutron'],
    output: 'hydrogen',
    maxTemp: 5000,
    energyChange: 2.22,
    description: 'Radiative capture fuses a proton and neutron into a deuterium/hydrogen nucleus.'
  },
  {
    inputs: ['hydrogen', 'hydrogen'],
    output: 'helium',
    minTemp: 1000,
    maxTemp: 8000,
    energyChange: 24.6,
    description: 'Nuclear fusion under heat and pressure creates Helium.'
  },
  {
    inputs: ['helium', 'helium'],
    output: 'carbon',
    minTemp: 3000,
    maxTemp: 9000,
    energyChange: 7.2,
    description: 'Triple-alpha process fuses helium nuclei into carbon in stellar cores.'
  },
  {
    inputs: ['carbon', 'helium'],
    output: 'oxygen',
    minTemp: 4000,
    maxTemp: 9500,
    energyChange: 7.1,
    description: 'Alpha capture on carbon produces stable oxygen.'
  },
  // Chemical compounds
  {
    inputs: ['hydrogen', 'hydrogen', 'oxygen'],
    output: 'water',
    maxTemp: 400,
    energyChange: -285.8,
    description: 'Exothermic combustion reaction synthesizes water molecules.'
  },
  {
    inputs: ['carbon', 'oxygen', 'oxygen'],
    output: 'carbon_dioxide',
    maxTemp: 600,
    energyChange: -393.5,
    description: 'Oxidation of carbon yields carbon dioxide gas.'
  },
  {
    inputs: ['carbon', 'hydrogen', 'hydrogen', 'hydrogen', 'hydrogen'],
    output: 'methane',
    maxTemp: 350,
    energyChange: -74.8,
    description: 'Hydrogenation of carbon forms methane.'
  },
  {
    inputs: ['oxygen', 'silicate'],
    output: 'silicate',
    minTemp: 500,
    energyChange: -100,
    description: 'Silicate crystallization in cooling protoplanetary discs.'
  }
];

export const EPOCHS: Epoch[] = [
  {
    id: 1,
    title: 'Epoch I: The Planck Singularity',
    subtitle: 'T = 0 to 10⁻⁴³ s',
    description: 'High-energy quantum fluctuations in extreme temperatures generate raw quarks and leptons.',
    requiredDiscoveries: 3
  },
  {
    id: 2,
    title: 'Epoch II: Hadron & Nucleosynthesis',
    subtitle: 'T = 1s to 380,000 Years',
    description: 'Quarks confine into protons and neutrons as the universe cools, initiating primordial fusion.',
    requiredDiscoveries: 6
  },
  {
    id: 3,
    title: 'Epoch III: Stellar & Molecular Genesis',
    subtitle: 'T = Millions of Years',
    description: 'Gravity ignites stars, forging heavy elements like carbon and oxygen which bond into molecules.',
    requiredDiscoveries: 10
  },
  {
    id: 4,
    title: 'Epoch IV: Planetary Habitable Matrix',
    subtitle: 'T = Cosmic Present',
    description: 'Complex molecules, liquid water, and silicates form stable planetary crusts and atmospheres.',
    requiredDiscoveries: 14
  }
];

export const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    title: 'Quantum Awakening',
    description: 'Discover all 3 fundamental subatomic quantum particles.',
    reward: '+50 Quantum Energy',
    completed: false,
    check: (state) => state.discovered.has('up_quark') && state.discovered.has('down_quark') && state.discovered.has('electron')
  },
  {
    id: 'm2',
    title: 'Hadron Confinement',
    description: 'Synthesize both Protons and Neutrons.',
    reward: 'Nuclear Stability',
    completed: false,
    check: (state) => state.discovered.has('proton') && state.discovered.has('neutron')
  },
  {
    id: 'm3',
    title: 'Stellar Ignition',
    description: 'Cool the universe below 4,000K and successfully fuse Hydrogen into Helium.',
    reward: 'Fusion Catalyst',
    completed: false,
    check: (state) => state.discovered.has('helium') && state.temp <= 4000
  },
  {
    id: 'm4',
    title: 'Universal Solvent',
    description: 'Synthesize liquid Water (H₂O) from Hydrogen and Oxygen.',
    reward: 'Habitability Index +25%',
    completed: false,
    check: (state) => state.discovered.has('water')
  },
  {
    id: 'm5',
    title: 'Master Architect',
    description: 'Discover all 14 base elements and molecules in the Genesis Codex.',
    reward: 'Infinity Sandbox Mode Unlocked',
    completed: false,
    check: (state) => state.discovered.size >= 14
  }
];
