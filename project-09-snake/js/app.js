import { createGame, tick, safeDir, getScore, COLS, ROWS } from './game.js';
import { initCanvas, draw } from './render.js';

// ── Canvas setup ───────────────────────────────────────────────
// fit the board to the viewport on small screens
const MAX_PX   = 480;
const CELL     = Math.floor(Math.min(MAX_PX, window.innerWidth - 32) / COLS);
const canvas   = document.getElementById('game-canvas');
initCanvas(canvas, COLS, ROWS, CELL);

// ── Persistence ────────────────────────────────────────────────
const SCORE_KEY = 'snake-high-score';
const THEME_KEY = 'snake-theme';

function loadHighScore() { return parseInt(localStorage.getItem(SCORE_KEY) || '0', 10); }
function saveHighScore(n) { localStorage.setItem(SCORE_KEY, String(n)); }

let highScore = loadHighScore();

// ── Theme ──────────────────────────────────────────────────────
const root      = document.documentElement;
const themeBtn  = document.getElementById('theme-toggle');
let   theme     = localStorage.getItem(THEME_KEY) || 'dark';

function applyTheme(t) {
  theme = t;
  root.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, t);
}

themeBtn.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
applyTheme(theme);

// ── Game state ─────────────────────────────────────────────────
let state    = { ...createGame(), _showStart: true, _paused: false };
let started  = false;
let animId   = null;
let lastTick = 0;

const scoreEl     = document.getElementById('score-display');
const highScoreEl = document.getElementById('high-score-display');

function updateScoreUI() {
  scoreEl.textContent     = getScore(state);
  highScoreEl.textContent = highScore;
}

// ── Game loop ──────────────────────────────────────────────────
// speed scales with score: 150ms → 65ms minimum
function tickMs() { return Math.max(65, 150 - getScore(state) * 8); }

function loop(ts) {
  animId = requestAnimationFrame(loop);
  draw(state, highScore, theme);

  if (!started || state._paused || state.dead) return;

  if (ts - lastTick >= tickMs()) {
    state    = tick(state);
    lastTick = ts;
    updateScoreUI();

    if (state.dead) {
      const score = getScore(state);
      if (score > highScore) { highScore = score; saveHighScore(score); }
      updateScoreUI();
    }
  }
}

function startGame() {
  state    = { ...createGame(), _showStart: false, _paused: false };
  started  = true;
  lastTick = performance.now();
  updateScoreUI();
}

// kick off draw loop so the start screen renders immediately
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
  if (ARROW_KEYS.has(e.key)) e.preventDefault(); // stop page scroll

  if (e.key === 'Enter') {
    startGame();
    return;
  }

  if ((e.key === ' ' || e.key.toLowerCase() === 'p') && started && !state.dead) {
    state = { ...state, _paused: !state._paused };
    if (!state._paused) lastTick = performance.now();
    return;
  }

  const proposed = DIR_MAP[e.key];
  if (!proposed || !started || state.dead || state._paused) return;

  const safe = safeDir(state.dir, proposed);
  if (safe) state = { ...state, nextDir: safe };
});

// on-screen d-pad for mobile
document.querySelectorAll('.dpad-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const proposed = DIR_MAP[btn.dataset.dir];
    if (!proposed) return;
    if (!started || state.dead) { startGame(); return; }
    const safe = safeDir(state.dir, proposed);
    if (safe) state = { ...state, nextDir: safe };
  });
});
