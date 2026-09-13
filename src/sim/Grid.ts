/**
 * O(1) Spatial Partitioning Grid to avoid brute-force tower distance checks.
 * Rebins active entities into cells every frame with zero allocations.
 */
export class SpatialGrid {
  private cellSize: number;
  private cols: number;
  private rows: number;

  // Parallel arrays for linked lists within cells
  private head: Int32Array; // Maps cellIndex -> First entity ID
  private next: Int32Array; // Maps entity ID -> Next entity ID in same cell
  
  constructor(width: number, height: number, cellSize: number, maxEntities: number) {
    this.cellSize = cellSize;
    
    // Make sure we have enough cols/rows
    this.cols = Math.ceil(width / cellSize) + 1;
    this.rows = Math.ceil(height / cellSize) + 1;
    
    const numCells = this.cols * this.rows;
    this.head = new Int32Array(numCells);
    this.next = new Int32Array(maxEntities);
  }

  /** Must be called once per simulation tick before re-inserting */
  public clear() {
    this.head.fill(-1);
  }

  public insert(id: number, x: number, y: number) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
    
    const cellIdx = row * this.cols + col;
    
    // Insert at the head of this cell's linked list
    this.next[id] = this.head[cellIdx];
    this.head[cellIdx] = id;
  }

  /**
   * Queries the grid for all entity IDs within `radius` of `(x, y)`.
   * @param outBuffer An Int32Array where results will be written to avoid allocating an array
   * @returns The number of matches placed in outBuffer
   */
  public query(
    x: number, 
    y: number, 
    radius: number, 
    entityX: Float32Array, 
    entityY: Float32Array, 
    outBuffer: Int32Array
  ): number {
    let count = 0;
    const r2 = radius * radius;
    
    const minCol = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
    const minRow = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cellIdx = r * this.cols + c;
        let curr = this.head[cellIdx];
        
        while (curr !== -1) {
          const dx = entityX[curr] - x;
          const dy = entityY[curr] - y;
          
          if (dx * dx + dy * dy <= r2) {
            outBuffer[count++] = curr;
          }
          
          curr = this.next[curr];
        }
      }
    }
    
    return count;
  }
}
