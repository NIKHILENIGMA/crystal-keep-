# Requirements

## Summary
A polished, playable browser-based tower defense game, fully client-side (no external
services required to play), built with Vite + vanilla TypeScript + Canvas2D, tested with
Vitest, and deployed to a static host.

## Functional Requirements

### Core gameplay
- [ ] Player defends a base from waves of enemies by placing and upgrading towers.
- [ ] At least **50 waves**, progressively increasing in difficulty (enemy count, HP,
      speed, and/or composition).
- [ ] At least **3 meaningfully different tower types** — different behavior, not just
      different numbers (e.g. single-target/fast, AoE/splash, slow/debuff).
- [ ] At least **4 meaningfully different enemy types** — different behavior/traits, not
      just HP scaling (e.g. normal, fast/low-HP, tanky/armored, flying-or-split).
- [ ] Towers **automatically target and attack** enemies in range — no manual aiming.
- [ ] Enemies **follow a fixed path** toward the base.
- [ ] **Tower placement** on a grid, with valid/invalid tile feedback and a range preview.
- [ ] **Tower upgrading** (at least one upgrade tier per tower, ideally 2–3) with a
      visible cost and effect.
- [ ] **Tower selling** with a partial gold refund.
- [ ] **Player health**: enemies reaching the base reduce it; reaching 0 ends the game.
- [ ] **Currency (gold)**: earned from kills and/or wave-clear bonuses, spent on towers
      and upgrades.
- [ ] **Scoring**: a score value that increases with play (kills, waves cleared, etc.).
- [ ] **Victory state**: reached on clearing wave 50.
- [ ] **Game-over state**: reached on player health hitting 0.
- [ ] **Pause / resume** control.
- [ ] **Restart** control, fully resetting all game state.
- [ ] **Game-speed control** (at least 1x/2x, ideally up to 4x).

### UI
- [ ] HUD showing gold, health, current wave / total waves, score, speed control, pause.
- [ ] Tower shop panel showing available towers and costs (disabled/greyed when
      unaffordable).
- [ ] Contextual panel on tower selection: stats, upgrade option, sell option.
- [ ] Wave-start indicator/banner.
- [ ] Game-over and victory screens with a summary (score reached, waves cleared) and a
      restart action.

## Non-Functional Requirements (Performance)

### Stress scenario (must sustain simultaneously)
- 5,000 active enemies
- 100 active towers
- 1,000 active projectiles

### Targets during the stress scenario
- [ ] **≥45 FPS for at least 95% of frames.**
- [ ] **Fewer than 5% of frames exceed 33ms** frame time.
- [ ] Game remains interactive (input — placement, pause, speed change — is not blocked
      or meaningfully delayed).
- [ ] **Memory usage remains broadly stable** across a complete 50-wave run (no
      unbounded growth — sawtooth pattern from GC is fine, a climbing baseline is not).
- [ ] **Rendering cost does not scale with off-screen entity count** — verified via
      viewport culling; off-screen-heavy stress test should not tank FPS relative to an
      on-screen-equivalent one.
- [ ] **Behavior is consistent across displays with different refresh rates** — verified
      by comparing simulation outcomes at throttled/uncapped rAF rates (e.g. via
      DevTools FPS throttling) and confirming enemy speed/spawn timing/wave duration
      don't change.

### Architectural constraint
- [ ] The implementation does **not** rely on one timer or animation loop per game
      entity — a single driving loop for the entire simulation.

## Quality Bar (subjective, but explicitly required)
- [ ] Responsive controls (no perceptible input lag under normal or stress load).
- [ ] Clear visual feedback (hit reactions, death effects, range indicators, disabled
      states).
- [ ] Smooth animation (interpolated movement, not visibly stepped/jittery).
- [ ] Readable game state at a glance (HUD is unambiguous — health, gold, wave, score
      all visible without hunting).
- [ ] Sensible game balance (progression feels tuned, not trivially easy or
      unfairly spiky).
- [ ] Polished presentation overall — should read as a real game, not a tech demo.

## Constraints
- Game must be **playable start to finish with no external/network services** at
  runtime (bundled assets only; a build step and static hosting are fine).
- Vanilla TypeScript, Vite, Canvas2D (explicitly not WebGL), Vitest — see
  `ARCHITECTURE.md` for rationale and design.
- Technology/rendering/state/data-structure choices beyond the above are open — see
  `ARCHITECTURE.md` for the choices actually made and why.

## Deliverables
- [ ] Complete, runnable project (source + build config).
- [ ] Deployed to a public static host (Vercel/Netlify/Cloudflare Pages/etc.).
- [ ] `README.md` (or equivalent) explaining: architecture, rendering approach, major
      performance bottlenecks encountered, optimizations applied, and how performance
      was measured.
- [ ] This `REQUIREMENTS.md`, `ARCHITECTURE.md`, `RULES.md`, and `MEMORY.md` kept
      up to date as the project evolves.

## Acceptance Test Checklist (manual, before calling it done)
- [ ] Fresh load → play from wave 1 through wave 50 → victory screen appears.
- [ ] Let health hit 0 deliberately → game-over screen appears, restart works cleanly.
- [ ] Place, upgrade, and sell each tower type at least once.
- [ ] Encounter and defeat each enemy type at least once.
- [ ] Pause mid-wave, confirm simulation freezes and UI stays responsive; resume works.
- [ ] Run at each speed setting, confirm enemy/projectile motion scales accordingly.
- [ ] Trigger the stress-test debug mode, confirm perf overlay meets FPS/frame-time
      targets, and that the game is still clickable/responsive.
- [ ] Run a full 50-wave playthrough while sampling memory; confirm no runaway growth.