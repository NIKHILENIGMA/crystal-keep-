import { EntityPool } from '../core/pool';

export class ProjectilePool extends EntityPool {
  public x: Float32Array;
  public y: Float32Array;
  public vx: Float32Array;
  public vy: Float32Array;
  public damage: Float32Array;
  public splashRadius: Float32Array;
  public slowFactor: Float32Array;
  public lifeMs: Float32Array;
  public targetEnemyId: Int32Array; 

  constructor(capacity: number) {
    super(capacity);
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.damage = new Float32Array(capacity);
    this.splashRadius = new Float32Array(capacity);
    this.slowFactor = new Float32Array(capacity);
    this.lifeMs = new Float32Array(capacity);
    this.targetEnemyId = new Int32Array(capacity);
  }

  public spawn(
    x: number, y: number, vx: number, vy: number, 
    damage: number, splashRadius: number, slowFactor: number,
    targetId: number = -1
  ): number {
    const id = this.acquire();
    if (id !== -1) {
      this.x[id] = x;
      this.y[id] = y;
      this.vx[id] = vx;
      this.vy[id] = vy;
      this.damage[id] = damage;
      this.splashRadius[id] = splashRadius;
      this.slowFactor[id] = slowFactor;
      this.lifeMs[id] = 2000; 
      this.targetEnemyId[id] = targetId;
    }
    return id;
  }
}
