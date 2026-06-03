# Project 03 — Quiz App

A fast-paced trivia quiz with live questions pulled from the web, three difficulty levels, lifelines, sound effects, and per-category high scores.

Built as Project 3 of my JavaScript portfolio.

---

## Features

- **8 categories** — General Knowledge, Computers & Tech, Science, Maths, Video Games, Film & TV, Music, Sports
- **Live questions** — fetched fresh from the [Open Trivia Database](https://opentdb.com/) each game, so no two rounds are the same
- **3 difficulties** — Easy / Medium / Hard, each with its own timer length, score multiplier, and accent colour
- **Countdown timer** — animated bar that shifts amber then red as time runs low, with tick sounds in the final seconds
- **Scoring** — base points + time bonus + streak bonus
- **Lifelines** — 50:50 (removes two wrong answers) and Skip (one per game)
- **Sound effects** — Web Audio API tones for correct, wrong, tick, and countdown (toggleable)
- **Progress dots** — a running green/red/skipped history across the top
- **Question review** — see every question and the correct answers at the end
- **Share score** — copies a formatted summary to the clipboard
- **High scores** — saved per category + difficulty combo
- **Keyboard controls** — `1`–`4` to answer, `Enter`/`Space` to continue, `Escape` to go back

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Single mount point, screens rendered by JS |
| CSS3 | Custom properties, animations, per-difficulty theming |
| Vanilla JS (ES Modules) | State machine, rendering, scoring |
| Open Trivia DB API | Live trivia questions (free, no key) |
| Web Audio API | Sound effects generated in code (no audio files) |
| localStorage | High score persistence, sound preference |
| Vitest + jsdom | 12 unit tests for the scoring logic |

---

## Getting Started

Open `index.html` via Live Server in VS Code (right-click → Open with Live Server). Live Server is needed so the question API call works over HTTP.

### Run tests

```bash
npm install
npm test
```

---

## File Structure

```
project-03-quiz-app/
├── js/
│   ├── config.js    ← categories, difficulties, questions-per-game
│   ├── api.js       ← OpenTDB fetching + HTML decoding + shuffling
│   ├── audio.js     ← Web Audio sound effects
│   ├── state.js     ← game state object
│   ├── timer.js     ← setInterval wrapper + Promise delay
│   ├── score.js     ← scoring + high score storage
│   ├── screens.js   ← HTML template per screen
│   └── app.js       ← state transitions, events, keyboard
├── tests/
│   └── score.test.js
├── index.html
├── style.css
├── package.json
└── README.md
```

---

## How the State Machine Works

The whole app lives in one of five screens, tracked by `state.screen`:

```
start → loading → countdown → question → results
```

Each transition is an explicit function (`showStart`, `startGame`, `showCountdown`, `showQuestion`, `showResults`) that renders a full screen into `#app`. There's no showing/hiding of individual elements — the active screen owns the DOM. This keeps the flow easy to follow and impossible to land in an in-between state.

---

## What I Learned

- **State machine pattern** — modelling an app as a set of named states with explicit transitions
- **Live API integration** — fetching, decoding HTML entities, and shuffling answer options
- **Web Audio API** — generating tones with oscillators and gain envelopes, no audio files
- **CSS-driven timer** — animating a width transition instead of redrawing every frame in JS
- **`requestAnimationFrame`** — the score count-up animation with an ease-out curve
- **Per-key high scores** — namespacing localStorage keys by category + difficulty
- **Clipboard API** — copying a formatted score summary to share

---

## Author

**Semeshan** — [GitHub](https://github.com/Somz007)
