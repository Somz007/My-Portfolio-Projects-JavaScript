// render.js — all canvas drawing. Stateless: call draw() every frame.

import { INIT_LENGTH } from './game.js';

let _ctx      = null;
let _cols     = 0;
let _rows     = 0;
let _cell     = 0;

// call once on init and whenever the canvas size changes
export function initCanvas(canvas, cols, rows, cellSize) {
  _cols = cols;
  _rows = rows;
  _cell = cellSize;

  const dpr = window.devicePixelRatio || 1;
  canvas.width  = cols * cellSize * dpr;
  canvas.height = rows * cellSize * dpr;
  canvas.style.width  = `${cols * cellSize}px`;
  canvas.style.height = `${rows * cellSize}px`;

  _ctx = canvas.getContext('2d');
  _ctx.scale(dpr, dpr);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,     x + r, y,         r);
  ctx.closePath();
}

export function draw(state, highScore, theme) {
  if (!_ctx) return;

  const ctx  = _ctx;
  const cs   = _cell;
  const dark = theme === 'dark';
  const W    = _cols * cs;
  const H    = _rows * cs;

  // background
  ctx.fillStyle = dark ? '#0d1117' : '#f1f5f9';
  ctx.fillRect(0, 0, W, H);

  // subtle grid
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= _cols; x++) {
    ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, H); ctx.stroke();
  }
  for (let y = 0; y <= _rows; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(W, y * cs); ctx.stroke();
  }

  // food — red circle with glow
  const food = state.food;
  const fr   = cs * 0.38;
  const fx   = food.x * cs + cs / 2;
  const fy   = food.y * cs + cs / 2;
  ctx.save();
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur  = 8;
  ctx.fillStyle   = '#ef4444';
  ctx.beginPath();
  ctx.arc(fx, fy, fr, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // snake — body first, head on top
  state.snake.forEach((seg, i) => {
    const isHead = i === 0;
    const p = 1.5;
    const r = cs * 0.35;

    ctx.fillStyle = isHead
      ? (dark ? '#4ade80' : '#15803d')
      : (dark ? '#22c55e' : '#22c55e');

    roundRect(ctx, seg.x * cs + p, seg.y * cs + p, cs - p * 2, cs - p * 2, r);
    ctx.fill();

    // eyes on head
    if (isHead) {
      const { x: dx, y: dy } = state.dir;
      const eyeColor  = dark ? '#0d1117' : '#f0fdf4';
      const eyeRadius = cs * 0.09;
      // place eyes perpendicular to movement direction
      const perps = dy === 0
        ? [{ x: dx * cs * 0.2, y: -cs * 0.18 }, { x: dx * cs * 0.2, y: cs * 0.18 }]
        : [{ x: -cs * 0.18, y: dy * cs * 0.2 }, { x: cs * 0.18,  y: dy * cs * 0.2 }];

      ctx.fillStyle = eyeColor;
      perps.forEach(({ x: ex, y: ey }) => {
        const cx = seg.x * cs + cs / 2 + ex;
        const cy = seg.y * cs + cs / 2 + ey;
        ctx.beginPath();
        ctx.arc(cx, cy, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  });

  // overlay (win / game over / start / pause)
  const score = state.snake.length - INIT_LENGTH;

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  if (state.won) {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'gold';
    ctx.font      = `bold ${cs * 0.85}px monospace`;
    ctx.fillText('YOU WIN! 🏆', W / 2, H / 2 - cs * 1.8);
    ctx.fillStyle = '#e2e8f0';
    ctx.font      = `${cs * 0.65}px monospace`;
    ctx.fillText(`Score: ${score}`, W / 2, H / 2 - cs * 0.5);
    ctx.fillStyle = '#94a3b8';
    ctx.font      = `${cs * 0.5}px monospace`;
    ctx.fillText('Enter to play again', W / 2, H / 2 + cs * 1.6);
  } else if (state.dead || state._showStart) {
    ctx.fillStyle = 'rgba(0,0,0,0.68)';
    ctx.fillRect(0, 0, W, H);

    if (state.dead) {
      ctx.fillStyle = '#f87171';
      ctx.font      = `bold ${cs * 0.9}px monospace`;
      ctx.fillText('GAME OVER', W / 2, H / 2 - cs * 1.8);

      ctx.fillStyle = '#e2e8f0';
      ctx.font      = `${cs * 0.65}px monospace`;
      ctx.fillText(`Score: ${score}`, W / 2, H / 2 - cs * 0.6);

      if (state._newBest) {
        ctx.fillStyle = 'gold';
        ctx.fillText('New best! 🏆', W / 2, H / 2 + cs * 0.5);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font      = `${cs * 0.5}px monospace`;
      ctx.fillText('Enter to play again', W / 2, H / 2 + cs * 1.6);
    } else {
      ctx.fillStyle = dark ? '#4ade80' : '#15803d';
      ctx.font      = `bold ${cs * 0.85}px monospace`;
      ctx.fillText('🐍 SNAKE', W / 2, H / 2 - cs * 1.2);

      ctx.fillStyle = '#94a3b8';
      ctx.font      = `${cs * 0.52}px monospace`;
      ctx.fillText('Press Enter to start', W / 2, H / 2 + cs * 0.2);
      ctx.fillText('WASD / Arrows · Space to pause', W / 2, H / 2 + cs * 1.1);
    }
  }

  if (state._paused && !state.dead && !state.won) {
    ctx.fillStyle    = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle    = '#e2e8f0';
    ctx.font         = `bold ${cs * 0.85}px monospace`;
    ctx.fillText('PAUSED', W / 2, H / 2);
  }
}
