# CACTRO: Crystal Keep

A highly optimized, high-performance 2D Tower Defense game built purely with **Vanilla TypeScript** and **HTML5 Canvas**.

![CACTRO: Crystal Keep Game Screen](./frontend/public/assets/bg.jpg)

## 🎮 Play the Game

[Play the Live Demo on Netlify](#) *(Add your Netlify URL here once deployed!)*

---

## 🚀 Technical Architecturev

This project was built from scratch without any heavy frameworks (No React, No PixiJS, No Phaser) in order to explore and implement extreme performance optimizations directly in the browser. 

The engine achieves **60+ FPS even with over 3,000 active entities** on screen simultaneously by avoiding JavaScript Garbage Collection (GC) stutters.

### Key Optimizations:
1. **Struct-of-Arrays (SoA) Entity Pooling**: Enemies, Projectiles, and Particle Effects are NOT stored as individual JavaScript Objects. They are stored in pre-allocated continuous `Float32Array` buffers. This means memory allocation happens exactly once at startup. There is zero memory allocation or garbage collection happening during the game loop.
2. **Fixed-Timestep Game Loop**: The game logic updates using a decoupled accumulator pattern, ensuring deterministic physics regardless of monitor refresh rate.
3. **Spatial Grid Hashing**: Instead of Towers checking their distance against every single enemy every frame ($O(N^2)$), the game maps enemies into a dynamic O(1) Spatial Grid hashmap, making target acquisition nearly instant.
4. **Offscreen Sprite Rendering**: Canvas primitives are expensive. All sprites and towers are pre-rendered into offscreen `<canvas>` bitmaps or native `Image` objects at startup, reducing the render loop to hyper-fast `drawImage` calls.
5. **Tailwind DOM Overlay**: Instead of drawing the UI using the Canvas API (which is slow and hard to make responsive), the HUD, Menus, and Start Screen are layered directly over the canvas using modern DOM elements and Tailwind CSS.

## 🛠️ Tech Stack
- **Engine**: Custom Vanilla TypeScript / HTML5 Canvas 2D
- **UI/Styling**: Tailwind CSS v4
- **Bundler**: Vite
- **Testing**: Vitest

## 🏰 Game Features
- **3 Tower Types**: 
  - *Gatling*: Low damage, extremely high fire rate.
  - *Cannon*: Slow fire rate, massive Splash Damage area-of-effect.
  - *Cryo Emitter*: Low damage, slows enemy movement speed by 40%.
- **4 Enemy Archetypes**: Normal (Demons), Fast (Goblins), Tanks (Golems), and Flying.
- **Dynamic Economy**: Geometric scaling for both upgrade costs and damage output. Towers can be sold for a 70% refund of *total* gold invested.
- **50 Handcrafted Waves**: Increasing difficulty curve using exponential health multipliers.

## 💻 Running Locally

To run the game locally, you need [Node.js](https://nodejs.org/) installed.

1. Clone the repository.
2. Navigate into the frontend folder:
   ```bash
   cd frontend
   ```
3. Install dependencies using your preferred package manager:
   ```bash
   npm install
   # or pnpm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   # or pnpm run dev
   ```
5. Open the provided `localhost` URL in your browser!

## 📦 Deployment

This project is configured out-of-the-box for seamless deployment on platforms like Netlify, Vercel, or Cloudflare Pages.

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
