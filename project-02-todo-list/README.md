# Project 02 — To-Do List

A clean, keyboard-friendly to-do app with persistence, filtering, and inline editing.

Built as Project 2 of my JavaScript portfolio.

🔗 **[Live Demo](https://Somz007.github.io/My-Portfolio-Projects-JavaScript/project-02-todo-list/)**


---

## Features

- Add tasks (Enter key or button)
- Toggle complete with custom animated checkbox
- Delete tasks with animated removal
- Double-click any task to edit it inline
- Filter: All / Active / Completed
- "X left" active task counter
- Clear all completed tasks
- Persists across page refreshes via localStorage

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure, form handling |
| CSS3 | Custom properties, Flexbox, CSS animations |
| Vanilla JS (ES Modules) | CRUD logic, DOM manipulation, event delegation |
| localStorage | Task persistence |
| Vitest + jsdom | Unit tests for all storage functions |

---

## Getting Started

Open `index.html` via Live Server in VS Code (right-click → Open with Live Server).

### Run tests

```bash
npm install
npm test
```

---

## File Structure

```
project-02-todo-list/
├── js/
│   ├── storage.js   ← CRUD operations (add, toggle, delete, update, clear)
│   ├── render.js    ← all DOM updates
│   └── app.js       ← event listeners, state, orchestration
├── tests/
│   └── storage.test.js
├── index.html
├── style.css
├── package.json
└── README.md
```

---

## What I Learned

- **Event delegation** — one listener on a parent handles clicks on all child elements, even ones added dynamically
- **CRUD on arrays** — `find()`, `filter()`, `findIndex()` for real data manipulation
- **Inline editing** — swapping a DOM element for an `<input>` and back
- **`crypto.randomUUID()`** — generating unique IDs without a library
- **Custom CSS checkboxes** — hiding the native input and styling a sibling element
- **CSS animations on removal** — waiting for `animationend` before removing from the DOM
- **jsdom** — running browser APIs (localStorage, DOM) inside Node.js for testing

---

## Author

**Semeshan** — [GitHub](https://github.com/Semeshan)
