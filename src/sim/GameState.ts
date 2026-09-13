import { EnemyPool } from './EnemyPool';
import { ProjectilePool } from './ProjectilePool';
import { Tower } from './Tower';
import { FXPool } from './FXPool';
import { Path } from './Path';
import { SpatialGrid } from './Grid';
import { level1 } from '../data/level';
import { WAVES } from '../data/waves';
import { ENEMY_DATA, EnemyType } from '../data/enemies';
import { TowerType, TOWER_DATA } from '../data/towers';

export class GameState {
  public enemies = new EnemyPool(5000);
  public projectiles = new ProjectilePool(2000);
  public grid = new SpatialGrid(800, 600, 100, 5000);
  public towers: Tower[] = [];
  public path = new Path(level1.path);
  
  public gold: number = 200; // Starting gold
  public health: number = 20;
  public score: number = 0;

  public currentWaveIndex: number = 0;
  public activeGroupIndex: number = 0;
  public enemiesSpawnedInGroup: number = 0;
  public spawnTimer: number = 2000;
  public state: 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY' = 'PLAYING';

  public fx: FXPool = new FXPool(2000);

  // Scratch buffer to prevent allocations in hot loops
  private queryBuffer = new Int32Array(50);

  public simulate(dtMs: number) {
    if (this.state !== 'PLAYING') return;
    const dtSec = dtMs / 1000;

    this.runWaves(dtMs);
    this.fx.update(dtMs);
    
    // 1. Enemy Movement and Grid Re-binning
    this.grid.clear();
    let anyEnemyAlive = false;
    
    for (let i = 0; i < this.enemies.capacity; i++) {
      if (this.enemies.alive[i]) {
        anyEnemyAlive = true;
        this.enemies.pathT[i] += this.enemies.speed[i] * dtSec;
        
        if (this.enemies.pathT[i] >= this.path.totalLength) {
          this.health -= 1;
          this.enemies.release(i);
          if (this.health <= 0) this.state = 'GAME_OVER';
        } else {
          const pos = this.path.getPosition(this.enemies.pathT[i]);
          this.enemies.x[i] = pos.x;
          this.enemies.y[i] = pos.y;
          this.grid.insert(i, pos.x, pos.y);
        }
      }
    }

    // 2. Tower Logic & Firing (uses O(1) Spatial Grid query)
    for (const tower of this.towers) {
      tower.cooldownTimer -= dtMs;
      
      if (tower.cooldownTimer <= 0) {
        const found = this.grid.query(tower.x, tower.y, tower.range, this.enemies.x, this.enemies.y, this.queryBuffer);
        
        if (found > 0) {
          const targetId = this.queryBuffer[0];
          const dx = this.enemies.x[targetId] - tower.x;
          const dy = this.enemies.y[targetId] - tower.y;
          const mag = Math.sqrt(dx*dx + dy*dy);
          const pSpeed = 600; 
          
          this.projectiles.spawn(
            tower.x, tower.y, 
            (dx / mag) * pSpeed, (dy / mag) * pSpeed,
            tower.damage, tower.def.splashRadius, tower.def.slowFactor,
            targetId
          );
          
          tower.cooldownTimer = tower.def.cooldownMs;
        }
      }
    }

    // 3. Projectile Movement and Collision
    for (let i = 0; i < this.projectiles.capacity; i++) {
      if (this.projectiles.alive[i]) {
        this.projectiles.lifeMs[i] -= dtMs;
        if (this.projectiles.lifeMs[i] <= 0) {
          this.projectiles.release(i);
          continue;
        }

        // Apply Homing
        const targetId = this.projectiles.targetEnemyId[i];
        if (targetId !== -1 && this.enemies.alive[targetId]) {
           const dx = this.enemies.x[targetId] - this.projectiles.x[i];
           const dy = this.enemies.y[targetId] - this.projectiles.y[i];
           const mag = Math.sqrt(dx*dx + dy*dy);
           if (mag > 0) {
             const pSpeed = 600;
             this.projectiles.vx[i] = (dx / mag) * pSpeed;
             this.projectiles.vy[i] = (dy / mag) * pSpeed;
           }
        }

        this.projectiles.x[i] += this.projectiles.vx[i] * dtSec;
        this.projectiles.y[i] += this.projectiles.vy[i] * dtSec;

        // Collision Check via Grid
        const count = this.grid.query(this.projectiles.x[i], this.projectiles.y[i], 15, this.enemies.x, this.enemies.y, this.queryBuffer);
        
        if (count > 0) {
           const splash = this.projectiles.splashRadius[i];
           const px = this.projectiles.x[i];
           const py = this.projectiles.y[i];
           
           if (splash > 0) {
              const splashCount = this.grid.query(px, py, splash, this.enemies.x, this.enemies.y, this.queryBuffer);
              for (let k = 0; k < splashCount; k++) {
                this.damageEnemy(this.queryBuffer[k], this.projectiles.damage[i], this.projectiles.slowFactor[i]);
              }
           } else {
              this.damageEnemy(this.queryBuffer[0], this.projectiles.damage[i], this.projectiles.slowFactor[i]);
           }
           
           // Particle Explosion
           for (let k = 0; k < 5; k++) {
             this.fx.spawn(0, px, py, (Math.random()-0.5)*150, (Math.random()-0.5)*150, 0.2 + Math.random()*0.3, 0);
           }
           this.projectiles.release(i);
        }
      }
    }

    // Victory Check
    if (this.currentWaveIndex >= WAVES.length && !anyEnemyAlive) {
      this.state = 'VICTORY';
    }
  }

  private damageEnemy(id: number, amt: number, slowFactor: number) {
    this.enemies.hp[id] -= amt;
    if (slowFactor < 1.0) {
      const baseSpeed = ENEMY_DATA[this.enemies.typeId[id] as EnemyType].speed;
      this.enemies.speed[id] = baseSpeed * slowFactor;
    }
    
    // Floating damage text
    this.fx.spawn(1, this.enemies.x[id], this.enemies.y[id] - 10, (Math.random()-0.5)*30, -40, 0.7, Math.round(amt));
    
    if (this.enemies.hp[id] <= 0 && this.enemies.alive[id]) {
      this.enemies.release(id);
      this.gold += ENEMY_DATA[this.enemies.typeId[id] as EnemyType].bounty;
      this.score += 50;
    }
  }

  private runWaves(dtMs: number) {
    if (this.currentWaveIndex >= WAVES.length) return;

    this.spawnTimer -= dtMs;
    if (this.spawnTimer <= 0) {
      const wave = WAVES[this.currentWaveIndex];
      const group = wave.groups[this.activeGroupIndex];
      
      if (group) {
        const typeId = group.type;
        const def = ENEMY_DATA[typeId];
      
        // Wave difficulty scaling (Exponential)
        const hp = def.baseHp * Math.pow(1.10, this.currentWaveIndex);
      
        this.enemies.spawn(typeId, def.speed, hp);
        this.enemiesSpawnedInGroup++;
        this.spawnTimer = group.intervalMs;

        if (this.enemiesSpawnedInGroup >= group.count) {
          this.enemiesSpawnedInGroup = 0;
          this.activeGroupIndex++;
        }
      } else {
        this.gold += wave.reward;
        this.currentWaveIndex++;
        this.activeGroupIndex = 0;
        this.spawnTimer = 3000;
      }
    }
  }

  public triggerStressTest() {
    this.gold = 999999;
    this.health = 999999;
    
    // Spawn 100 towers randomly
    for (let i = 0; i < 100; i++) {
      const type = (i % 3) as TowerType;
      const x = 50 + Math.random() * 700;
      const y = 50 + Math.random() * 500;
      this.towers.push(new Tower(type, x, y));
    }
    
    // Spawn exactly 5000 enemies
    for (let i = 0; i < 5000; i++) {
      const id = this.enemies.spawn(0, 50 + Math.random() * 50, 200);
      if (id !== -1) {
        this.enemies.pathT[id] = Math.random() * this.path.totalLength;
      }
    }
    
    // Stop normal wave spawning
    this.currentWaveIndex = WAVES.length;
  }

  public canBuildTower(x: number, y: number): boolean {
    const CLEARANCE = 16 + 20; // 16px tower radius + 20px path buffer
    
    // 1. Path collision
    const step = 20;
    for (let t = 0; t <= this.path.totalLength; t += step) {
      const pos = this.path.getPosition(t);
      const dx = pos.x - x;
      const dy = pos.y - y;
      if (dx*dx + dy*dy < CLEARANCE*CLEARANCE) {
        return false;
      }
    }
    
    // 2. Tower Overlap
    for (const t of this.towers) {
      const dx = t.x - x;
      const dy = t.y - y;
      if (dx*dx + dy*dy < 32*32) { // 32px min distance between centers
        return false;
      }
    }
    return true;
  }

  public buildTower(type: TowerType, x: number, y: number) {
    if (!this.canBuildTower(x, y)) return;
    const def = TOWER_DATA[type];
    if (this.gold >= def.baseCost) {
      this.gold -= def.baseCost;
      this.towers.push(new Tower(type, x, y));
    }
  }

  public upgradeTower(index: number) {
    if (index < 0 || index >= this.towers.length) return;
    const tower = this.towers[index];
    if (tower.level >= tower.def.maxLevel) return;
    
    if (this.gold >= tower.upgradeCost) {
      this.gold -= tower.upgradeCost;
      tower.totalSpent += tower.upgradeCost;
      tower.level++;
    }
  }

  public sellTower(index: number) {
    if (index < 0 || index >= this.towers.length) return;
    const tower = this.towers[index];
    this.gold += tower.sellValue;
    this.towers.splice(index, 1);
  }
}
