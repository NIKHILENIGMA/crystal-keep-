/**
 * Base struct-of-arrays object pool.
 * Does not allocate per-frame; manages active/inactive indices via a free-list.
 */
export abstract class EntityPool {
  public capacity: number;
  public alive: Uint8Array;
  protected freeList: Uint32Array; // Indices of free slots
  protected freeCount: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.alive = new Uint8Array(capacity);
    this.freeList = new Uint32Array(capacity);
    this.freeCount = capacity;
    
    for (let i = 0; i < capacity; i++) {
      // Fill backwards so acquiring takes index 0 first
      this.freeList[i] = capacity - 1 - i; 
    }
  }

  /**
   * Acquires a slot from the pool.
   * @returns the allocated index, or -1 if the pool is full.
   */
  public acquire(): number {
    if (this.freeCount === 0) {
      return -1;
    }
    this.freeCount--;
    const id = this.freeList[this.freeCount];
    this.alive[id] = 1;
    return id;
  }

  /**
   * Releases an entity index back to the free list.
   */
  public release(id: number) {
    if (this.alive[id] === 1) {
      this.alive[id] = 0;
      this.freeList[this.freeCount] = id;
      this.freeCount++;
    }
  }
  
  public getActiveCount(): number {
    return this.capacity - this.freeCount;
  }
}
