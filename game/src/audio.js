// Sizzle & Serve — tiny synthesized sound effects (WebAudio, no files).
// The context is created lazily on the first user gesture, so a headless
// screenshot run never touches audio and never blocks on autoplay policy.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function audio() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, at, dur, type = 'sine', vol = 0.12) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ac.currentTime + at);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + at + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + dur + 0.02);
}

export const sfx = {
  add() { tone(520, 0, 0.09, 'triangle', 0.1); tone(780, 0.05, 0.08, 'triangle', 0.08); },
  serve() { tone(523, 0, 0.12, 'triangle', 0.12); tone(659, 0.09, 0.12, 'triangle', 0.12); tone(784, 0.18, 0.2, 'triangle', 0.12); },
  wrong() { tone(160, 0, 0.18, 'sawtooth', 0.08); tone(110, 0.1, 0.22, 'sawtooth', 0.08); },
  trash() { tone(300, 0, 0.08, 'square', 0.06); },
  tick() { tone(980, 0, 0.05, 'square', 0.05); },
  expire() { tone(392, 0, 0.15, 'triangle', 0.1); tone(311, 0.14, 0.15, 'triangle', 0.1); tone(233, 0.28, 0.25, 'triangle', 0.1); },
  start() { tone(392, 0, 0.1, 'triangle', 0.1); tone(523, 0.09, 0.1, 'triangle', 0.1); tone(659, 0.18, 0.18, 'triangle', 0.12); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.22, 'triangle', 0.12)); },
};
