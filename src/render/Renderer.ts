import { GameState } from '../sim/GameState';
import { ENEMY_DATA, EnemyType } from '../data/enemies';
import { TowerType, TOWER_DATA } from '../data/towers';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private state: GameState;

  public selectedTowerIndex: number = -1;
  public placementPreview: { type: TowerType, x: number, y: number } | null = null;
  public canPlacePreview: boolean = true;
  private bgImage = new Image();
  private enemyImages = new Map<EnemyType, HTMLImageElement>();
  private enemySprites = new Map<EnemyType, HTMLCanvasElement>();
  private towerSprites = new Map<TowerType, HTMLCanvasElement>();
  private towerImages = new Map<TowerType, HTMLImageElement>();

  constructor(canvas: HTMLCanvasElement, state: GameState) {
    this.ctx = canvas.getContext('2d')!;
    this.state = state;
    this.width = canvas.width = 800;
    this.height = canvas.height = 600;
    
    this.preRenderSprites();

    this.bgImage.src = '/assets/bg.jpg';
    
    const goblinImg = new Image(); goblinImg.src = '/assets/enemies/goblin.png?v=2';
    this.enemyImages.set(EnemyType.FAST, goblinImg);
    this.enemyImages.set(EnemyType.FLYING, goblinImg); // Reuse for flying
    
    const demonImg = new Image(); demonImg.src = '/assets/enemies/demon.png?v=2';
    this.enemyImages.set(EnemyType.NORMAL, demonImg);
    
    const golemImg = new Image(); golemImg.src = '/assets/enemies/golem.png?v=2';
    this.enemyImages.set(EnemyType.TANK, golemImg);

    const gatlingImg = new Image(); gatlingImg.src = '/assets/towers/gatling.jpg';
    this.towerImages.set(TowerType.GATLING, gatlingImg);
    const cannonImg = new Image(); cannonImg.src = '/assets/towers/cannon.jpg';
    this.towerImages.set(TowerType.CANNON, cannonImg);
    const cryoImg = new Image(); cryoImg.src = '/assets/towers/cryo.jpg';
    this.towerImages.set(TowerType.SLOWER, cryoImg);
  }

  private preRenderSprites() {
    for (const [idStr, def] of Object.entries(ENEMY_DATA)) {
      const type = parseInt(idStr) as EnemyType;
      const size = def.radius * 2;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(def.radius, def.radius, def.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(def.radius - 2, def.radius - 2, def.radius / 2, 0, Math.PI * 2);
      ctx.fill();
      
      this.enemySprites.set(type, c);
    }

    for (const [idStr, def] of Object.entries(TOWER_DATA)) {
      const type = parseInt(idStr) as TowerType;
      const size = 32;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      
      ctx.fillStyle = def.color;
      ctx.fillRect(0, 0, size, size);
      
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size-2, size-2);
      
      this.towerSprites.set(type, c);
    }
  }

  public setState(newState: GameState) {
    this.state = newState;
  }

  public render(alpha: number) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.bgImage.complete) {
      this.ctx.drawImage(this.bgImage, 0, 0, this.width, this.height);
    } else {
      this.ctx.fillStyle = '#1e1e1e';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Draw Placement Preview
    if (this.placementPreview) {
      const def = TOWER_DATA[this.placementPreview.type];
      const valid = this.canPlacePreview;

      this.ctx.fillStyle = valid ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 0, 0, 0.2)';
      this.ctx.beginPath();
      this.ctx.arc(this.placementPreview.x, this.placementPreview.y, def.range, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Green/Red Grid underneath
      this.ctx.strokeStyle = valid ? 'rgba(74, 222, 128, 0.4)' : 'rgba(248, 113, 113, 0.4)';
      this.ctx.fillStyle = valid ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)';
      this.ctx.lineWidth = 2;
      const gridSize = 40;
      for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
           this.ctx.fillRect(this.placementPreview.x - 20 + i*gridSize, this.placementPreview.y - 20 + j*gridSize, gridSize, gridSize);
           this.ctx.strokeRect(this.placementPreview.x - 20 + i*gridSize, this.placementPreview.y - 20 + j*gridSize, gridSize, gridSize);
        }
      }
      
      const img = this.towerImages.get(this.placementPreview.type);
      this.ctx.globalAlpha = 0.5;
      if (img && img.complete) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.placementPreview.x, this.placementPreview.y, 18, 0, Math.PI * 2);
        this.ctx.clip();
        this.ctx.drawImage(img, this.placementPreview.x - 18, this.placementPreview.y - 18, 36, 36);
        this.ctx.restore();
      } else {
        const sprite = this.towerSprites.get(this.placementPreview.type)!;
        this.ctx.drawImage(sprite, this.placementPreview.x - 16, this.placementPreview.y - 16);
      }
      this.ctx.globalAlpha = 1.0;
    }

    // Draw Towers
    for (let i = 0; i < this.state.towers.length; i++) {
      const tower = this.state.towers[i];
      
      // Range indicator (only show if selected)
      if (this.selectedTowerIndex === i) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }

      // Body (Image or Pre-rendered)
      const img = this.towerImages.get(tower.type);
      if (img && img.complete) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, 18, 0, Math.PI * 2);
        this.ctx.clip();
        this.ctx.drawImage(img, tower.x - 18, tower.y - 18, 36, 36);
        this.ctx.restore();
        
        // border
        this.ctx.strokeStyle = tower.def.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, 18, 0, Math.PI * 2);
        this.ctx.stroke();
      } else {
        const sprite = this.towerSprites.get(tower.type)!;
        this.ctx.drawImage(sprite, tower.x - 16, tower.y - 16);
      }
      
      // Level
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`L${tower.level}`, tower.x, tower.y + 28);
    }

    // Draw Enemies
    for (let i = 0; i < this.state.enemies.capacity; i++) {
      if (this.state.enemies.alive[i]) {
        const typeId = this.state.enemies.typeId[i] as EnemyType;
        const def = ENEMY_DATA[typeId];
        
        const interpolatedT = this.state.enemies.pathT[i] + (this.state.enemies.speed[i] * (alpha * 16.66) / 1000);
        const drawT = Math.min(interpolatedT, this.state.path.totalLength);
        const pos = this.state.path.getPosition(drawT);
        
        // Viewport culling (O(1) bounds check)
        if (pos.x + def.radius < 0 || pos.x - def.radius > this.width || 
            pos.y + def.radius < 0 || pos.y - def.radius > this.height) {
          continue; // Skip rendering if completely off-screen
        }

        // Draw Image or Pre-rendered Sprite
        const img = this.enemyImages.get(typeId);
        if (img && img.complete) {
          const size = def.radius * 4; // Greatly increased size for better visibility
          this.ctx.drawImage(img, pos.x - size/2, pos.y - size/2, size, size);
        } else {
          const sprite = this.enemySprites.get(typeId)!;
          this.ctx.drawImage(sprite, pos.x - def.radius, pos.y - def.radius);
        }
        
        // Dynamic max HP for the wave (Exponential)
        const maxHp = def.baseHp * Math.pow(1.10, this.state.currentWaveIndex);
        const hpPerc = this.state.enemies.hp[i] / maxHp;
        
        this.ctx.fillStyle = '#34a853';
        this.ctx.fillRect(pos.x - 10, pos.y - def.radius - 8, 20 * Math.max(0, hpPerc), 4);
      }
    }

    // Draw Projectiles
    for (let i = 0; i < this.state.projectiles.capacity; i++) {
      if (this.state.projectiles.alive[i]) {
        const dt = (alpha * 16.66) / 1000;
        const vx = this.state.projectiles.vx[i];
        const vy = this.state.projectiles.vy[i];
        const px = this.state.projectiles.x[i] + vx * dt;
        const py = this.state.projectiles.y[i] + vy * dt;

        if (px + 4 < 0 || px - 4 > this.width || py + 4 < 0 || py - 4 > this.height) continue;

        const splash = this.state.projectiles.splashRadius[i];
        const slow = this.state.projectiles.slowFactor[i];

        if (splash > 0) {
          // Cannon: Glowing orange bomb
          this.ctx.fillStyle = '#ea580c';
          this.ctx.beginPath();
          this.ctx.arc(px, py, 6, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.fillStyle = '#fef08a';
          this.ctx.beginPath();
          this.ctx.arc(px, py, 3, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (slow < 1.0) {
          // Cryo: Icy blue blast
          this.ctx.fillStyle = '#38bdf8';
          this.ctx.beginPath();
          this.ctx.arc(px, py, 5, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.strokeStyle = '#e0f2fe';
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        } else {
          // Gatling: Fast tracer line
          const len = 12;
          const speedSq = Math.sqrt(vx*vx + vy*vy);
          const dirX = vx / speedSq;
          const dirY = vy / speedSq;
          
          this.ctx.strokeStyle = '#fde047';
          this.ctx.lineWidth = 3;
          this.ctx.lineCap = 'round';
          this.ctx.beginPath();
          this.ctx.moveTo(px, py);
          this.ctx.lineTo(px - dirX * len, py - dirY * len);
          this.ctx.stroke();
        }
      }
    }

    // Draw FX (Juice)
    for (let i = 0; i < this.state.fx.capacity; i++) {
      if (this.state.fx.alive[i] === 1) {
        const type = this.state.fx.type[i];
        const x = this.state.fx.x[i];
        const y = this.state.fx.y[i];
        const lifePerc = this.state.fx.life[i] / this.state.fx.maxLife[i];

        this.ctx.globalAlpha = lifePerc;
        if (type === 0) {
          // Particle explosion
          this.ctx.fillStyle = '#ff8800';
          this.ctx.beginPath();
          this.ctx.arc(x, y, 2 + lifePerc * 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (type === 1) {
          // Floating damage text
          this.ctx.fillStyle = '#ff5555';
          this.ctx.font = 'bold 16px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(this.state.fx.value[i].toString(), x, y);
        }
      }
    }
    this.ctx.globalAlpha = 1.0;
    
    // Draw Game Over / Victory
    if (this.state.state !== 'PLAYING') {
       this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
       this.ctx.fillRect(0, 0, this.width, this.height);
       this.ctx.fillStyle = '#fff';
       this.ctx.font = '48px sans-serif';
       this.ctx.textAlign = 'center';
       this.ctx.fillText(this.state.state, this.width / 2, this.height / 2);
    }
  }
}
