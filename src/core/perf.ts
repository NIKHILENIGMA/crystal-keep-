export class PerfMonitor {
  private frameTimes: Float32Array;
  private head: number = 0;
  private count: number = 0;
  private capacity: number;
  
  public lastFps: number = 0;
  public p95FrameTime: number = 0;
  private lastFpsUpdate: number = 0;
  private framesSinceLastUpdate: number = 0;

  constructor(capacity = 120) {
    this.capacity = capacity;
    this.frameTimes = new Float32Array(capacity);
  }

  public addFrame(dt: number, now: number) {
    this.frameTimes[this.head] = dt;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) {
      this.count++;
    }

    this.framesSinceLastUpdate++;

    if (now - this.lastFpsUpdate > 500 && this.count > 0) {
      this.calculateStats();
      
      const timeElapsed = now - this.lastFpsUpdate;
      this.lastFps = (this.framesSinceLastUpdate / timeElapsed) * 1000;
      
      this.lastFpsUpdate = now;
      this.framesSinceLastUpdate = 0;
    }
  }

  private calculateStats() {
    const sorted = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      sorted[i] = this.frameTimes[i];
    }
    sorted.sort();
    const p95Index = Math.floor(this.count * 0.95);
    this.p95FrameTime = sorted[p95Index];
  }
}
