# Project 07 — Recipe Finder

A recipe search and discovery app powered by the free [TheMealDB API](https://www.themealdb.com/api.php). Search by name, browse by category, view full recipes in a modal, and save favourites locally.

Built as Project 7 of my JavaScript portfolio.

---

## Features

- **Name search** — debounced input (400ms), searches the full TheMealDB catalogue
- **Category browse** — horizontally scrollable chip bar loads all 14+ categories; click to filter
- **Recipe detail modal** — full-resolution photo, ingredient list with measures, step-by-step instructions, YouTube link when available
- **Favourites** — heart button on every card; saved recipes persist in localStorage across sessions
- **Favourites tab** — switch between search results and your saved recipes
- **In-memory cache** — full recipe data cached after first lookup so reopening a modal is instant
- **Lazy image loading** — cards use `loading="lazy"` and the `/preview` (228×228) thumbnail
- **Light / dark theme** — toggle persists across sessions
- **Responsive grid** — `auto-fill minmax(200px, 1fr)`; collapses to 2 columns on mobile with a bottom-sheet modal style

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic shell, ARIA roles, dialog pattern |
| CSS3 | Two themes, card hover effects, modal, spinner |
| Vanilla JS (ES Modules) | API calls, state, rendering, localStorage |
| TheMealDB API | Recipes, categories, thumbnails (free, no key) |
| Vitest + jsdom | 15 unit tests for favourites storage |

---

## Getting Started

Open `index.html` via Live Server in VS Code — the API calls require HTTP.

### Run tests

```bash
npm install
npm test
```

---

## File Structure

```
project-07-recipe-finder/
├── js/
│   ├── api.js      ← TheMealDB fetch calls, in-memory lookup cache
│   ├── storage.js  ← favourites CRUD (localStorage)
│   ├── render.js   ← DOM builders: cards, chips, modal HTML, states
│   └── app.js      ← state, search, category select, modal, tabs, theme
├── tests/
│   └── storage.test.js
├── index.html
├── style.css
├── package.json
├── vitest.config.js
└── README.md
```

---

## API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `search.php?s=query` | Full meal objects for name search |
| `categories.php` | Category list for the chip bar |
| `filter.php?c=category` | Minimal meal objects (id + name + thumb) |
| `lookup.php?i=id` | Full meal object on modal open |

The filter endpoint only returns `idMeal / strMeal / strMealThumb` — full details are fetched lazily on modal open and cached so subsequent opens cost nothing.

---

## What I Learned

- **API shape differences** — search returns full objects; filter returns minimal ones; designing around this lazily (fetch full data only when needed) keeps the category browse fast
- **In-memory cache** — a `Map` keyed by ID means no re-fetch on repeat modal opens, with no complexity overhead
- **Event delegation** — one listener on the grid handles card clicks and fav toggles for any number of dynamic cards; cleaner than attaching per-card listeners
- **Surgical DOM updates** — `updateFavBtn()` updates just the one button that changed, avoiding a full grid re-render that would reset scroll and flicker images
- **Two-layer persistence** — in-memory `mealMap` for the session, localStorage for favourites across sessions
- **Mobile modal** — using `align-items: flex-end` + `border-radius` on small viewports for a bottom-sheet feel

---

## Author

**Semeshan** — [GitHub](https://github.com/Somz007)
