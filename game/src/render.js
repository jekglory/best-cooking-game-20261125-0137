// Sizzle & Serve — all canvas drawing. One logical stage, 1280x800, scaled
// to the window; every picture is drawn with vector shapes, so the game
// needs no image files and no network.

import { DISHES, DISH_BY_ID, INGREDIENTS, ING_BY_ID, plateMatches } from './dishes.js';

export const W = 1280;
export const H = 800;

// Fixed layout, shared with main.js for hit-testing.
export const LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 24, y: 84, w: 272, h: 480 },
  kitchen: { x: 320, y: 84, w: 632, h: 536 },
  menu: { x: 976, y: 84, w: 280, h: 536 },
  counter: { x: 24, y: 640, w: 1232, h: 140 },
  plate: { x: 636, y: 330, r: 118 },
  serve: { x: 556, y: 500, w: 160, h: 56 },
  trash: { x: 736, y: 500, w: 120, h: 56 },
  start: { x: 490, y: 560, w: 300, h: 64 },
  restart: { x: 490, y: 600, w: 300, h: 64 },
};

export function binRect(i) {
  const gap = 12;
  const bw = (LAYOUT.counter.w - gap * (INGREDIENTS.length - 1)) / INGREDIENTS.length;
  return {
    x: LAYOUT.counter.x + i * (bw + gap),
    y: LAYOUT.counter.y + 28,
    w: bw,
    h: LAYOUT.counter.h - 40,
  };
}

export function hitRects() {
  return {
    bins: INGREDIENTS.map((_, i) => binRect(i)),
    serve: LAYOUT.serve,
    trash: LAYOUT.trash,
    start: LAYOUT.start,
    restart: LAYOUT.restart,
  };
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function bar(ctx, x, y, w, h, frac, fill, bg = '#3a2a1c') {
  ctx.fillStyle = bg;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (frac > 0) {
    ctx.fillStyle = fill;
    rr(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
    ctx.fill();
  }
}

// --- ingredient icons (pure vector) ---------------------------------------
export function drawIngredient(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = '#e8a94e';
    ctx.beginPath(); ctx.arc(0, r * 0.15, r, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c98d35';
    ctx.fillRect(-r, r * 0.15, r * 2, r * 0.22);
    ctx.fillStyle = '#fff3d6';
    [[-0.5, -0.55], [0, -0.75], [0.5, -0.55], [-0.2, -0.35], [0.3, -0.3]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.ellipse(dx * r, dy * r, r * 0.1, r * 0.06, 0.4, 0, Math.PI * 2); ctx.fill();
    });
  } else if (id === 'patty') {
    ctx.fillStyle = '#7a4a28';
    rr(ctx, -r, -r * 0.45, r * 2, r * 0.9, r * 0.4); ctx.fill();
    ctx.fillStyle = '#5d3418';
    [[-0.5, 0], [0.1, -0.2], [0.55, 0.15]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.12, 0, Math.PI * 2); ctx.fill();
    });
  } else if (id === 'cheese') {
    ctx.fillStyle = '#f5c542';
    ctx.beginPath(); ctx.moveTo(-r, r * 0.6); ctx.lineTo(r, r * 0.6); ctx.lineTo(0, -r * 0.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d99e12';
    [[-0.3, 0.25], [0.25, 0.3], [0, -0.2]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.11, 0, Math.PI * 2); ctx.fill();
    });
  } else if (id === 'lettuce') {
    ctx.fillStyle = '#5da24a';
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 8) {
      const rad = r * (0.85 + 0.18 * Math.sin(a * 5));
      const px = Math.cos(a) * rad, py = Math.sin(a) * rad * 0.8;
      if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#35702a'; ctx.lineWidth = r * 0.08;
    ctx.beginPath(); ctx.moveTo(-r * 0.6, 0); ctx.lineTo(r * 0.6, 0); ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = '#d8443a';
    ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5da24a';
    ctx.beginPath(); ctx.ellipse(0, -r * 0.75, r * 0.35, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f0837c';
    ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.25, r * 0.22, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'onion') {
    ctx.fillStyle = '#efe6f2';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8a5fa8'; ctx.lineWidth = r * 0.09;
    [0.3, 0.55, 0.78].forEach((f) => { ctx.beginPath(); ctx.arc(0, 0, r * f, 0, Math.PI * 2); ctx.stroke(); });
    ctx.fillStyle = '#5da24a';
    ctx.beginPath(); ctx.ellipse(0, -r * 0.85, r * 0.12, r * 0.3, 0.2, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'tortilla') {
    ctx.fillStyle = '#e8cf96';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c9a45e';
    [[-0.4, -0.3], [0.35, -0.45], [0.1, 0.35], [0.5, 0.2], [-0.15, 0.55]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.12, 0, Math.PI * 2); ctx.fill();
    });
  } else if (id === 'sauce') {
    ctx.fillStyle = '#e2703a';
    rr(ctx, -r * 0.42, -r * 0.35, r * 0.84, r * 1.05, r * 0.2); ctx.fill();
    ctx.fillStyle = '#a34a1d';
    rr(ctx, -r * 0.22, -r * 0.85, r * 0.44, r * 0.55, r * 0.12); ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.font = `bold ${Math.round(r * 0.55)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('S', 0, r * 0.45);
  }
  ctx.restore();
}

// --- scene ------------------------------------------------------------------
export function drawScene(ctx, s) {
  ctx.save();
  if (s.shake > 0) ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
  drawBackground(ctx, s);
  drawHUD(ctx, s);
  drawOrderBoard(ctx, s);
  drawKitchen(ctx, s);
  drawMenuPanel(ctx, s);
  drawCounter(ctx, s);
  drawFloaters(ctx, s);
  if (s.screen === 'title') drawTitle(ctx, s);
  if (s.screen === 'paused') drawPaused(ctx, s);
  if (s.screen === 'over') drawOver(ctx, s);
  ctx.restore();
}

function drawBackground(ctx, s) {
  ctx.fillStyle = '#f7e8c8';
  ctx.fillRect(0, 0, W, H);
  // Wall tiles.
  ctx.fillStyle = '#f2dfba';
  for (let y = 64; y < 640; y += 56) for (let x = (y % 112 ? 28 : 0); x < W; x += 56) {
    ctx.fillRect(x, y, 52, 52);
  }
  ctx.fillStyle = '#e3cda0';
  ctx.fillRect(0, 628, W, 12);
  // Floor.
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(0, 640, W, 160);
  ctx.fillStyle = '#7a4c2a';
  for (let x = 0; x < W; x += 128) ctx.fillRect(x, 640, 4, 160);
  // Shelf with pots, top right of the kitchen.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(340, 96, 300, 10);
  ctx.fillStyle = '#c9ccd4';
  ctx.beginPath(); ctx.arc(390, 86, 22, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#8f959e';
  ctx.beginPath(); ctx.arc(470, 88, 18, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#b56a3a';
  ctx.beginPath(); ctx.arc(550, 88, 18, Math.PI, 0); ctx.fill();
}

function drawHUD(ctx, s) {
  ctx.fillStyle = '#3a2415';
  ctx.fillRect(0, 0, W, 64);
  text(ctx, '🍳 SIZZLE & SERVE', 24, 42, 28, '#ffd98a');
  text(ctx, `Score ${s.score}`, 330, 42, 24, '#ffffff');
  text(ctx, `💰 ${s.coins}`, 520, 42, 24, '#ffd94a');
  text(ctx, `Served ${s.served}`, 640, 42, 22, '#cfe8b0');
  text(ctx, `Level ${s.level}`, 780, 42, 22, '#cfe8b0');
  // Shift timer.
  const frac = s.timeLeft / s.shiftLen;
  const urgent = s.timeLeft <= 20;
  text(ctx, `⏱ ${Math.ceil(s.timeLeft)}s`, 920, 42, 22, urgent ? '#ff8a7a' : '#ffffff');
  bar(ctx, 1010, 22, 180, 20, frac, urgent ? '#e04a3a' : '#5da24a', '#5a3a22');
}

function drawOrderBoard(ctx, s) {
  const b = LAYOUT.board;
  ctx.fillStyle = 'rgba(58,36,21,0.92)';
  rr(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  text(ctx, '📋 ORDER BOARD', b.x + 16, b.y + 32, 20, '#ffd98a');
  if (s.orders.length === 0) {
    text(ctx, 'No orders yet —', b.x + 16, b.y + 90, 17, '#e8dcc2', 'normal');
    text(ctx, 'customers are coming!', b.x + 16, b.y + 114, 17, '#e8dcc2', 'normal');
  }
  s.orders.forEach((o, i) => {
    const y = b.y + 56 + i * 132;
    const dish = DISH_BY_ID[o.dish];
    const frac = o.patience / o.patienceMax;
    ctx.fillStyle = i === 0 ? '#fff6dd' : '#f3e6c2';
    rr(ctx, b.x + 12, y, b.w - 24, 118, 10); ctx.fill();
    text(ctx, `#${o.id}  ${dish.name}`, b.x + 26, y + 28, 19, '#3a2415');
    text(ctx, `$${dish.price}`, b.x + b.w - 26, y + 28, 19, '#7a4a28', 'bold', 'right');
    dish.recipe.forEach((ing, j) => drawIngredient(ctx, ing, b.x + 42 + j * 56, y + 62, 20));
    bar(ctx, b.x + 26, y + 92, b.w - 52, 12, frac, frac > 0.5 ? '#5da24a' : frac > 0.25 ? '#e8a13a' : '#e04a3a');
    text(ctx, `${Math.ceil(o.patience)}s left`, b.x + 26, y + 115, 12, '#7a4a28', 'bold');
  });
  text(ctx, 'Serve the ticket whose dish', b.x + 16, b.y + b.h - 24, 15, '#d9c49a', 'normal');
  text(ctx, 'matches your plate exactly.', b.x + 16, b.y + b.h - 6, 15, '#d9c49a', 'normal');
}

function drawKitchen(ctx, s) {
  const k = LAYOUT.kitchen;
  ctx.fillStyle = '#d9b98a';
  rr(ctx, k.x, k.y, k.w, k.h, 14); ctx.fill();
  ctx.fillStyle = '#b98d5a';
  rr(ctx, k.x, k.y, k.w, 34, 14); ctx.fill();
  text(ctx, '🔥 THE KITCHEN', k.x + 16, k.y + 24, 18, '#fff6dd');
  // Stove with two steaming pots, left side.
  ctx.fillStyle = '#4a4a52';
  rr(ctx, k.x + 24, k.y + 64, 180, 110, 10); ctx.fill();
  ctx.fillStyle = '#2e2e34';
  ctx.beginPath(); ctx.arc(k.x + 70, k.y + 112, 30, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(k.x + 158, k.y + 112, 30, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 4;
  const t = performance.now() / 900;
  [70, 158].forEach((cx, i) => {
    ctx.beginPath();
    for (let yy = 0; yy < 34; yy += 4) {
      const xx = k.x + cx + Math.sin(yy / 8 + t + i * 2) * 6;
      if (yy === 0) ctx.moveTo(xx, k.y + 78 - yy); else ctx.lineTo(xx, k.y + 78 - yy);
    }
    ctx.stroke();
  });
  // Cutting board, right side.
  ctx.fillStyle = '#c98d4e';
  rr(ctx, k.x + 440, k.y + 64, 168, 110, 10); ctx.fill();
  drawIngredient(ctx, 'tomato', k.x + 480, k.y + 118, 20);
  drawIngredient(ctx, 'lettuce', k.x + 540, k.y + 118, 20);
  drawIngredient(ctx, 'onion', k.x + 580, k.y + 118, 20);
  text(ctx, 'PREP', k.x + 524, k.y + 162, 13, '#7a4a28', 'bold', 'center');

  // The plate: stacked ingredients, mid-assembly.
  const p = LAYOUT.plate;
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 58, p.r + 12, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 46, p.r, 34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8e0cc';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 46, p.r - 16, 24, 0, 0, Math.PI * 2); ctx.fill();
  if (s.plate.length === 0) {
    text(ctx, 'Empty plate —', p.x, p.y - 6, 19, '#8a7a5e', 'normal', 'center');
    text(ctx, 'click ingredients below', p.x, p.y + 20, 19, '#8a7a5e', 'normal', 'center');
  } else {
    s.plate.forEach((ing, i) => {
      const y = p.y + 44 - (i + 1) * 26;
      drawIngredient(ctx, ing, p.x, y, 30);
    });
  }
  // Serve / trash buttons.
  const ready = s.orders.some((o) => plateMatches(s.plate, DISH_BY_ID[o.dish].recipe));
  const sv = LAYOUT.serve;
  ctx.fillStyle = ready ? '#4caf50' : '#8a8a7a';
  rr(ctx, sv.x, sv.y, sv.w, sv.h, 12); ctx.fill();
  text(ctx, ready ? '✅ SERVE!' : 'SERVE', sv.x + sv.w / 2, sv.y + 36, 22, '#ffffff', 'bold', 'center');
  const tr = LAYOUT.trash;
  ctx.fillStyle = '#a34a3a';
  rr(ctx, tr.x, tr.y, tr.w, tr.h, 12); ctx.fill();
  text(ctx, '🗑 TRASH', tr.x + tr.w / 2, tr.y + 36, 20, '#ffffff', 'bold', 'center');
  if (ready) {
    const match = s.orders.find((o) => plateMatches(s.plate, DISH_BY_ID[o.dish].recipe));
    if (!s.message) text(ctx, `Matches order #${match.id} — ${DISH_BY_ID[match.dish].name}!`, p.x, sv.y + 82, 17, '#2e6b34', 'bold', 'center');
  } else if (s.plate.length > 0) {
    if (!s.message) text(ctx, 'Keep stacking — or trash it and start over.', p.x, sv.y + 82, 16, '#7a5a3a', 'normal', 'center');
  }
}

function drawMenuPanel(ctx, s) {
  const m = LAYOUT.menu;
  ctx.fillStyle = 'rgba(58,36,21,0.92)';
  rr(ctx, m.x, m.y, m.w, m.h, 14); ctx.fill();
  text(ctx, '📖 TODAY’S MENU', m.x + 16, m.y + 32, 20, '#ffd98a');
  DISHES.forEach((d, i) => {
    const y = m.y + 56 + i * 62;
    text(ctx, d.name, m.x + 16, y + 8, 18, '#fff6dd');
    text(ctx, `$${d.price}`, m.x + m.w - 16, y + 8, 18, '#ffd94a', 'bold', 'right');
    d.recipe.forEach((ing, j) => drawIngredient(ctx, ing, m.x + 30 + j * 44, y + 32, 15));
  });
  const cy = m.y + 56 + DISHES.length * 62 + 16;
  text(ctx, `🔥 Combo x${Math.max(1, s.combo)}`, m.x + 16, cy, 20, s.combo >= 3 ? '#ffd94a' : '#e8dcc2');
  bar(ctx, m.x + 16, cy + 12, m.w - 32, 12, Math.min(1, s.combo / 5), '#e2703a');
  text(ctx, 'Chain correct serves', m.x + 16, cy + 44, 14, '#d9c49a', 'normal');
  text(ctx, 'to grow the combo.', m.x + 16, cy + 62, 14, '#d9c49a', 'normal');
  text(ctx, `Best combo: ${s.bestCombo}`, m.x + 16, cy + 92, 15, '#e8dcc2');
  text(ctx, 'Keys 1–8 add ingredients.', m.x + 16, m.y + m.h - 40, 14, '#d9c49a', 'normal');
  text(ctx, 'Space serves · P pauses · M mutes.', m.x + 16, m.y + m.h - 20, 14, '#d9c49a', 'normal');
}

function drawCounter(ctx, s) {
  const c = LAYOUT.counter;
  ctx.fillStyle = '#6b4423';
  rr(ctx, c.x, c.y, c.w, c.h, 14); ctx.fill();
  text(ctx, '🥕 INGREDIENT COUNTER — click or press 1–8', c.x + 16, c.y + 18, 17, '#ffd98a');
  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    const onPlate = s.plate.includes(ing.id);
    ctx.fillStyle = onPlate ? '#ffe9b0' : '#f7e8c8';
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill();
    ctx.strokeStyle = onPlate ? '#e8a13a' : '#b98d5a';
    ctx.lineWidth = onPlate ? 3 : 2;
    rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.stroke();
    drawIngredient(ctx, ing.id, r.x + r.w / 2, r.y + 40, 26);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 88, 16, '#3a2415', 'bold', 'center');
    ctx.fillStyle = '#7a4a28';
    ctx.beginPath(); ctx.arc(r.x + r.w - 16, r.y + 16, 11, 0, Math.PI * 2); ctx.fill();
    text(ctx, ing.key, r.x + r.w - 16, r.y + 21, 13, '#ffffff', 'bold', 'center');
  });
}

function drawFloaters(ctx, s) {
  s.floaters.forEach((f) => {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.4);
    text(ctx, f.text, f.x, f.y - f.t * 40, 24, f.color, 'bold', 'center');
    ctx.globalAlpha = 1;
  });
  if (s.message) {
    // In the kitchen panel's empty bottom band, so it never covers the
    // kitchen header, the plate, or the ingredient bins.
    ctx.fillStyle = 'rgba(58,36,21,0.92)';
    const w = ctx.measureText(s.message).width + 40;
    rr(ctx, W / 2 - w / 2, 566, w, 38, 10); ctx.fill();
    text(ctx, s.message, W / 2, 591, 18, '#ffd98a', 'bold', 'center');
  }
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(30,18,8,0.72)';
  ctx.fillRect(0, 0, W, H);
}

function drawTitle(ctx, s) {
  overlay(ctx);
  text(ctx, '🍳', W / 2, 210, 90, '#ffd98a', 'bold', 'center');
  text(ctx, 'SIZZLE & SERVE', W / 2, 300, 64, '#ffd98a', 'bold', 'center');
  text(ctx, 'The lunch rush is on. Read the tickets, stack the dish, serve it hot.', W / 2, 350, 22, '#ffffff', 'normal', 'center');
  text(ctx, 'Wrong plate? Trash it. Slow ticket? The customer walks.', W / 2, 382, 22, '#ffffff', 'normal', 'center');
  text(ctx, 'Serve 3 dishes to level up — the rush only gets faster.', W / 2, 414, 22, '#ffffff', 'normal', 'center');
  const b = LAYOUT.start;
  ctx.fillStyle = '#4caf50';
  rr(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  text(ctx, '▶  START SHIFT  (Enter)', b.x + b.w / 2, b.y + 41, 24, '#ffffff', 'bold', 'center');
  text(ctx, 'Click ingredients or press 1–8 · Space serves · P pauses · M mutes', W / 2, 668, 17, '#d9c49a', 'normal', 'center');
}

function drawPaused(ctx) {
  overlay(ctx);
  text(ctx, '⏸ PAUSED', W / 2, 360, 56, '#ffd98a', 'bold', 'center');
  text(ctx, 'Press P or click anywhere to keep cooking.', W / 2, 410, 22, '#ffffff', 'normal', 'center');
}

function drawOver(ctx, s) {
  overlay(ctx);
  text(ctx, '🏁 SHIFT OVER!', W / 2, 260, 56, '#ffd98a', 'bold', 'center');
  text(ctx, `Score: ${s.score}`, W / 2, 340, 32, '#ffffff', 'bold', 'center');
  text(ctx, `Dishes served: ${s.served}   ·   Coins earned: ${s.coins}   ·   Best combo: x${s.bestCombo}`, W / 2, 390, 22, '#e8dcc2', 'normal', 'center');
  const stars = s.score >= 2000 ? 3 : s.score >= 1200 ? 2 : s.score >= 600 ? 1 : 0;
  text(ctx, '★'.repeat(stars) + '☆'.repeat(3 - stars), W / 2, 460, 48, '#ffd94a', 'bold', 'center');
  text(ctx, stars === 3 ? 'Three stars — head chef material!' : stars === 2 ? 'Two stars — solid service!' : stars === 1 ? 'One star — the rush beat you this time.' : 'No stars — the lunch rush wins today. Try again!', W / 2, 510, 20, '#ffffff', 'normal', 'center');
  const b = LAYOUT.restart;
  ctx.fillStyle = '#4caf50';
  rr(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill();
  text(ctx, '↻  COOK AGAIN  (R)', b.x + b.w / 2, b.y + 41, 24, '#ffffff', 'bold', 'center');
}
