import './style.css'
import { GameLoop } from './core/loop'
import { GameState } from './sim/GameState'
import { Renderer } from './render/Renderer'
import { TowerType, TOWER_DATA } from './data/towers'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="w-screen h-screen bg-slate-950 flex flex-col justify-center items-center font-sans text-slate-100 overflow-hidden relative selection:bg-none">
    
    <!-- Top Bar HUD -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-8 py-3 rounded-2xl border border-slate-700/80 shadow-2xl z-20 w-200">
      
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-2 bg-slate-950/50 px-4 py-1.5 rounded-lg border border-slate-800">
           <span class="text-yellow-400 text-lg">🪙</span>
           <span id="gold" class="text-xl font-bold font-mono tracking-tight text-white">200</span>
        </div>
        <div class="flex items-center gap-2 bg-slate-950/50 px-4 py-1.5 rounded-lg border border-slate-800">
           <span class="text-red-500 text-lg">❤️</span>
           <span id="hp" class="text-xl font-bold font-mono tracking-tight text-white">20</span>
        </div>
      </div>
      
      <div class="flex flex-col items-center justify-center">
         <span class="text-sm font-bold text-yellow-500 uppercase tracking-widest drop-shadow-md">Wave <span id="wave" class="text-white">1</span> / 50</span>
         <span class="text-xs text-slate-400 font-mono">Score: <span id="score" class="text-white">0</span></span>
      </div>

      <div class="flex items-center gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800">
        <button id="btn-pause" class="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-slate-700 text-slate-300 transition">||</button>
        <button id="btn-1x" class="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-slate-700 text-white transition active-speed bg-blue-600">1x</button>
        <button id="btn-2x" class="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-slate-700 text-slate-300 transition">2x</button>
        <button id="btn-4x" class="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-slate-700 text-slate-300 transition">4x</button>
        <button id="btn-restart" class="px-3 py-1.5 text-xs font-bold rounded-md hover:bg-slate-700 text-red-400 transition ml-2 border border-slate-700/50">↻</button>
      </div>

    </div>

    <!-- The Game Canvas Wrapper -->
    <div class="relative shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-900">
      <canvas id="gameCanvas" width="800" height="600" class="block"></canvas>
      
      <!-- Context Menu -->
      <div id="context-menu" class="hidden absolute top-4 right-4 w-60 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700 p-5 shadow-2xl z-30 transition-all">
         <h3 id="ctx-name" class="font-bold text-lg text-blue-100 border-b border-slate-700 pb-2 mb-3">Tower</h3>
         
         <div class="flex justify-between text-sm mb-1">
           <span class="text-slate-400">Level</span>
           <span id="ctx-lvl" class="font-bold font-mono text-white">1</span>
         </div>
         <div class="flex justify-between text-sm mb-1">
           <span class="text-slate-400">Damage</span>
           <span id="ctx-dmg" class="font-bold font-mono text-blue-400">10</span>
         </div>
         <div class="flex justify-between text-sm mb-5">
           <span class="text-slate-400">Range</span>
           <span id="ctx-rng" class="font-bold font-mono text-emerald-400">100</span>
         </div>
         
         <div class="flex gap-2">
           <button id="btn-upgrade" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-sm shadow-lg shadow-emerald-900/20 transition disabled:opacity-50 disabled:cursor-not-allowed">Upgrade</button>
           <button id="btn-sell" class="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-sm shadow-lg shadow-red-900/20 transition">Sell</button>
         </div>
      </div>
      
      <div class="absolute top-4 left-4 z-30 flex items-center gap-2">
        <span class="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-slate-400 font-mono border border-slate-800">FPS: <span id="fps" class="text-emerald-400">0</span></span>
        <button id="btn-stress" class="bg-red-900/60 hover:bg-red-600 text-red-200 text-xs px-2 py-1 rounded-md border border-red-700/50 transition">Stress Test</button>
      </div>
    </div>

    <!-- Shop Dock (Bottom) -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl p-3 z-20">
      <div class="flex flex-col gap-1 pr-6 border-r border-slate-700 mr-6 pl-2">
        <button class="px-4 py-2 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded-lg text-sm font-bold flex items-center gap-2 shadow-inner">
          <span>🏰</span> Towers
        </button>
      </div>
      <div id="shop-items" class="flex gap-4 pr-2"></div>
    </div>

    <!-- Hero Starting Screen -->
    <div id="hero-screen" class="absolute inset-0 z-50 bg-slate-900 bg-cover bg-center flex flex-col justify-center items-center transition-opacity duration-500" style="background-image: url('/assets/bg.jpg');">
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      
      <div class="relative z-10 flex flex-col items-center max-w-4xl w-full p-8 bg-slate-900/60 border border-slate-700/50 rounded-3xl shadow-2xl">
         <h1 class="text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-blue-500 mb-2 drop-shadow-lg tracking-tight">Crystal Keep</h1>
         <p class="text-slate-300 text-lg mb-8 font-medium tracking-wide">Stop the enemy waves before they reach the crystal core!</p>
         
         <div class="flex gap-12 w-full justify-center mb-10">
           <!-- Instructions -->
           <div class="flex-1 space-y-4">
             <h2 class="text-xl font-bold text-emerald-400 border-b border-emerald-900/50 pb-2">How to Play</h2>
             <ul class="text-slate-300 space-y-2 text-sm">
               <li>💰 Defeat enemies to earn Gold</li>
               <li>🏰 Buy and place towers on the grass</li>
               <li>⭐ Click placed towers to Upgrade or Sell</li>
               <li>❤️ Don't let enemies reach your Base!</li>
             </ul>
           </div>
           
           <!-- Towers -->
           <div class="flex-1 space-y-4">
             <h2 class="text-xl font-bold text-blue-400 border-b border-blue-900/50 pb-2">Your Arsenal</h2>
             <div class="flex gap-4">
               <img src="/assets/towers/gatling.jpg" class="w-12 h-12 rounded-full border-2 border-slate-600 shadow-md" title="Gatling">
               <img src="/assets/towers/cannon.jpg" class="w-12 h-12 rounded-full border-2 border-slate-600 shadow-md" title="Cannon">
               <img src="/assets/towers/cryo.jpg" class="w-12 h-12 rounded-full border-2 border-slate-600 shadow-md" title="Frost">
             </div>
           </div>

           <!-- Enemies -->
           <div class="flex-1 space-y-4">
             <h2 class="text-xl font-bold text-red-400 border-b border-red-900/50 pb-2">The Horde</h2>
             <div class="flex gap-4 items-center">
               <img src="/assets/enemies/goblin.png?v=2" class="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,0,0,0.3)]" title="Goblin">
               <img src="/assets/enemies/demon.png?v=2" class="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,0,0,0.3)]" title="Demon">
               <img src="/assets/enemies/golem.png?v=2" class="w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(255,0,0,0.3)]" title="Golem">
             </div>
           </div>
         </div>

         <button id="btn-play" class="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-2xl px-16 py-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:scale-105 transition-all active:scale-95">
           PLAY GAME
         </button>
      </div>
    </div>
  </div>
`

let state = new GameState();
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const renderer = new Renderer(canvas, state);

// UI elements
const waveEl = document.getElementById('wave')!;
const hpEl = document.getElementById('hp')!;
const goldEl = document.getElementById('gold')!;
const scoreEl = document.getElementById('score')!;
const fpsEl = document.getElementById('fps')!;

// Control elements
const btnPause = document.getElementById('btn-pause')!;
const btn1x = document.getElementById('btn-1x')!;
const btn2x = document.getElementById('btn-2x')!;
const btn4x = document.getElementById('btn-4x')!;
const btnRestart = document.getElementById('btn-restart')!;
const btnStress = document.getElementById('btn-stress')!;
const speedBtns = [btn1x, btn2x, btn4x];

// Context Menu
const ctxMenu = document.getElementById('context-menu')!;
const ctxName = document.getElementById('ctx-name')!;
const ctxLvl = document.getElementById('ctx-lvl')!;
const ctxDmg = document.getElementById('ctx-dmg')!;
const ctxRng = document.getElementById('ctx-rng')!;
const btnUpgrade = document.getElementById('btn-upgrade')! as HTMLButtonElement;
const btnSell = document.getElementById('btn-sell')! as HTMLButtonElement;

// Shop
const shopItemsContainer = document.getElementById('shop-items')!;
let selectedShopItem: TowerType | null = null;

const renderShop = () => {
  shopItemsContainer.innerHTML = '';
  Object.values(TOWER_DATA).forEach(def => {
    const isSelected = selectedShopItem === def.id;
    const isAffordable = state.gold >= def.baseCost;
    
    const div = document.createElement('div');
    div.className = `group relative flex flex-col items-center justify-between w-28 h-32 rounded-xl border-2 cursor-pointer transition-all ${
      isSelected 
        ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
        : 'border-slate-700 bg-slate-800 hover:border-slate-500'
    } ${!isAffordable ? 'opacity-50 grayscale cursor-not-allowed' : ''}`;
    
    const imgName = def.id === 0 ? 'gatling' : (def.id === 1 ? 'cannon' : 'cryo');

    div.innerHTML = `
      <div class="p-3 w-full h-full flex flex-col items-center justify-between">
        <img src="/assets/towers/${imgName}.jpg" class="w-12 h-12 rounded-full border-2 border-slate-600 shadow-lg object-cover" />
        <div class="text-center w-full">
          <div class="text-xs font-bold text-slate-200 truncate">${def.name}</div>
          <div class="text-sm font-bold font-mono text-yellow-400 mt-1">🪙 ${def.baseCost}</div>
        </div>
      </div>
    `;
    
    div.onclick = () => {
      if (state.gold >= def.baseCost) {
        selectedShopItem = def.id;
        renderer.selectedTowerIndex = -1; // Deselect tower if we pick shop
        renderShop();
      }
    };
    shopItemsContainer.appendChild(div);
  });
};

const updateContextMenu = () => {
  if (renderer.selectedTowerIndex === -1) {
    ctxMenu.classList.add('hidden');
    return;
  }
  const tower = state.towers[renderer.selectedTowerIndex];
  if (!tower) {
    renderer.selectedTowerIndex = -1;
    ctxMenu.classList.add('hidden');
    return;
  }

  ctxMenu.classList.remove('hidden');
  ctxName.innerText = tower.def.name;
  ctxLvl.innerText = `${tower.level} / ${tower.def.maxLevel}`;
  ctxDmg.innerText = Math.round(tower.damage).toString();
  ctxRng.innerText = Math.round(tower.range).toString();
  
  if (tower.level >= tower.def.maxLevel) {
    btnUpgrade.innerText = `MAX LEVEL`;
    btnUpgrade.disabled = true;
  } else {
    btnUpgrade.innerText = `Upgrade (${tower.upgradeCost}g)`;
    btnUpgrade.disabled = state.gold < tower.upgradeCost;
  }
  
  btnSell.innerText = `Sell (${tower.sellValue}g)`;
};

// Event Listeners
btnPause.addEventListener('click', () => {
  if (state.state === 'PLAYING') {
    state.state = 'PAUSED';
    btnPause.innerText = 'Resume';
  } else if (state.state === 'PAUSED') {
    state.state = 'PLAYING';
    btnPause.innerText = 'Pause';
  }
});

const setSpeed = (mult: number, activeBtn: HTMLElement) => {
  loop.speedMultiplier = mult;
  speedBtns.forEach(b => {
    b.classList.remove('bg-blue-600', 'text-white');
    b.classList.add('text-slate-300');
  });
  activeBtn.classList.remove('text-slate-300');
  activeBtn.classList.add('bg-blue-600', 'text-white');
};

btn1x.addEventListener('click', () => setSpeed(1, btn1x));
btn2x.addEventListener('click', () => setSpeed(2, btn2x));
btn4x.addEventListener('click', () => setSpeed(4, btn4x));

btnRestart.addEventListener('click', () => {
  state = new GameState();
  renderer.setState(state);
  renderer.selectedTowerIndex = -1;
  selectedShopItem = null;
  btnPause.innerText = 'Pause';
  setSpeed(1, btn1x);
});

btnStress.addEventListener('click', () => {
  state.triggerStressTest();
});

btnUpgrade.addEventListener('click', () => {
  if (renderer.selectedTowerIndex !== -1) {
    state.upgradeTower(renderer.selectedTowerIndex);
    updateContextMenu();
    renderShop(); // Refresh shop availability
  }
});

btnSell.addEventListener('click', () => {
  if (renderer.selectedTowerIndex !== -1) {
    state.sellTower(renderer.selectedTowerIndex);
    renderer.selectedTowerIndex = -1;
    updateContextMenu();
    renderShop();
  }
});

// Canvas Interaction (Hover for preview, Click for placement/selection)
canvas.addEventListener('mousemove', (e) => {
  if (selectedShopItem !== null) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    renderer.placementPreview = {
      type: selectedShopItem,
      x: x,
      y: y
    };
    renderer.canPlacePreview = state.canBuildTower(x, y);
  } else {
    renderer.placementPreview = null;
  }
});

canvas.addEventListener('mouseleave', () => {
  renderer.placementPreview = null;
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  if (selectedShopItem !== null) {
    // Build Tower
    state.buildTower(selectedShopItem, x, y);
    selectedShopItem = null; // Reset selection after build
    renderer.placementPreview = null;
    renderShop();
  } else {
    // Select existing tower
    let clickedIndex = -1;
    for (let i = 0; i < state.towers.length; i++) {
      const tower = state.towers[i];
      const dx = tower.x - x;
      const dy = tower.y - y;
      if (dx*dx + dy*dy <= 16*16) { // 32x32 bounding box roughly
        clickedIndex = i;
        break;
      }
    }
    renderer.selectedTowerIndex = clickedIndex;
    updateContextMenu();
  }
});

let lastGold = -1;
const loop = new GameLoop(
  (dt) => {
    state.simulate(dt);
  },
  (alpha) => {
    renderer.render(alpha);
    
    // Update DOM UI
    waveEl.innerText = Math.min(state.currentWaveIndex + 1, 50).toString();
    hpEl.innerText = state.health.toString();
    goldEl.innerText = state.gold.toString();
    scoreEl.innerText = state.score.toString();
    fpsEl.innerText = Math.round(loop.perf.lastFps).toString();
    
    // Periodically update context menu (e.g. for dynamic enable/disable of upgrade button)
    updateContextMenu();
    
    // Only rebuild the shop DOM if gold changes to avoid element flicker
    if (state.gold !== lastGold) {
       lastGold = state.gold;
       renderShop(); 
    }
  }
);

renderShop();

// Render exactly once so the game board is visible behind the menu
setTimeout(() => renderer.render(1.0), 100);

const heroScreen = document.getElementById('hero-screen')!;
const btnPlay = document.getElementById('btn-play')!;

btnPlay.addEventListener('click', () => {
  heroScreen.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => heroScreen.remove(), 500); // Remove from DOM after fade out
  loop.start();
});
