import { PerfMonitor } from './perf';

export type SimulateFn = (dt: number) => void;
export type RenderFn = (alpha: number) => void;

export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private reqId: number = 0;
  private running: boolean = false;
  
  public fixedDt: number = 1000 / 60; // 60 logic ticks per real second
  public speedMultiplier: number = 1; // Used to accelerate simulation

  public perf = new PerfMonitor(120);

  private simulate: SimulateFn;
  private render: RenderFn;

  constructor(
    simulate: SimulateFn,
    render: RenderFn
  ) {
    this.simulate = simulate;
    this.render = render;
  }

  public start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.reqId = requestAnimationFrame((now) => this.frame(now));
  }

  public stop() {
    this.running = false;
    cancelAnimationFrame(this.reqId);
  }

  private frame(now: number) {
    if (!this.running) return;

    let frameDt = now - this.lastTime;
    this.lastTime = now;

    // Track real frame time in our perf monitor
    this.perf.addFrame(frameDt, now);

    // Cap maximum frameDt to avoid "spiral of death" on long hitches
    if (frameDt > 250) {
      frameDt = 250;
    }

    // Multiply accumulated real time by game speed
    this.accumulator += frameDt * this.speedMultiplier;

    // Consume fixed-size simulation steps
    while (this.accumulator >= this.fixedDt) {
      this.simulate(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    // Pass interpolation factor to render
    const alpha = this.accumulator / this.fixedDt;
    this.render(alpha);

    this.reqId = requestAnimationFrame((n) => this.frame(n));
  }
}
