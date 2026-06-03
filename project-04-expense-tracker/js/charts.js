// charts.js — Canvas API chart drawing
//
// All charts are animated with requestAnimationFrame.
// HiDPI support: we multiply canvas dimensions by devicePixelRatio so
// charts look sharp on retina/4K screens.

// sets up a canvas for HiDPI rendering and returns the 2d context
function setupCanvas(canvas) {
  const dpr  = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width  = rect.width  * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

// ease-out cubic — makes animations decelerate naturally
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

// runs an animation for `duration` ms, calling draw(progress 0→1) each frame
function animate(draw, duration = 600) {
  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    draw(easeOut(progress));
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ── Donut chart ────────────────────────────────────────────────
//
// segments: [{ label, value, color }]
// centerLabel: text to show in the hole (e.g. total amount)
// surfaceColor: background color to draw the donut hole (must match card bg)

export function drawDonut(canvas, segments, centerLabel, surfaceColor = '#161b22') {
  if (!canvas) return;

  const { ctx, w, h } = setupCanvas(canvas);
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    // nothing to draw — show placeholder ring
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.38, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth   = Math.min(w, h) * 0.14;
    ctx.stroke();
    return;
  }

  const cx     = w / 2;
  const cy     = h / 2;
  const radius = Math.min(w, h) * 0.42;
  const hole   = radius * 0.58;
  const gap    = 0.025; // radians gap between segments

  animate(progress => {
    ctx.clearRect(0, 0, w, h);

    let angle = -Math.PI / 2; // start from top

    segments.forEach(seg => {
      const sweep = (seg.value / total) * Math.PI * 2 * progress;
      if (sweep < 0.001) return;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle + gap / 2, angle + sweep - gap / 2);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();

      angle += sweep;
    });

    // donut hole — draw over the centre in the surface colour
    ctx.beginPath();
    ctx.arc(cx, cy, hole, 0, Math.PI * 2);
    ctx.fillStyle = surfaceColor;
    ctx.fill();

    if (progress === 1) {
      // center label only appears when animation finishes
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle    = '#e6edf3';
      ctx.font         = `bold ${Math.floor(h * 0.11)}px "Segoe UI", system-ui`;
      ctx.fillText(centerLabel, cx, cy - h * 0.04);
      ctx.font      = `${Math.floor(h * 0.07)}px "Segoe UI", system-ui`;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText('total', cx, cy + h * 0.07);
    }
  });
}

// ── Bar chart ──────────────────────────────────────────────────
//
// bars: [{ label, value }]
// accentColor: bar fill colour

export function drawBars(canvas, bars, accentColor = '#3fb950') {
  if (!canvas || bars.length === 0) return;

  const { ctx, w, h } = setupCanvas(canvas);
  const pad     = { top: 20, right: 16, bottom: 44, left: 56 };
  const chartW  = w - pad.left - pad.right;
  const chartH  = h - pad.top  - pad.bottom;
  const maxVal  = Math.max(...bars.map(b => b.value), 1);
  const barW    = (chartW / bars.length) * 0.55;
  const spacing = chartW / bars.length;

  // nice Y axis: round up to nearest clean number
  const yMax  = Math.ceil(maxVal / 100) * 100 || 100;
  const ticks = 4;

  animate(progress => {
    ctx.clearRect(0, 0, w, h);

    // ── Y axis ticks + grid lines ───────────────────────────
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.font         = '11px "Segoe UI", system-ui';
    ctx.fillStyle    = 'rgba(255,255,255,0.3)';
    ctx.strokeStyle  = 'rgba(255,255,255,0.06)';
    ctx.lineWidth    = 1;

    for (let i = 0; i <= ticks; i++) {
      const val  = (yMax / ticks) * i;
      const y    = pad.top + chartH - (val / yMax) * chartH;
      const label = val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`;

      ctx.fillText(label, pad.left - 8, y);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
    }

    // ── Bars ───────────────────────────────────────────────
    bars.forEach((bar, i) => {
      const barH  = (bar.value / yMax) * chartH * progress;
      const x     = pad.left + i * spacing + (spacing - barW) / 2;
      const y     = pad.top  + chartH - barH;
      const r     = Math.min(6, barW / 3);

      // rounded-top bar
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      // subtle gradient fill — lighter at top
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, accentColor);
      grad.addColorStop(1, accentColor + '80');
      ctx.fillStyle = grad;
      ctx.fill();

      // X axis label
      if (progress === 1) {
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle    = 'rgba(255,255,255,0.4)';
        ctx.font         = '11px "Segoe UI", system-ui';
        ctx.fillText(bar.label, x + barW / 2, pad.top + chartH + 10);
      }
    });
  });
}
