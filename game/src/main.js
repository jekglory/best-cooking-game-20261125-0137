// Sizzle & Serve — game state, loop, input and screenshot shots.
// Plain ES modules, no libraries, no network: the whole game is static
// files under game/. Open game/index.html in a desktop browser and play.
//
// How to play: tickets arrive on the order board with a patience timer.
// Click ingredients on the counter (or press 1-8) to stack them on the
// plate, then SERVE (Space) when the plate matches a ticket exactly.
// A correct serve scores the dish price x10 plus a patience bonus and a
// combo bonus; a wrong serve costs 25 points and resets the combo; a
// ticket that runs out of patience walks away. The shift lasts 150
// seconds; every 3 serves the level rises and tickets arrive faster.

import { DISHES, DISH_BY_ID, INGREDIENTS, plateMatches } from './dishes.js';
import { drawScene, hitRects, W, H } from './render.js';
import { sfx, setMuted, isMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const SHIFT_LEN = 150;
const MAX_ORDERS = 3;

function freshState() {
  return {
    screen: 'title',
    score: 0,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    timeLeft: SHIFT_LEN,
    shiftLen: SHIFT_LEN,
    orders: [],
    plate: [],
    spawnIn: 2,
    nextOrderId: 1,
    message: '',
    messageT: 0,
    floaters: [],
    shake: 0,
    muted: isMuted(),
    ticked: new Set(),
  };
}

let state = freshState();
let lastTime = performance.now();

function announce(text) {
  if (statusEl) statusEl.textContent = text;
}

function say(text, ms = 2200) {
  state.message = text;
  state.messageT = ms / 1000;
}

function addFloater(text, x, y, color) {
  state.floaters.push({ text, x, y, t: 0, color });
}

function spawnInterval() {
  return Math.max(7, 12 - (state.level - 1));
}

function patienceMax() {
  return Math.max(30, 45 - (state.level - 1) * 2);
}

function randomDish() {
  return DISHES[Math.floor(Math.random() * DISHES.length)].id;
}

function spawnOrder() {
  if (state.orders.length >= MAX_ORDERS) return;
  const dish = randomDish();
  state.orders.push({
    id: state.nextOrderId++,
    dish,
    patience: patienceMax(),
    patienceMax: patienceMax(),
  });
  announce(`New order: ${DISH_BY_ID[dish].name}`);
}

function addIngredient(id) {
  if (state.screen !== 'playing') return;
  if (state.plate.length >= 4) {
    say('Plate is full — serve it or trash it!');
    sfx.wrong();
    return;
  }
  state.plate.push(id);
  sfx.add();
}

function trashPlate() {
  if (state.screen !== 'playing' || state.plate.length === 0) return;
  state.plate = [];
  sfx.trash();
  say('Plate trashed — fresh start.');
}

function serve() {
  if (state.screen !== 'playing') return;
  if (state.plate.length === 0) {
    say('Nothing on the plate yet!');
    return;
  }
  const match = state.orders.find((o) => plateMatches(state.plate, DISH_BY_ID[o.dish].recipe));
  if (!match) {
    state.score = Math.max(0, state.score - 25);
    state.combo = 0;
    state.shake = 10;
    sfx.wrong();
    say('No ticket matches that plate — minus 25!');
    announce('Wrong plate. Minus 25 points.');
    return;
  }
  const dish = DISH_BY_ID[match.dish];
  const patienceBonus = Math.round((match.patience / match.patienceMax) * 50);
  const comboBonus = state.combo * 25;
  const gained = dish.price * 10 + patienceBonus + comboBonus;
  state.score += gained;
  state.coins += dish.price;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((o) => o !== match);
  state.plate = [];
  sfx.serve();
  addFloater(`+${gained}`, 636, 300, '#2e6b34');
  say(`Served ${dish.name}! +${gained} points.`);
  announce(`Served ${dish.name} for ${gained} points. Combo ${state.combo}.`);
  if (state.served % 3 === 0) {
    state.level += 1;
    say(`Level ${state.level} — the rush gets faster!`);
  }
}

function startShift() {
  state = freshState();
  state.screen = 'playing';
  sfx.start();
  spawnOrder();
  say('Shift started — first ticket is in!');
}

function endShift() {
  state.screen = 'over';
  state.plate = [];
  sfx.win();
  announce(`Shift over. Score ${state.score}, ${state.served} dishes served.`);
}

function update(dt) {
  if (state.screen !== 'playing') return;
  state.timeLeft -= dt;
  if (state.messageT > 0) {
    state.messageT -= dt;
    if (state.messageT <= 0) state.message = '';
  }
  state.floaters.forEach((f) => { f.t += dt; });
  state.floaters = state.floaters.filter((f) => f.t < 1.4);
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 40);

  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnOrder();
    state.spawnIn = spawnInterval();
  }
  let expired = null;
  state.orders.forEach((o) => {
    o.patience -= dt;
    if (o.patience <= 5 && !state.ticked.has(o.id)) {
      state.ticked.add(o.id);
      sfx.tick();
    }
    if (o.patience <= 0 && !expired) expired = o;
  });
  if (expired) {
    state.orders = state.orders.filter((o) => o !== expired);
    state.combo = 0;
    state.score = Math.max(0, state.score - 10);
    state.ticked.delete(expired.id);
    sfx.expire();
    say(`Customer #${expired.id} walked away — minus 10.`);
    announce(`Order ${expired.id} expired.`);
  }
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endShift();
  }
}

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  const scale = Math.min(canvas.width / W, canvas.height / H);
  ctx.setTransform(scale, 0, 0, scale, (canvas.width - W * scale) / 2, (canvas.height - H * scale) / 2);
  ctx.clearRect(0, 0, W, H);
  drawScene(ctx, state);
  requestAnimationFrame(frame);
}

// --- input ---------------------------------------------------------------
function toLogical(e) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / W, rect.height / H);
  const ox = (rect.width - W * scale) / 2;
  const oy = (rect.height - H * scale) / 2;
  return { x: (e.clientX - rect.left - ox) / scale, y: (e.clientY - rect.top - oy) / scale };
}

function inside(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

canvas.addEventListener('pointerdown', (e) => {
  const p = toLogical(e);
  const hits = hitRects();
  if (state.screen === 'title') {
    if (inside(p, hits.start)) startShift();
    return;
  }
  if (state.screen === 'over') {
    if (inside(p, hits.restart)) startShift();
    return;
  }
  if (state.screen === 'paused') {
    state.screen = 'playing';
    return;
  }
  for (let i = 0; i < hits.bins.length; i++) {
    if (inside(p, hits.bins[i])) { addIngredient(INGREDIENTS[i].id); return; }
  }
  if (inside(p, hits.serve)) { serve(); return; }
  if (inside(p, hits.trash)) { trashPlate(); }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'm' || e.key === 'M') {
    setMuted(!isMuted());
    state.muted = isMuted();
    return;
  }
  if (state.screen === 'title' && (e.key === 'Enter' || e.key === ' ')) { startShift(); return; }
  if (state.screen === 'over' && (e.key === 'r' || e.key === 'R' || e.key === 'Enter')) { startShift(); return; }
  if (e.key === 'p' || e.key === 'P') {
    if (state.screen === 'playing') state.screen = 'paused';
    else if (state.screen === 'paused') state.screen = 'playing';
    return;
  }
  if (state.screen !== 'playing') return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); serve(); return; }
  if (e.key === 'Backspace' || e.key === 'Delete') { trashPlate(); return; }
  const idx = INGREDIENTS.findIndex((ing) => ing.key === e.key);
  if (idx >= 0) addIngredient(INGREDIENTS[idx].id);
});

// --- deterministic screenshot shots ----------------------------------------
// ?shot=start  title screen
// ?shot=play   mid-shift: two tickets, a dish half-built on the plate
// ?shot=serve  plate complete and matching ticket #1, SERVE lit up
// ?shot=rush   three tickets, one almost out of patience, 25s left
function applyShot(shot) {
  if (!shot) return;
  state = freshState();
  state.screen = 'playing';
  if (shot === 'start') {
    state.screen = 'title';
    return;
  }
  if (shot === 'play') {
    state.timeLeft = 118;
    state.score = 340;
    state.coins = 33;
    state.served = 3;
    state.combo = 2;
    state.bestCombo = 2;
    state.level = 2;
    state.orders = [
      { id: 4, dish: 'burger', patience: 32, patienceMax: 43 },
      { id: 5, dish: 'taco', patience: 18, patienceMax: 43 },
    ];
    state.plate = ['bun', 'patty'];
    state.message = 'Ticket #4 wants a Burger — two down, two to go!';
    return;
  }
  if (shot === 'serve') {
    state.timeLeft = 96;
    state.score = 620;
    state.coins = 55;
    state.served = 5;
    state.combo = 3;
    state.bestCombo = 3;
    state.level = 2;
    state.orders = [
      { id: 7, dish: 'burger', patience: 28, patienceMax: 41 },
      { id: 8, dish: 'salad', patience: 35, patienceMax: 41 },
    ];
    state.plate = ['bun', 'patty', 'cheese', 'lettuce'];
    return;
  }
  if (shot === 'rush') {
    state.timeLeft = 25;
    state.score = 1480;
    state.coins = 121;
    state.served = 11;
    state.combo = 4;
    state.bestCombo = 5;
    state.level = 4;
    state.orders = [
      { id: 12, dish: 'taco', patience: 6, patienceMax: 39 },
      { id: 13, dish: 'wrap', patience: 24, patienceMax: 39 },
      { id: 14, dish: 'melt', patience: 33, patienceMax: 39 },
    ];
    state.plate = ['tortilla', 'patty'];
    state.message = 'Ticket #12 is about to walk — serve that Taco!';
  }
}

// --- boot ------------------------------------------------------------------
resize();
window.addEventListener('resize', resize);
applyShot(new URLSearchParams(window.location.search).get('shot'));
requestAnimationFrame(frame);
