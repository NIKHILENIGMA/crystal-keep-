# Project Memory

Purpose: this file is the handoff point between work sessions (and between different
agentic assistants, if more than one touches this repo). Read it first, before reading
code. Update it last, after every session — a short, honest status beats a stale
detailed one.

Keep this file short. When it grows too long, compress older "Session Log" entries into
one summary paragraph and keep only the last few sessions in detail.

---

## Current Status
**Phase**: Phase 5 complete.
**Next up**: Phase 6 — README + deploy. See `REQUIREMENTS.md` for full scope and `ARCHITECTURE.md` for the design.

## Decisions Already Made (do not re-litigate — see RULES.md for why)
- Stack: Vite + vanilla TypeScript (strict) + Canvas2D + Vitest.
- Explicitly **not** using WebGL/PixiJS, and **not** using React/any framework for the
  engine or rendering (DOM-based plain-TS UI chrome is fine, kept out of the sim/render
  hot path).
- Fixed-timestep simulation decoupled from render rate (accumulator pattern), single
  `requestAnimationFrame` loop, no per-entity timers.
- Enemies/projectiles stored as struct-of-arrays over typed arrays with object pooling
  (free-lists); towers (max 100) may be plain objects/classes.
- Spatial grid for tower targeting instead of brute-force distance checks.
- Path is a static polyline; enemies track `pathT` (distance-along-path), no per-frame
  pathfinding.
- Sprites pre-rendered to offscreen bitmaps, drawn via `drawImage`, batched by type;
  viewport culling for anything off-screen.
- 50 waves authored as data (table/JSON) + a scaling formula, not hand-branched code.
- Module boundaries: `/src/sim` (pure, tested), `/src/render`, `/src/ui`, `/src/data`,
  `/src/core` — `sim` must not import from `render` or `ui`.

## Build Order (see full breakdown in project plan / chat history)
1. Phase 0 — skeleton, fixed-timestep loop, perf overlay, entity pool + tests
2. Phase 1 — minimal vertical slice (1 path, 1 tower, 1 enemy, full loop)
3. Phase 2 — real content (3 towers, 4 enemies, 50 waves as data, spatial grid, upgrades/sell)
4. Phase 3 — game states & controls (pause, speed, restart, victory/game-over)
5. Phase 4 — performance push (stress-test debug mode, profiling, culling, memory check)
6. Phase 5 — visual/UX polish (sprites, HUD layout, juice, sound)
7. Phase 6 — README + deploy

## Open Questions / Not Yet Decided
- Exact tower roster beyond the 3 required behavioral archetypes (gatling/cannon/slow)
  — names, art style, exact numbers TBD when Phase 2 starts.
- Exact enemy roster beyond the 4 required archetypes (normal/fast/tanky/flying-or-split)
  — TBD when Phase 2 starts.
- Whether a Web Worker split for simulation will be needed — deferred to Phase 4,
  only if profiling shows the main thread (not the GPU/draw calls) is the bottleneck.
- Deployment target (Vercel/Netlify/Cloudflare Pages) — not yet chosen, any is fine per
  requirements; pick whichever is fastest to set up when Phase 6 arrives.

## Session Log
_(Add a new entry each session: date, what was done, what was decided/changed, what's
next. Compress old entries into a summary once this section gets long.)_

- **[Planning]** — Requirements gathered, tech stack chosen (Vite/vanilla TS/Canvas2D/
  Vitest, explicitly no WebGL/no framework for engine), architecture designed
  (fixed-timestep loop, SoA pooling, spatial grid, data-driven waves), build order
  sequenced into 6 phases. No code written yet. `ARCHITECTURE.md`, `RULES.md`,
  `REQUIREMENTS.md`, `MEMORY.md` created.
- **[2026-09-12]** — Completed Phase 0. Initialized Vite + vanilla TS project, implemented core fixed-timestep `GameLoop`, `PerfMonitor`, and zero-allocation base `EntityPool` (Struct-of-Arrays). Next up: Phase 1 (Minimal vertical slice).
- **[2026-09-12]** — Completed Phase 1. Implemented static path and `pathT` math, extended `EnemyPool`, created `GameState` and brute-force tower targeting, and rendered canvas slice. Next up: Phase 2 (Real content & spatial grid).
- **[2026-09-12]** — Completed Phase 2. Defined 50 waves, 4 enemy types, 3 tower types. Implemented `SpatialGrid` for O(1) targeting lookups. Added `ProjectilePool` with homing physics and integrated wave processing. User tested successfully to Game Over state. Next up: Phase 3 (States & controls).
- **[2026-09-12]** — Completed Phase 3. Implemented robust game state controls: pause/resume logic decoupled from render loop, 1x/2x/4x simulation speed multipliers, and full state restart. Next up: Phase 4 (Performance & stress test).
- **[2026-09-12]** — Completed Phase 4. Added viewport culling and stress test mode (100 towers, 5000 enemies). User reported FPS stayed well above the 45 FPS target (mostly 100+ FPS) during stress scenario, proving the architecture successful. Next up: Phase 5 (Polish).
- **[2026-09-13]** — Completed Phase 5. Added Shop UI, Context Menus (upgrade/sell), spatial placement restrictions, exponential upgrade economy, dynamic max levels, floating damage numbers, and hooked up AI-generated tower sprites into the Canvas renderer. Next up: Phase 6 (README & Deploy).