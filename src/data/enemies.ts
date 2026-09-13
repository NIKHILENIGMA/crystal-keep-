export const EnemyType = {
  NORMAL : 0,
  FAST : 1,
  TANK : 2,
  FLYING : 3 
} as const;

export type EnemyType = typeof EnemyType[keyof typeof EnemyType];

export interface EnemyDef {
  id: EnemyType;
  baseHp: number;
  speed: number; // Pixels per second
  bounty: number; // Gold given on kill
  radius: number; // For rendering & splash hitboxes
  color: string;
}

export const ENEMY_DATA: Record<EnemyType, EnemyDef> = {
  [EnemyType.NORMAL]: { id: EnemyType.NORMAL, baseHp: 30, speed: 50, bounty: 5, radius: 10, color: '#ea4335' },
  [EnemyType.FAST]: { id: EnemyType.FAST, baseHp: 15, speed: 100, bounty: 5, radius: 8, color: '#fbbc05' },
  [EnemyType.TANK]: { id: EnemyType.TANK, baseHp: 150, speed: 30, bounty: 15, radius: 14, color: '#555555' },
  [EnemyType.FLYING]: { id: EnemyType.FLYING, baseHp: 20, speed: 65, bounty: 8, radius: 10, color: '#34a853' }
};
