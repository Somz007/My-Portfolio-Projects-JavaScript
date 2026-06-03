# JavaScript Portfolio — Somz007

10 vanilla JavaScript projects built from scratch — no frameworks, no libraries, just the platform.

**[🌐 Live Portfolio](https://Somz007.github.io/My-Portfolio-Projects-JavaScript/)** · **[GitHub](https://github.com/Somz007)**

---

## Projects

| # | Project | What it does | Tech highlights |
|---|---------|--------------|-----------------|
| 01 | [Weather App](./project-01-weather-app/) | Real-time weather for any city — search by name or use geolocation, 7-day forecast, °C/°F toggle | Fetch API, async/await, Open-Meteo API, Geolocation API, Service Worker |
| 02 | [Todo List](./project-02-todo-list/) | Task manager with filtering (all/active/done), inline editing, and drag-to-reorder | localStorage, event delegation, HTML5 Drag and Drop |
| 03 | [Quiz App](./project-03-quiz-app/) | Trivia quiz with three difficulty levels, lifelines, a countdown timer, and per-category high scores | Open Trivia API, Web Audio API, localStorage |
| 04 | [Expense Tracker](./project-04-expense-tracker/) | Finance dashboard with hand-drawn charts, monthly budgets, CSV export, and live currency conversion | Canvas API (HiDPI), Frankfurter API, multi-tab UI, localStorage |
| 05 | [Markdown Editor](./project-05-markdown-editor/) | Split-pane editor with a from-scratch Markdown parser, multiple documents, autosave, and export | Custom parser (no libraries), ES Modules, split-pane resize, localStorage |
| 06 | [Tic-Tac-Toe](./project-06-tictactoe/) | vs AI or vs Human — AI uses minimax with alpha-beta pruning and is unbeatable on Hard | Minimax algorithm, alpha-beta pruning, Web Audio API, SVG win-line animation |
| 07 | [Recipe Finder](./project-07-recipe-finder/) | Search recipes by name or ingredient, browse by category, view details in a modal, save favourites | TheMealDB API, in-memory caching, event delegation, localStorage |
| 08 | [Habit Tracker](./project-08-habit-tracker/) | Daily check-ins, current and best streaks, a 12-week GitHub-style heatmap, clickable history | Date arithmetic, heatmap grid, localStorage, inline editing |
| 09 | [Snake](./project-09-snake/) | Canvas Snake with a fixed-timestep game loop, speed scaling, direction queue, win condition, sounds | Canvas API (HiDPI), requestAnimationFrame, Web Audio API, game state machine |
| 10 | [Kanban Board](./project-10-kanban/) | Drag-and-drop board across three columns (To Do / In Progress / Done) — works on desktop and mobile | Pointer Events API (touch + mouse), immutable state, undo toast, localStorage |

---

## Skills demonstrated

**JavaScript fundamentals**
- ES Modules (`import`/`export`) throughout every project
- Async patterns — `async/await`, `Promise.all`, fetch with error handling
- Closures, higher-order functions, array methods (`map`, `filter`, `reduce`)
- Immutable state — board logic in projects 06 and 10 returns new objects rather than mutating

**APIs and data**
- REST API integration with graceful error handling and loading states (projects 01, 03, 04, 07)
- In-memory caching with `Map` to avoid redundant network requests (projects 01, 07)
- `localStorage` persistence in every project that holds user data

**DOM and browser APIs**
- Canvas API with HiDPI rendering (`devicePixelRatio`) — projects 04 and 09
- Pointer Events API for cross-device drag-and-drop (project 10)
- HTML5 Drag and Drop (project 02), Geolocation (project 01), Web Audio (projects 03, 06, 09)
- `requestAnimationFrame` fixed-timestep game loop (project 09)
- Service Worker for offline support (project 01)
- Event delegation — one listener handling dynamic card/cell grids

**Algorithms and data structures**
- Minimax with alpha-beta pruning (project 06) — game tree search with provably optimal play
- Custom Markdown parser written from scratch — no `marked.js` or any library (project 05)
- Date arithmetic for consecutive-day streak calculation with timezone-safe local dates (project 08)
- Direction input queue (project 09) — prevents lost keypresses between game ticks

**Code quality**
- Pure functions tested in isolation — game logic, board mutations, streak calculations, storage CRUD
- Unit test suites with Vitest across 7 projects (140+ tests total)
- `esc()` HTML-escaping in every render function that accepts external data — no XSS surfaces
- `:focus-visible` keyboard navigation and ARIA roles/labels across all projects

---

## Running projects locally

All projects open directly in a browser — no build step, no bundler.

**Open in browser**

```bash
# clone the repo
git clone https://github.com/Somz007/My-Portfolio-Projects-JavaScript.git
cd My-Portfolio-Projects-JavaScript

# open any project — e.g. with VS Code Live Server:
code project-06-tictactoe
# then right-click index.html → Open with Live Server
```

> Projects that call external APIs (01, 03, 04, 07) need HTTP — open them via Live Server rather than the `file://` protocol.

**Run tests for a project**

```bash
cd project-09-snake
npm install
npm test
```

**Deploy all projects to GitHub Pages**

```bash
# from the repo root:
npm install
npm run deploy
```

This builds `dist/` (excludes node_modules and test files) and pushes to the `gh-pages` branch. Live within ~2 minutes at **https://Somz007.github.io/My-Portfolio-Projects-JavaScript/**.

---

## Repo structure

```
My-Portfolio-Projects-JavaScript/
├── project-01-weather-app/
├── project-02-todo-list/
├── project-03-quiz-app/
├── project-04-expense-tracker/
├── project-05-markdown-editor/
├── project-06-tictactoe/
├── project-07-recipe-finder/
├── project-08-habit-tracker/
├── project-09-snake/
├── project-10-kanban/
├── scripts/
│   └── build.mjs       ← copies projects to dist/, generates landing page
├── package.json        ← root deploy script (gh-pages)
└── README.md
```

Each project folder is self-contained with its own `index.html`, `style.css`, `js/`, `tests/`, and `package.json`.

---

**Semeshan** · [GitHub](https://github.com/Somz007) · [Live Portfolio](https://Somz007.github.io/My-Portfolio-Projects-JavaScript/)
