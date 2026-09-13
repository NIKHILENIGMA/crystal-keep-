import { type Waypoint } from '../data/level';

export class Path {
  public waypoints: Waypoint[];
  public totalLength: number;
  private segments: { length: number; accum: number }[];

  constructor(waypoints: Waypoint[]) {
    this.waypoints = waypoints;
    this.segments = [];
    this.totalLength = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      this.segments.push({
        length,
        accum: this.totalLength
      });
      this.totalLength += length;
    }
  }

  /**
   * Translates a scalar distance along the path (T) into (X, Y) coordinates.
   * This operates in O(segments) time, which is negligible since levels have few segments.
   */
  public getPosition(t: number): { x: number, y: number } {
    if (t <= 0) return { ...this.waypoints[0] };
    if (t >= this.totalLength) return { ...this.waypoints[this.waypoints.length - 1] };

    let segmentIndex = 0;
    for (let i = 0; i < this.segments.length; i++) {
      if (t <= this.segments[i].accum + this.segments[i].length) {
        segmentIndex = i;
        break;
      }
    }

    const p1 = this.waypoints[segmentIndex];
    const p2 = this.waypoints[segmentIndex + 1];
    const segment = this.segments[segmentIndex];
    
    // Progress along the current segment (0.0 to 1.0)
    const localT = (t - segment.accum) / segment.length;
    
    return {
      x: p1.x + (p2.x - p1.x) * localT,
      y: p1.y + (p2.y - p1.y) * localT
    };
  }
}
