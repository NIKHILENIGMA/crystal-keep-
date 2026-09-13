# Architecture

## Tech Stack
- **Build tool**: Vite
- **Language**: Vanilla TypeScript (strict mode) — no framework for the game engine itself
- **Rendering**: Canvas2D (explicitly avoiding WebGL for this project)
- **Testing**: Vitest
- **UI chrome** (HUD, shop panel, menus): plain DOM + TS, driven by a lightweight event bus reading from game state — not React. Kept out of the simulation hot path entirely.

## Why not a framework for the engine
Reconciliation-based UI libraries (React etc.) are the wrong tool for a simulation mutating thousands of entities per frame — either you re-render the tree every tick (too slow) or you fight the framework with refs (at which point it isn't buying you anything). The engine is plain TS modules operating on typed-array-backed data; DOM-based UI chrome is layered on top and only updates on state *changes*, not every frame.

## Core Loop: Fixed Timestep + Render Interpolation
A single `requestAnimationFrame` loop drives everything. No other timers (`setInterval`/`setTimeout`) exist anywhere in the simulation.

```
let accumulator = 0;
function frame(now) {
  const frameDt = now - lastNow;
  accumulator += frameDt;
  while (accumulator >= FIXED_DT) {
    simulate(FIXED_DT);       // deterministic, physics/logic step
    accumulator -= FIXED_DT;
  }
  const alpha = accumulator / FIXED_DT;
  render(alpha);               // interpolates between last two sim states
  requestAnimationFrame(frame);
}
```

- `FIXED_DT` is constant (e.g. 1000/60 ms) so game logic is identical regardless of monitor refresh rate — this satisfies "consistent behavior across displays with different refresh rates."
- Game-speed control (1x/2x/4x) scales how many fixed steps are consumed per real frame, or scales `FIXED_DT` itself — never the rAF callback rate.
- Pause simply stops calling `simulate()` while `render()` (and UI) keep running, so the game stays visually responsive while paused.

## Data Layout: Struct-of-Arrays (SoA)
Entities that exist in large numbers (enemies, projectiles) are **not** individual class instances. They are indices into parallel typed arrays:

```ts
class EnemyPool {
  x: Float32Array;
  y: Float32Array;
  hp: Float32Array;
  speed: Float32Array;
  pathT: Float32Array;      // distance-along-path parameter
  typeId: Uint8Array;
  alive: Uint8Array;        // 0/1, used with free-list
  capacity: number;
  freeList: number[];
}
```

Rationale:
- Cache-friendly iteration (hot fields packed contiguously) vs. scattered object-per-entity.
- Avoids V8 hidden-class megamorphism from heterogeneous object shapes.
- Trivial to zero-allocate: pools are preallocated at max capacity (5,000 enemies / 1,000 projectiles / 100 towers) once, at startup.

Towers (max 100) are a comparatively small, low-frequency-mutation set — they may use plain objects/classes if that's clearer, since their count never stresses GC or cache locality the way enemies/projectiles do.

## Object Pooling
- `acquire()` / `release()` on each pool, backed by a free-list (stack of free indices).
- No `new`, no array `.push()`/`.splice()` in the simulation hot path.
- Enemy death, projectile expiry, and wave-clear all return slots to the free-list rather than deallocating.

## Targeting: Spatial Grid
Brute-force tower→enemy targeting is O(towers × enemies) — at 100×5,000 that's 500k distance checks per tick, too slow.

- The map is divided into a uniform grid (cell size ≈ tower's largest range).
- Each simulation tick, enemies are rebinned into grid cells (cheap: just index math, no allocation — reuse per-cell arrays).
- A tower queries only the handful of cells overlapping its range, not the full enemy set.
- Grid insert/query logic is pure and unit-testable in isolation from rendering.

## Pathing
- Path is authored once as a static polyline (ordered waypoint list) per level.
- Enemies don't pathfind — they track a scalar `pathT` (distance traveled along the polyline) and a lookup function converts `pathT` → `(x, y)`. Advancing an enemy is just `pathT += speed * dt`.
- This makes per-enemy movement O(1) and removes any need for per-frame pathfinding.

## Rendering
- Canvas2D, single canvas, resized for `devicePixelRatio`.
- Sprites are **pre-rendered once** to offscreen canvases/bitmaps and drawn with `drawImage` — never redrawn as vector paths (`arc`/`fillRect` per entity per frame) once past the prototype stage. This is the single biggest Canvas2D performance lever.
- Draw calls are grouped/sorted by sprite type to minimize context state changes (avoid unnecessary `save()`/`restore()`/`fillStyle` churn between draws).
- **Viewport culling**: only entities whose bounding box intersects the visible viewport are drawn. Off-screen entities still simulate (game logic doesn't depend on camera) but are skipped in the render pass — this satisfies "rendering cost should not scale unnecessarily with objects outside the visible area."
- Render reads an *interpolated* position (`lerp(prevX, x, alpha)`) so movement looks smooth even though simulation runs at a fixed rate independent of display refresh rate.

## State Machine
Explicit, testable states gate input and rendering:

```
MENU → PLAYING ⇄ PAUSED → GAME_OVER
              → VICTORY
```

Transitions are pure functions of (currentState, event) → newState, unit tested independent of rendering.

## Module Boundaries
```
/src
  /sim          pure simulation logic: pools, grid, pathing, wave-runner, damage resolution
  /render       canvas drawing, sprite cache, camera/viewport culling
  /ui           DOM-based HUD, shop panel, menus — reads state via event bus only
  /data         tower/enemy stat tables, wave definitions (data, not code)
  /core         fixed-timestep loop, game state machine, entity pool base class
```
`sim` has zero dependency on `render` or `ui` — it can be fully unit tested headlessly. `render` and `ui` only *read* sim state, never mutate it.

## Performance Techniques Summary
| Technique | Addresses |
|---|---|
| Fixed timestep + interpolation | consistent behavior across refresh rates |
| SoA + typed arrays | cache locality, avoids GC pressure at 5k+ entities |
| Object pooling / free-lists | zero per-frame allocation, stable memory over 50 waves |
| Spatial grid targeting | avoids O(towers × enemies) brute force |
| Pre-rendered sprite bitmaps + `drawImage` | avoids expensive per-frame vector redraw |
| Viewport culling | render cost independent of off-screen entity count |
| Single rAF loop, no per-entity timers | required by spec; also avoids timer-scheduling overhead at scale |
| Data-driven waves | 50 waves as data, not branching code |

## Measurement
- In-app perf overlay: rolling frame-time ring buffer → live FPS, p95 frame time, frame count.
- A debug "stress test" mode instantly populates pools to spec-max (5,000 enemies / 100 towers / 1,000 projectiles) for repeatable profiling without playing to wave 50.
- Chrome DevTools Performance tab for flame graphs; `performance.mark/measure` around `simulate()` vs `render()` to attribute cost.
- `performance.memory` sampled at regular intervals across a full 50-wave run to confirm flat sawtooth (GC recovers each cycle) rather than a climbing baseline (leak).