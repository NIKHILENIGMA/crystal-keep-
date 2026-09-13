# Rules for Agentic Coding Assistants

This file is for AI coding agents (Claude Code, Antigravity, or similar) working on this
repository. Read this before making changes. It encodes decisions already made — do not
relitigate them without being asked.

## Non-negotiable technical constraints
1. **No WebGL, no rendering framework.** Rendering is Canvas2D only. Do not introduce
   PixiJS, Three.js, or any GPU-accelerated rendering library, even "just to try it."
2. **No React/Vue/Svelte/etc. in the simulation or rendering path.** DOM-based UI chrome
   (HUD, menus, shop panel) may use plain TypeScript + DOM APIs. If a framework is ever
   introduced for UI chrome, it must not touch `/src/sim` or `/src/render` and must not
   re-render on every simulation tick.
3. **Exactly one `requestAnimationFrame` loop for the entire game.** Never add
   `setInterval`/`setTimeout` for gameplay logic (tower cooldowns, spawn timers, animations).
   Cooldowns and timers are numeric fields decremented inside `simulate(dt)`.
4. **Fixed timestep simulation, decoupled from render rate.** Game logic must produce
   identical results regardless of the display's refresh rate. If you touch `/src/core`,
   preserve the accumulator pattern — do not let `simulate()` be called directly from the
   rAF callback without the accumulator.
5. **No per-frame allocation in the hot path.** Inside `simulate()` and `render()`: no `new`,
   no array literals, no `.map()`/`.filter()`/`.slice()` that allocate, no closures created
   per entity per frame. Use the object pools. If you need a temporary, reuse a
   module-level scratch variable.
6. **Entities that scale (enemies, projectiles) are struct-of-arrays over typed arrays**,
   not one class instance per entity. Do not "simplify" this back into
   `class Enemy { x; y; hp }` arrays of objects — it was chosen specifically to survive
   the 5,000-enemy stress test. Towers (capped at 100) may be plain objects.
7. **Object pools, not garbage.** Entities are acquired/released via free-lists. Never
   let a dead enemy/projectile just fall out of scope for GC — release it back to its pool.
8. **Spatial grid for tower targeting**, not brute-force nested loops over all enemies.
   If you add a new targeting behavior, query the grid; don't iterate every enemy.

## Performance is a first-class requirement, not a later pass
- The stress-test debug mode (instantly populates 5,000 enemies / 100 towers / 1,000
  projectiles) must keep working. If your change breaks it, fix it before merging.
- Before claiming a change is "done," run the perf overlay and confirm FPS/frame-time
  targets still hold (≥45 FPS for ≥95% of frames, <5% of frames >33ms) in stress mode.
- If a change adds meaningful per-frame cost (new render pass, new per-entity computation),
  say so explicitly in your summary and note the measured impact — don't bury it.

## Testing discipline
- All logic in `/src/sim` (pooling, damage resolution, wave scaling, targeting, state
  transitions, pathing math) must be pure or near-pure and covered by Vitest — testable
  without a canvas or DOM.
- Do not write tests that assert on canvas pixel output or DOM structure for rendering —
  that's checked visually. A thin smoke test ("render() doesn't throw") is acceptable.
- When fixing a bug in simulation logic, add a regression test for it before considering
  the fix complete.
- Run the full test suite before considering any task complete. Do not leave failing
  tests "for later."

## Data over code
- The 50 waves are defined as data (`/src/data/waves.ts` or JSON), not as 50 hand-written
  branches of conditional logic. If you need to change wave balance, edit the data table
  and/or the scaling formula that generates it — don't add special-case code per wave
  number.
- Tower and enemy stats live in stat tables in `/src/data`, not scattered as magic numbers
  inside behavior code.

## Working process
- Follow the phase order in `REQUIREMENTS.md` / the project plan. Don't jump ahead to
  visual polish (sprites, particles, sound) before the functional loop, all 50 waves, all
  tower/enemy types, and the stress-test performance target are working. Polish work adds
  render cost that should be spent only once you know your performance floor.
- Before starting a phase, check `MEMORY.md` for current status and decisions already
  made. Update `MEMORY.md` at the end of any session/task with what changed and what's
  next — future sessions (yours or another agent's) rely on it instead of re-deriving
  context from the whole codebase.
- Keep `/src/sim` free of any import from `/src/render` or `/src/ui`. This boundary is
  what keeps simulation logic unit-testable; don't erode it for convenience.
- When in doubt about a design decision already recorded in `ARCHITECTURE.md`, follow
  what's written there. If you think it's wrong, flag it and ask rather than silently
  deviating.

## Things to avoid without being asked
- Don't add a state-management library (Redux, Zustand, etc.) — a single `GameState`
  object plus a minimal event bus is enough for this scope.
- Don't add a physics engine — movement/collision needs here are simple enough for
  hand-rolled math.
- Don't restructure the module boundaries (`/sim`, `/render`, `/ui`, `/data`, `/core`)
  without updating `ARCHITECTURE.md` in the same change.
- Don't introduce a backend/server — the game must be fully playable with no external
  services, per the requirements.