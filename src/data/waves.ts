import { EnemyType } from './enemies';

export interface WaveGroup {
  type: EnemyType;
  count: number;
  intervalMs: number;
}

export interface WaveDef {
  hpMultiplier: number;
  groups: WaveGroup[];
  reward: number; // Gold given when wave completes
}

export const WAVES: WaveDef[] = [];

// Generate 50 waves procedurally as data
for (let i = 1; i <= 50; i++) {
  const wave: WaveDef = { 
    hpMultiplier: 1 + (i * 0.2), // HP scales up 20% per wave
    groups: [], 
    reward: 100 + i * 10 
  };
  
  if (i <= 5) {
    wave.groups.push({ type: EnemyType.NORMAL, count: 5 + i * 2, intervalMs: 1000 - i * 50 });
  } else if (i <= 10) {
    wave.groups.push({ type: EnemyType.NORMAL, count: 10, intervalMs: 800 });
    wave.groups.push({ type: EnemyType.FAST, count: i * 2, intervalMs: 600 });
  } else {
    // Introduce Tanks and Flyers and scale up counts
    const numTanks = Math.floor(i / 3);
    const numFast = i * 2;
    const numFlying = Math.floor(i / 2);
    
    if (i % 3 === 0) wave.groups.push({ type: EnemyType.TANK, count: numTanks, intervalMs: 1500 });
    wave.groups.push({ type: EnemyType.NORMAL, count: 10 + i, intervalMs: 500 });
    wave.groups.push({ type: EnemyType.FAST, count: numFast, intervalMs: 400 });
    if (i > 15) wave.groups.push({ type: EnemyType.FLYING, count: numFlying, intervalMs: 700 });
  }
  
  WAVES.push(wave);
}
