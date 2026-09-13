import { EntityPool } from '../core/pool';

/**
 * Enemy pool using Struct-of-Arrays (SoA) to keep iteration cache-friendly
 * and prevent per-frame allocations.
 */
export class EnemyPool extends EntityPool {
  public x: Float32Array;
  public y: Float32Array;
  public hp: Float32Array;
  public speed: Float32Array;
  public pathT: Float32Array; // Scalar distance traveled along the path
  public typeId: Uint8Array;

  constructor(capacity: number) {
    super(capacity);
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.hp = new Float32Array(capacity);
    this.speed = new Float32Array(capacity);
    this.pathT = new Float32Array(capacity);
    this.typeId = new Uint8Array(capacity);
  }

  /**
   * Spawns a new enemy into the pool.
   * @returns the ID of the spawned enemy, or -1 if the pool is full.
   */
  public spawn(typeId: number, speed: number, hp: number): number {
    const id = this.acquire();
    if (id !== -1) {
      this.typeId[id] = typeId;
      this.speed[id] = speed;
      this.hp[id] = hp;
      this.pathT[id] = 0;
      this.x[id] = 0; // Updated on the first simulation tick
      this.y[id] = 0;
    }
    return id;
  }
}
