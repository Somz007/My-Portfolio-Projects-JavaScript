# Project 04 — Expense Tracker

A personal finance dashboard with hand-drawn Canvas charts, budgets, and live multi-currency conversion. Defaults to South African Rand (ZAR).

Built as Project 4 of my JavaScript portfolio.

🔗 **[Live Demo](https://Somz007.github.io/My-Portfolio-Projects-JavaScript/project-04-expense-tracker/)**


---

## Features

- **Overview dashboard** — monthly total with % change vs last month, top category, transaction count
- **Canvas charts** (no chart library) — animated donut for category breakdown, 6-month bar trend
- **Transactions** — add, edit, delete with undo, search, category filter, date range, sort
- **Budgets** — per-category monthly limits with on-track / running-low / over-budget states
- **Live currency conversion** — 8 currencies via the Frankfurter API, ZAR as the base
- **CSV export** — downloads the currently filtered set
- **Sample data** — seeded on first load so the charts are populated immediately
- Everything persists in localStorage

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure, dialog modal |
| CSS3 | Custom properties, grid layouts, responsive design |
| Vanilla JS (ES Modules) | State, rendering, aggregation |
| Canvas API | Donut + bar charts drawn from scratch |
| Frankfurter API | Live exchange rates (free, no key) |
| localStorage | Expenses, budgets, currency, rate cache |
| Vitest + jsdom | 28 unit tests |

---

## Getting Started

Open `index.html` via Live Server in VS Code (right-click → Open with Live Server). Live Server is needed so the exchange-rate API call works over HTTP.

### Run tests

```bash
npm install
npm test
```

---

## File Structure

```
project-04-expense-tracker/
├── js/
│   ├── config.js    ← categories, currencies, conversion helpers
│   ├── storage.js   ← expense + budget CRUD, sample seeding
│   ├── filters.js   ← pure aggregation (sum by category/month, filter, sort)
│   ├── rates.js     ← exchange-rate fetching + caching
│   ├── charts.js    ← Canvas donut + bar charts
│   ├── render.js    ← DOM rendering per tab
│   └── app.js       ← events, state, orchestration
├── tests/
│   ├── filters.test.js
│   └── currency.test.js
├── index.html
├── style.css
├── package.json
└── README.md
```

---

## How Currency Conversion Works

All expenses are **stored in ZAR** (the base currency). Switching currency never changes the stored data — it only changes how amounts are displayed:

- `convert(zar)` multiplies a stored ZAR amount by the active rate for display
- `toZAR(amount)` runs the reverse, so when you add or edit an expense in USD it's converted back to ZAR before saving
- Rates are fetched once and cached for an hour; if the API is unreachable, the app falls back to ZAR rather than showing wrong figures

---

## What I Learned

- **Canvas API** — `devicePixelRatio` scaling for sharp HiDPI rendering, `requestAnimationFrame` with easing, gradient fills, rounded-rect and arc paths
- **One base currency** — storing data in a single unit and converting only at display time avoids data corruption
- **API caching with TTL** — timestamped localStorage entries that expire
- **CSV generation** — building a `Blob` and triggering a download with an object URL, no library
- **Tab navigation** — show/hide panes while keeping data persistent
- **A reusable modal** — one form for both add and edit, populated via JS
- **`[hidden] { display: none !important }`** — why the HTML `hidden` attribute can be overridden by CSS `display` and how to lock it

---

## Author

**Semeshan** — [GitHub](https://github.com/Somz007)
