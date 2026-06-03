// build.mjs — copies all 10 projects into dist/ (no node_modules or test files)
// and generates a root index.html landing page.
// Run automatically via `npm run predeploy` before `npm run deploy`.

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

// files/dirs excluded from every project folder
const SKIP = new Set([
  'node_modules', 'package-lock.json',
  'tests', 'vitest.config.js',
  'config.js',   // API keys — never deploy
  '.gitignore',
]);

// project metadata for the landing page
const META = {
  'project-01-weather-app':   { num: '01', title: 'Weather App',      desc: 'Real-time weather for any city using the OpenWeather API, async/await, and a glassmorphism card.',          note: '⚠️ Requires a free API key — see README' },
  'project-02-todo-list':     { num: '02', title: 'To-Do List',       desc: 'Keyboard-friendly task manager with filtering, drag-to-reorder, inline editing, and localStorage.' },
  'project-03-quiz-app':      { num: '03', title: 'Quiz App',         desc: 'Trivia quiz with three difficulty levels, lifelines, sound effects, and per-category high scores.' },
  'project-04-expense-tracker':{ num: '04', title: 'Expense Tracker', desc: 'Finance dashboard with hand-drawn Canvas charts, budget alerts, CSV export, and live currency rates.' },
  'project-05-markdown-editor':{ num: '05', title: 'Markdown Editor', desc: 'Split-pane editor with a from-scratch parser, multiple documents, autosave, and .md / .html export.' },
  'project-06-tictactoe':     { num: '06', title: 'Tic-Tac-Toe',     desc: 'Unbeatable minimax AI with alpha-beta pruning, difficulty levels (Easy/Medium/Hard), and sound effects.' },
  'project-07-recipe-finder': { num: '07', title: 'Recipe Finder',   desc: 'Search recipes by name or ingredient via TheMealDB, browse categories, save favourites locally.' },
  'project-08-habit-tracker': { num: '08', title: 'Habit Tracker',   desc: 'Daily check-ins, streak counting, 12-week heatmap, clickable history, and edit habit names inline.' },
  'project-09-snake':         { num: '09', title: 'Snake',           desc: 'Canvas game with a fixed-timestep loop, speed scaling, sound effects, win condition, and mobile d-pad.' },
  'project-10-kanban':        { num: '10', title: 'Kanban Board',    desc: 'Drag-and-drop (Pointer Events, desktop + mobile) with undo delete, empty-state hints, and localStorage.' },
};

// ── Build ──────────────────────────────────────────────────────

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);

// prevents Jekyll from processing the site (required for files starting with _)
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

const projects = Object.keys(META).sort();

for (const name of projects) {
  const src  = path.join(ROOT, name);
  const dest = path.join(DIST, name);
  if (fs.existsSync(src)) {
    copyDir(src, dest);
    console.log(`  ✓ ${name}`);
  } else {
    console.warn(`  ✗ ${name} — directory not found, skipped`);
  }
}

fs.writeFileSync(path.join(DIST, 'index.html'), buildIndex(projects));

console.log(`\nBuilt ${projects.length} projects → dist/`);
console.log('Run `npm run deploy` to push to GitHub Pages.\n');

// ── Helpers ────────────────────────────────────────────────────

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

function buildIndex(names) {
  const BASE = 'https://Somz007.github.io/My-Portfolio-Projects-JavaScript';

  const cards = names.map(name => {
    const { num, title, desc, note } = META[name] ?? { num: '??', title: name, desc: '' };
    const noteHtml = note ? `<p class="card-note">${note}</p>` : '';
    return `
      <a class="card" href="${BASE}/${name}/" target="_blank" rel="noopener">
        <span class="card-num">Project ${num}</span>
        <h2 class="card-title">${title}</h2>
        <p class="card-desc">${desc}</p>
        ${noteHtml}
        <span class="card-cta">Open live demo →</span>
      </a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="10 vanilla JavaScript portfolio projects by Semeshan — built from scratch, no frameworks." />
  <title>JS Portfolio — Semeshan</title>
  <style>
    :root {
      --bg:      #0d1117;
      --surface: #161b22;
      --border:  rgba(255,255,255,0.08);
      --text:    #e6edf3;
      --muted:   rgba(255,255,255,0.48);
      --accent:  #22c55e;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100dvh;
      padding: 2rem 1rem 5rem;
    }

    .container { max-width: 1000px; margin: 0 auto; }

    /* header */
    header { text-align: center; padding: 2.5rem 0 3rem; }

    h1 {
      font-size: clamp(1.8rem, 4vw, 2.6rem);
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 0.6rem;
    }

    .tagline { color: var(--muted); font-size: 0.95rem; line-height: 1.5; }
    .tagline a { color: var(--accent); text-decoration: none; }

    /* grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    /* card */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    }

    .card:hover {
      border-color: var(--accent);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }

    .card-num {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--accent);
    }

    .card-title { font-size: 1.1rem; font-weight: 700; }

    .card-desc {
      font-size: 0.84rem;
      color: var(--muted);
      line-height: 1.55;
      flex: 1;
    }

    .card-note {
      font-size: 0.75rem;
      color: #fbbf24;
    }

    .card-cta {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--accent);
      margin-top: 0.25rem;
    }

    /* footer */
    footer {
      text-align: center;
      margin-top: 4rem;
      color: var(--muted);
      font-size: 0.82rem;
    }

    footer a { color: var(--accent); text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>JavaScript Portfolio</h1>
      <p class="tagline">
        10 projects — vanilla JS, no frameworks, built from scratch<br>
        by <a href="https://github.com/Somz007" target="_blank" rel="noopener">Semeshan</a>
      </p>
    </header>

    <main class="grid">
      ${cards}
    </main>

    <footer>
      <a href="https://github.com/Somz007/My-Portfolio-Projects-JavaScript" target="_blank" rel="noopener">
        View source on GitHub
      </a>
    </footer>
  </div>
</body>
</html>`;
}
