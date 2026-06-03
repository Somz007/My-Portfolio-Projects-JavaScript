# Project 05 — Markdown Editor

A live, split-pane markdown editor with a **from-scratch parser** (no `marked.js` or any library), multiple documents, autosave, export, and a light/dark theme.

Built as Project 5 of my JavaScript portfolio.

---

## Features

- **Live preview** — type markdown on the left, see rendered HTML on the right, updated on every keystroke
- **Custom markdown parser** — headings, bold/italic/strikethrough, inline code, fenced code blocks, links, images, blockquotes, ordered/unordered lists, horizontal rules, hard line breaks
- **Multiple documents** — sidebar to create, switch, rename, and delete; each autosaves to localStorage
- **Formatting toolbar** — wraps the current selection (bold, italic, code…) or prefixes lines (headings, quotes, lists)
- **Keyboard shortcuts** — `Ctrl/Cmd + B` bold, `+ I` italic, `+ K` link, `+ S` save
- **Export** — download as raw `.md` or a styled standalone `.html` file
- **Draggable split** — resize the editor/preview panes; the ratio is remembered
- **Synced scrolling** — scrolling the editor scrolls the preview to match
- **Light / dark theme** — toggle persists across sessions
- **Live stats** — word count, character count, estimated reading time

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | App shell, editable title, toolbar |
| CSS3 | Two themes via `[data-theme]` + custom properties, flex split-pane |
| Vanilla JS (ES Modules) | Parser, document state, rendering |
| Canvas-free | Everything hand-rolled — no markdown or UI library |
| localStorage | Documents, active doc, theme, split ratio |
| Vitest | 27 unit tests for the parser |

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
project-05-markdown-editor/
├── js/
│   ├── parser.js    ← markdown → HTML (the pure, tested core)
│   ├── storage.js   ← document CRUD, active doc, theme, seeding
│   ├── toolbar.js   ← textarea formatting actions
│   ├── render.js    ← preview, document list, stats
│   └── app.js       ← events, state, split-pane, export, theme
├── tests/
│   └── parser.test.js
├── index.html
├── style.css
├── package.json
└── README.md
```

---

## How the Parser Handles Security

Rendering user text as HTML is the dangerous part of any markdown app — if you're not careful, someone can type `<script>` and it runs. Two rules keep this safe:

1. **Escape content, not markers.** Markdown markers (`#`, `>`, `-`, backticks) are plain ASCII, so block detection runs on the raw text. Any text that becomes *visible content* is run through `escapeHtml()` before it reaches the output, so `<script>` becomes the harmless string `&lt;script&gt;`.
2. **Sanitise URLs.** Links and images only allow `http(s):`, `mailto:`, and relative/anchor URLs. A `[click](javascript:alert(1))` link has its URL replaced with `#`, so it can't run script.

Code spans are handled by **splitting the text on backticks** and only formatting the parts outside them — so `` `**not bold**` `` stays literal without any fragile placeholder hacks.

---

## What I Learned

- **Writing a parser** — line-based block parsing with a separate inline pass, the same pure-function shape that's easy to unit test
- **XSS defence** — escape-then-format, and why URL sanitising matters
- **`textarea` manipulation** — wrapping selections, prefixing lines, and firing synthetic `input` events so the rest of the app reacts
- **Debounced autosave** — saving on a delay instead of on every keystroke
- **Pointer events** — a draggable divider with `setPointerCapture`
- **Synced scrolling** — proportional scroll with a flag to avoid feedback loops
- **Theming** — `[data-theme]` + CSS custom properties for an instant, persisted dark/light switch
- **Blob downloads** — generating `.md` and `.html` files entirely client-side

---

## Author

**Semeshan** — [GitHub](https://github.com/Somz007)
