# Project 09 — Snake

Classic Snake built on HTML5 Canvas with a requestAnimationFrame game loop, speed scaling, and a mobile d-pad.

Built as Project 9 of my JavaScript portfolio.

---

## Features

- **Canvas rendering** — HiDPI-aware, smooth 60fps draw loop
- **Speed scaling** — game speeds up every point scored (150ms → 65ms minimum tick)
- **High score** — persists across sessions via localStorage
- **Pause / resume** — Space or P key
- **Mobile d-pad** — on-screen controls appear on narrow screens
- **Dark / light theme** — toggle persists via localStorage
- **Start screen + game-over overlay** — drawn directly onto the canvas

---

## Controls

| Key | Action |
|---|---|
| `Enter` | Start / restart |
| `W A S D` or Arrows | Move |
| `Space` / `P` | Pause / resume |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 Canvas | Rendering — grid, snake, food, overlays |
| `requestAnimationFrame` | Fixed-timestep game loop |
| Vanilla JS (ES Modules) | Game logic, state, input, theme |
| Vitest | 20 unit tests for pure game logic |

---

## Getting Started

Open `index.html` directly — no server required.

### Run tests

```bash
npm install
npm test
```

---

## File Structure

```
project-09-snake/
├── js/
│   ├── game.js    ← pure logic: tick, collision, food placement, scoring
│   ├── render.js  ← canvas drawing (background, snake, food, overlays)
│   └── app.js     ← game loop, input, theme, score UI
├── tests/
│   └── game.test.js
├── index.html
├── style.css
├── package.json
├── vitest.config.js
└── README.md
```

---

## What I Learned

- **Fixed-timestep loop** — decoupling game tick rate from render rate keeps physics consistent regardless of monitor refresh rate
- **HiDPI canvas** — scaling by `devicePixelRatio` prevents blurry rendering on retina screens
- **Immutable state** — returning new state objects from `tick()` makes each step testable in isolation without side effects
- **Self-collision edge case** — the tail vacates its cell on the same tick the head moves, so checking all-but-last prevents false positives

---

## Author

**Semeshan** — [GitHub](https://github.com/Somz007)
