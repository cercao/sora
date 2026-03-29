// Base world size (baseline for ~5 echoes).
export const BASE_WORLD_WIDTH = 5000;
export const BASE_WORLD_HEIGHT = 3000;

// Minimum world area (px²) allocated per echo so spacing stays comfortable.
const AREA_PER_ECHO = 600_000;

export interface BiomeDefinition {
  id: string;
  name: string;
  description: string;
  wx: number; // world x center (absolute)
  wy: number; // world y center (absolute)
  islandWidth: number;
  islandHeight: number;
  theme: 'origin' | 'canopy' | 'ruins' | 'cloud' | 'ember';
  accentColor: number;
  glowColor: number;
}

// Biome layout expressed as fractions [0..1] of world dimensions.
// Keeping ratios rather than absolute coords allows the world to scale freely.
const BIOME_LAYOUT: Array<Omit<BiomeDefinition, 'wx' | 'wy'> & { rx: number; ry: number }> = [
  {
    id: 'origin',
    name: 'The Origin',
    description: 'Where it all begins.',
    rx: 0.50, ry: 0.633,
    islandWidth: 380, islandHeight: 80,
    theme: 'origin',
    accentColor: 0x78b84a,
    glowColor: 0xd4f0a0,
  },
  {
    id: 'canopy',
    name: 'The Canopy',
    description: 'Dense and ancient. Something watches.',
    rx: 0.18, ry: 0.267,
    islandWidth: 280, islandHeight: 65,
    theme: 'canopy',
    accentColor: 0x2d6e4e,
    glowColor: 0x80ffb0,
  },
  {
    id: 'ruins',
    name: 'The Ruins',
    description: 'Someone was here before you.',
    rx: 0.78, ry: 0.700,
    islandWidth: 320, islandHeight: 70,
    theme: 'ruins',
    accentColor: 0x8a7060,
    glowColor: 0xffd080,
  },
  {
    id: 'cloud',
    name: 'Cloud Archipelago',
    description: 'The air is thinner here. Dreams linger.',
    rx: 0.74, ry: 0.200,
    islandWidth: 180, islandHeight: 45,
    theme: 'cloud',
    accentColor: 0xb0d8f0,
    glowColor: 0xffffff,
  },
  {
    id: 'ember',
    name: 'Ember Isle',
    description: 'Warm. Restless. Alive.',
    rx: 0.14, ry: 0.767,
    islandWidth: 240, islandHeight: 60,
    theme: 'ember',
    accentColor: 0xc05020,
    glowColor: 0xff8040,
  },
];

/**
 * Computes world dimensions based on the number of echoes.
 * The world grows proportionally so echo spacing stays comfortable
 * even with 50, 100, or 500 echoes.
 */
export function computeWorldSize(echoCount: number): { width: number; height: number } {
  const baseArea = BASE_WORLD_WIDTH * BASE_WORLD_HEIGHT;
  const neededArea = Math.max(baseArea, echoCount * AREA_PER_ECHO);
  const scale = Math.sqrt(neededArea / baseArea);
  return {
    width: Math.round(BASE_WORLD_WIDTH * scale),
    height: Math.round(BASE_WORLD_HEIGHT * scale),
  };
}

/**
 * Returns biomes with absolute world coordinates for the given world size.
 */
export function getBiomes(worldWidth: number, worldHeight: number): BiomeDefinition[] {
  return BIOME_LAYOUT.map(({ rx, ry, ...rest }) => ({
    ...rest,
    wx: Math.round(rx * worldWidth),
    wy: Math.round(ry * worldHeight),
  }));
}

// Default world configuration (matches the 5-echo baseline).
export const WORLD_WIDTH = BASE_WORLD_WIDTH;
export const WORLD_HEIGHT = BASE_WORLD_HEIGHT;
export const BIOMES = getBiomes(WORLD_WIDTH, WORLD_HEIGHT);
