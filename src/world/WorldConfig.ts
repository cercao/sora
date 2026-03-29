export const WORLD_WIDTH = 5000;
export const WORLD_HEIGHT = 3000;

export interface BiomeDefinition {
  id: string;
  name: string;
  description: string;
  wx: number; // world x center
  wy: number; // world y center
  islandWidth: number;
  islandHeight: number;
  theme: 'origin' | 'canopy' | 'ruins' | 'cloud' | 'ember';
  accentColor: number;
  glowColor: number;
}

export const BIOMES: BiomeDefinition[] = [
  {
    id: 'origin',
    name: 'The Origin',
    description: 'Where it all begins.',
    wx: 2500, wy: 1900,
    islandWidth: 380, islandHeight: 80,
    theme: 'origin',
    accentColor: 0x78b84a,
    glowColor: 0xd4f0a0,
  },
  {
    id: 'canopy',
    name: 'The Canopy',
    description: 'Dense and ancient. Something watches.',
    wx: 900, wy: 800,
    islandWidth: 280, islandHeight: 65,
    theme: 'canopy',
    accentColor: 0x2d6e4e,
    glowColor: 0x80ffb0,
  },
  {
    id: 'ruins',
    name: 'The Ruins',
    description: 'Someone was here before you.',
    wx: 3900, wy: 2100,
    islandWidth: 320, islandHeight: 70,
    theme: 'ruins',
    accentColor: 0x8a7060,
    glowColor: 0xffd080,
  },
  {
    id: 'cloud',
    name: 'Cloud Archipelago',
    description: 'The air is thinner here. Dreams linger.',
    wx: 3700, wy: 600,
    islandWidth: 180, islandHeight: 45,
    theme: 'cloud',
    accentColor: 0xb0d8f0,
    glowColor: 0xffffff,
  },
  {
    id: 'ember',
    name: 'Ember Isle',
    description: 'Warm. Restless. Alive.',
    wx: 700, wy: 2300,
    islandWidth: 240, islandHeight: 60,
    theme: 'ember',
    accentColor: 0xc05020,
    glowColor: 0xff8040,
  },
];
