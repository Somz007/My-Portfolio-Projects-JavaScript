import { createGame, tick, safeDir, getScore, COLS, ROWS } from './game.js';
import { initCanvas, draw } from './render.js';
import { playEat, playDie, playNewBest } from './sound.js';

// ── Canvas setup ───────────────────────────────────────────────
const MAX_PX = 480;
const CELL   = Math.floor(Math.min(MAX_PX, window.innerWidth - 32) / COLS);
const canvas = document.getElementById('game-canvas');
initCanvas(canvas, COLS, ROWS, CELL);

// ── Persistence ────────────────────────────────────────────────
const SCORE_KEY = 'snake-high-score';
const THEME_KEY = 'snake-theme';

function loadHighScore() { return parseInt(localStorage.getItem(SCORE_KEY) || '0', 10); }
function saveHighScore(n) { localStorage.setItem(SCORE_KEY, String(n)); }

let highScore = loadHighScore();

// ── DOM refs ───────────────────────────────────────────────────
const root        = document.documentElement;
const themeBtn    = document.getElementById('theme-toggle');
const scoreEl     = document.getElementById('score-display');
const highScoreEl = document.getElementById('high-score-display');

// ── Theme ──────────────────────────────────────────────────────
let theme = localStorage.getItem(THEME_KEY) || 'dark';

function applyTheme(t) {
  theme = t;
  root.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, t);
}

themeBtn.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
applyTheme(theme);

// ── Score UI ───────────────────────────────────────────────────
function updateScoreUI() {
  scoreEl.textContent     = getScore(state);
  highScoreEl.textContent = highScore;
}

function popHighScore() {
  highScoreEl.classList.remove('pop');
  void highScoreEl.offsetWidth; // force reflow so animation restarts
  highScoreEl.classList.add('pop');
}

// ── Game state ─────────────────────────────────────────────────
let state    = { ...createGame(), _showStart: true, _paused: false, _newBest: false };
let started  = false;
let animId   = null;
let lastTick = 0;
let dirQueue = []; // pending direction changes — max 2 buffered

// ── Game loop ──────────────────────────────────────────────────
function tickMs() { return Math.max(65, 150 - getScore(state) * 8); }

function loop(ts) {
  animId = requestAnimationFrame(loop);
  draw(state, highScore, theme);

  if (!started || state._paused || state.dead || state.won) return;

  if (ts - lastTick >= tickMs()) {
    // dequeue the next buffered direction before ticking
    if (dirQueue.length > 0) state = { ...state, nextDir: dirQueue.shift() };

    state    = tick(state);
    lastTick = ts;
    updateScoreUI();

    if (state.ate) playEat();

    if (state.dead) {
      const score   = getScore(state);
      const newBest = score > highScore;
      if (newBest) { highScore = score; saveHighScore(score); popHighScore(); playNewBest(); }
      else { playDie(); }
      state = { ...state, _newBest: newBest };
      updateScoreUI();
    }

    if (state.won) {
      const score   = getScore(state);
      const newBest = score > highScore;
      if (newBest) { highScore = score; saveHighScore(score); popHighScore(); }
      // small delay so eat sound finishes before the fanfare
      setTimeout(playNewBest, 100);
      state = { ...state, _newBest: newBest };
      updateScoreUI();
    }
  }
}

function startGame() {
  state    = { ...createGame(), _showStart: false, _paused: false, _newBest: false };
  started  = true;
  lastTick = performance.now();
  dirQueue = [];
  updateScoreUI();
}

// kick off the draw loop immediately so the start screen shows
animId = requestAnimationFrame(loop);
updateScoreUI();

// ── Input ──────────────────────────────────────────────────────
const DIR_MAP = {
  ArrowUp:    { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown:  { x: 0, y:  1 }, s: { x: 0, y:  1 },
  ArrowLeft:  { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x:  1, y: 0 }, d: { x:  1, y: 0 },
};

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

document.addEventListener('keydown', e => {
  if (ARROW_KEYS.has(e.key)) e.preventDefault();

  if (e.key === 'Enter') { startGame(); return; }

  if ((e.key === ' ' || e.key.toLowerCase() === 'p') && started && !state.dead && !state.won) {
    state = { ...state, _paused: !state._paused };
    if (!state._paused) lastTick = performance.now();
    return;
  }

  const proposed = DIR_MAP[e.key];
  if (!proposed || !started || state.dead || state.won || state._paused) return;

  // compare against last queued direction to prevent buffered reversals
  const last = dirQueue[dirQueue.length - 1] ?? state.dir;
  const safe = safeDir(last, proposed);
  if (safe && dirQueue.length < 2) dirQueue.push(safe);
});

// mobile d-pad
document.querySelectorAll('.dpad-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const proposed = DIR_MAP[btn.dataset.dir];
    if (!proposed) return;
    if (!started || state.dead || state.won) { startGame(); return; }
    if (state._paused) return;
    const last = dirQueue[dirQueue.length - 1] ?? state.dir;
    const safe = safeDir(last, proposed);
    if (safe && dirQueue.length < 2) dirQueue.push(safe);
  });
});
