# Project 10 — Kanban Board

A drag-and-drop Kanban board with three columns, inline card editing, and localStorage persistence. Built entirely with the native HTML5 Drag and Drop API — no libraries.

Built as Project 10 of my JavaScript portfolio.

---

## Features

- **Drag and drop** — drag cards between To Do, In Progress, and Done; a drop-line shows exactly where the card will land
- **Add cards** — inline form per column with Ctrl+Enter to submit, Escape to cancel
- **Edit cards** — click the ✎ button to edit inline; blur or Ctrl+Enter saves
- **Delete cards** — click the ✕ button to remove
- **Done styling** — cards in the Done column get a strikethrough to signal completion
- **localStorage** — board state persists across sessions
- **Light / dark theme** — toggle persists via localStorage
- **Responsive** — three-column grid collapses to a single column on mobile

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 Drag and Drop API | Card dragging and drop-position detection |
| HTML5 / CSS3 | Layout, column accents, card animations |
| Vanilla JS (ES Modules) | Board logic, rendering, storage, events |
| Vitest | 20 unit tests for pure board logic |

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
project-10-kanban/
├── js/
│   ├── board.js    ← pure board logic: add, delete, edit, move, stats
│   ├── storage.js  ← localStorage load/save
│   ├── render.js   ← HTML string builders for columns and cards
│   └── app.js      ← state, drag-and-drop, delegation, theme
├── tests/
│   └── board.test.js
├── index.html
├── style.css
├── package.json
├── vitest.config.js
└── README.md
```

---

## Drag and Drop Implementation

The HTML5 DnD API is event-driven:

1. `dragstart` — records which card and column are being dragged
2. `dragover` — calculates drop position by comparing `clientY` to card midpoints; inserts a visual drop-line
3. `drop` — calls `moveCard()` with the computed insertion index, saves, re-renders
4. `dragend` — cleans up all drag-over classes and drop-lines

Cards animate to `opacity: 0.35` and `rotate(2deg)` while being dragged (applied to the original via `requestAnimationFrame` to let the ghost render first).

---

## What I Learned

- **Native DnD API** — no library needed for full drag-and-drop including mid-list insertion; the key is `dragover`'s `getBoundingClientRect()` midpoint check
- **Immutable board state** — every `board.js` function returns a new object rather than mutating, making the logic trivially testable and predictable
- **Event delegation** — a single click handler on the board container manages add, edit, and delete across all dynamic cards; no per-card listeners

---

## Author

**Semeshan** — [GitHub](https://github.com/Somz007)
