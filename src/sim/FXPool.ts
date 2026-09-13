export class FXPool {
  public capacity: number;
  
  public alive: Uint8Array;
  public type: Uint8Array; // 0 = generic particle, 1 = floating text
  
  public x: Float32Array;
  public y: Float32Array;
  public vx: Float32Array;
  public vy: Float32Array;
  
  public life: Float32Array;
  public maxLife: Float32Array;
  public value: Int32Array; // color index or damage value
  
  constructor(capacity: number) {
    this.capacity = capacity;
    this.alive = new Uint8Array(capacity);
    this.type = new Uint8Array(capacity);
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.life = new Float32Array(capacity);
    this.maxLife = new Float32Array(capacity);
    this.value = new Int32Array(capacity);
  }

  public spawn(type: number, x: number, y: number, vx: number, vy: number, maxLife: number, value: number): number {
    for (let i = 0; i < this.capacity; i++) {
      if (this.alive[i] === 0) {
        this.alive[i] = 1;
        this.type[i] = type;
        this.x[i] = x;
        this.y[i] = y;
        this.vx[i] = vx;
        this.vy[i] = vy;
        this.life[i] = maxLife;
        this.maxLife[i] = maxLife;
        this.value[i] = value;
        return i;
      }
    }
    return -1;
  }

  public update(dt: number) {
    const dtS = dt / 1000;
    for (let i = 0; i < this.capacity; i++) {
      if (this.alive[i] === 1) {
        this.life[i] -= dtS;
        if (this.life[i] <= 0) {
          this.alive[i] = 0;
        } else {
          this.x[i] += this.vx[i] * dtS;
          this.y[i] += this.vy[i] * dtS;
        }
      }
    }
  }
}
