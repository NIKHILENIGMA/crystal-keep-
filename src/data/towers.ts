export const TowerType = {
  GATLING : 0, // Fast, low dmg, single target
  CANNON : 1,  // Slow, high dmg, splash area
  SLOWER : 2   // No dmg, applies slow debuff in area
} as const;

export type TowerType = typeof TowerType[keyof typeof TowerType];

export interface TowerDef {
  id: TowerType;
  name: string;
  baseCost: number;
  range: number;
  damage: number;
  cooldownMs: number;
  splashRadius: number; // 0 for single target
  slowFactor: number; // 1.0 = no slow, 0.5 = half speed
  color: string;
  maxLevel: number;
}

export const TOWER_DATA: Record<TowerType, TowerDef> = {
  [TowerType.GATLING]: { 
    id: TowerType.GATLING, name: 'Gatling', baseCost: 50, range: 120, damage: 10, 
    cooldownMs: 200, splashRadius: 0, slowFactor: 1, color: '#4585f4', maxLevel: 5
  },
  [TowerType.CANNON]: { 
    id: TowerType.CANNON, name: 'Cannon', baseCost: 120, range: 150, damage: 40, 
    cooldownMs: 1200, splashRadius: 60, slowFactor: 1, color: '#a03232', maxLevel: 4
  },
  [TowerType.SLOWER]: { 
    id: TowerType.SLOWER, name: 'Cryo Emitter', baseCost: 80, range: 100, damage: 0, 
    cooldownMs: 100, splashRadius: 0, slowFactor: 0.5, color: '#32a0a0', maxLevel: 3
  }
};
