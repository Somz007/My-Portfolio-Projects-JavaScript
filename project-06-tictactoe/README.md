# Project 06 — TicTacToe

A classic Tic-Tac-Toe game with an **unbeatable AI** powered by the minimax algorithm and alpha-beta pruning. You cannot win — best you can do is draw.

Built as Project 6 of my JavaScript portfolio.

---

## Features

- **Unbeatable AI** — minimax with alpha-beta pruning explores the full game tree and always plays the optimal move
- **vs Human mode** — pass-and-play on the same screen, no AI involved
- **Side picker** — choose to play as X or O in AI mode (AI adapts accordingly)
- **AI thinking delay** — 400ms pause so the AI doesn't feel like an instant reflex
- **Win highlight** — the three winning cells are highlighted in gold
- **Pop animation** — each placed piece animates in
- **Score tracking** — wins, draws, and losses persist across sessions via localStorage
- **Score reset** — clear the scores with one button
- **Light / dark theme** — toggle persists across sessions

---

## How the AI Works

TicTacToe has at most 9 moves, which means the entire game tree can be explored in milliseconds. The AI uses **minimax**: it tries every possible move, then every possible response, recursively down to the end of the game. It assigns scores:

- **+10 − depth** if the AI wins (subtracting depth means it prefers *faster* wins)
- **−10 + depth** if the human wins (adding depth means it *delays* losses as long as possible)
- **0** for a draw

The AI always picks the move with the highest score, so it never makes a mistake.

**Alpha-beta pruning** cuts branches of the tree that cannot possibly change the result — in practice this roughly halves the work, and is good algorithmic practice even though the 3×3 board is already trivially fast.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | App shell, ARIA roles for accessibility |
| CSS3 | Two themes via `[data-theme]` + custom properties, pop animation |
| Vanilla JS (ES Modules) | Game logic, minimax, rendering, localStorage |
| Vitest | 25 unit tests for all game logic |

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
project-06-tictactoe/
├── js/
│   ├── game.js    ← pure: board, getWinner, getWinLine, isDraw, minimax, getBestMove
│   ├── render.js  ← board cells, status, scores
│   └── app.js     ← events, game loop, theme, localStorage
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

- **Minimax algorithm** — recursive game-tree search; the key insight is that each player alternates between maximising and minimising the same score
- **Alpha-beta pruning** — cutting branches by tracking the current best score for each player; β ≤ α means the rest of the subtree can't matter
- **Depth in the score** — without it, the AI would consider all winning moves equal and might "waste" moves on a board where it's already won
- **Pure functions first** — all game logic lives in `game.js` with zero DOM references, which made the 25-test suite trivial to write
- **Keeping render stateless** — `renderBoard` tears down and rebuilds every time; simple and impossible to get out of sync

---

## Author

**Semeshan** — [GitHub](https://github.com/Somz007)
