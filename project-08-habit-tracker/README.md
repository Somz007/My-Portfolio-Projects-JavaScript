# Project 08 — Habit Tracker

A daily habit tracker with streak counting, a GitHub-style completion heatmap, and localStorage persistence.

Built as Project 8 of my JavaScript portfolio.

🔗 **[Live Demo](https://Somz007.github.io/My-Portfolio-Projects-JavaScript/project-08-habit-tracker/)**


---

## Features

- **Add / delete habits** — name your habits, delete with confirmation
- **Daily check-in** — one button per habit marks today done (toggle to undo)
- **Streak counter** — current consecutive-day streak; counts from yesterday if today isn't checked yet
- **Best streak** — all-time longest run displayed alongside the current streak
- **12-week heatmap** — GitHub-style grid (columns = weeks, rows = days Sun–Sat), future cells dimmed
- **localStorage persistence** — habits and check-in history survive page refreshes and browser restarts
- **Light / dark theme** — toggle persists via localStorage
- **Escape to cancel** — pressing Escape closes the add-habit form

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic shell, ARIA labels |
| CSS3 | Two themes, heatmap grid, card layout |
| Vanilla JS (ES Modules) | State, streak logic, rendering, localStorage |
| Vitest | 22 unit tests for pure streak logic |

---

## Getting Started

Open `index.html` directly in a browser — no server required (no API calls).

### Run tests

```bash
npm install
npm test
```

---

## File Structure

```
project-08-habit-tracker/
├── js/
│   ├── streak.js   ← pure date logic: getStreak, getLongestStreak, getHeatmapData
│   ├── storage.js  ← habits CRUD (localStorage)
│   ├── render.js   ← card + heatmap HTML string builders
│   └── app.js      ← state, form, event delegation, theme
├── tests/
│   └── streak.test.js
├── index.html
├── style.css
├── package.json
├── vitest.config.js
└── README.md
```

---

## Streak Logic

`getStreak(log)` walks backwards from today:

1. If today is checked — count consecutive days backwards from today
2. If today is not yet checked — try counting backwards from yesterday (still active streak)
3. If neither today nor yesterday is checked — streak is 0

`getLongestStreak(log)` sorts all logged dates and finds the longest run of consecutive days.

---

## Heatmap Layout

The heatmap uses CSS `grid-template-rows: repeat(7, 10px)` + `grid-auto-flow: column` so each column is a week (Sunday top, Saturday bottom) — same visual convention as GitHub's contribution graph.

The grid always starts on a Sunday and ends on the Saturday on or after today. Future cells are dimmed.

---

## What I Learned

- **Local-time date strings** — `toISOString()` gives UTC midnight, which shifts the date in negative-offset timezones; computing year/month/day with `getFullYear()`/`getMonth()`/`getDate()` keeps everything in local time
- **CSS grid for heatmaps** — `grid-auto-flow: column` with a fixed row count naturally fills left-to-right in week columns without JS sorting
- **Sparse log objects** — storing only completed dates (`{ 'YYYY-MM-DD': true }`) keeps localStorage small and makes membership checks O(1) vs scanning an array
- **Stateless renderers** — passing pre-computed values into `renderCard` means `render.js` has zero logic imports and is trivial to test or swap

---

## Author

**Semeshan** — [GitHub](https://github.com/Somz007)
