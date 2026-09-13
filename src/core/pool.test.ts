import { describe, it, expect } from 'vitest';
import { EntityPool } from './pool';

class TestPool extends EntityPool {
  constructor(capacity: number) {
    super(capacity);
  }
}

describe('EntityPool', () => {
  it('should acquire and release entities correctly', () => {
    const pool = new TestPool(3);
    expect(pool.getActiveCount()).toBe(0);

    const id1 = pool.acquire();
    expect(id1).toBe(0); // Assuming it returns 0 first
    expect(pool.alive[id1]).toBe(1);
    expect(pool.getActiveCount()).toBe(1);

    const id2 = pool.acquire();
    pool.acquire();
    expect(pool.getActiveCount()).toBe(3);

    // Pool should be full
    const id4 = pool.acquire();
    expect(id4).toBe(-1);

    // Release one
    pool.release(id2);
    expect(pool.alive[id2]).toBe(0);
    expect(pool.getActiveCount()).toBe(2);

    // Re-acquire
    const id5 = pool.acquire();
    expect(id5).toBe(id2); // Should reuse the released ID
    expect(pool.getActiveCount()).toBe(3);
  });
});
