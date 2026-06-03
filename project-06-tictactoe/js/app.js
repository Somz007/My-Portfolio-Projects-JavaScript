import { createBoard, getWinner, getWinLine, isDraw, getBestMove } from './game.js';
import { renderBoard, renderStatus, renderScores } from './render.js';

const STORAGE_SCORES = 'ttt-scores';
const STORAGE_THEME  = 'ttt-theme';
const AI_DELAY_MS    = 400; // feels more natural than instant

// ── State ──────────────────────────────────────────────────────

const state = {
  board:    createBoard(),
  mode:     'ai',    // 'ai' | 'human'
  humanSym: 'X',
  aiSym:    'O',
  current:  'X',     // X always goes first
  gameOver: false,
  thinking: false,   // true while AI's setTimeout is in flight
  scores:   loadScores(),
};

function loadScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SCORES)) || { x: 0, draws: 0, o: 0 };
  } catch {
    return { x: 0, draws: 0, o: 0 };
  }
}

function saveScores() {
  localStorage.setItem(STORAGE_SCORES, JSON.stringify(state.scores));
}

// ── Game loop ──────────────────────────────────────────────────

function startGame() {
  state.board    = createBoard();
  state.current  = 'X';   // X always opens
  state.gameOver = false;
  state.thinking = false;

  const aiFirst = state.mode === 'ai' && state.aiSym === 'X';

  renderScores(state.scores, state.mode, state.humanSym);
  renderBoard(state.board, null, handleClick, aiFirst);

  if (aiFirst) {
    renderStatus('AI is thinking…');
    state.thinking = true;
    setTimeout(aiMove, AI_DELAY_MS);
  } else {
    const whose = state.mode === 'ai' ? 'Your' : "X's";
    renderStatus(`${whose} turn`);
  }
}

function handleClick(i) {
  if (state.gameOver || state.thinking || state.board[i]) return;
  // in AI mode, ignore clicks when it's the AI's turn
  if (state.mode === 'ai' && state.current !== state.humanSym) return;
  placeMove(i);
}

function placeMove(i) {
  state.board[i] = state.current;

  const winner  = getWinner(state.board);
  const winLine = getWinLine(state.board);
  const draw    = isDraw(state.board);

  if (winner) {
    state.gameOver = true;
    state.scores[winner.toLowerCase()]++;
    saveScores();
    renderBoard(state.board, winLine, handleClick, true);
    renderScores(state.scores, state.mode, state.humanSym);
    if (state.mode === 'ai') {
      renderStatus(winner === state.humanSym ? 'You win!' : 'AI wins!', 'win');
    } else {
      renderStatus(`${winner} wins!`, 'win');
    }
    return;
  }

  if (draw) {
    state.gameOver = true;
    state.scores.draws++;
    saveScores();
    renderBoard(state.board, null, handleClick, true);
    renderScores(state.scores, state.mode, state.humanSym);
    renderStatus("It's a draw!", 'draw');
    return;
  }

  state.current = state.current === 'X' ? 'O' : 'X';

  if (state.mode === 'ai' && state.current === state.aiSym) {
    // lock the board so the human can't click while AI "thinks"
    renderBoard(state.board, null, handleClick, true);
    renderStatus('AI is thinking…');
    state.thinking = true;
    setTimeout(aiMove, AI_DELAY_MS);
  } else {
    renderBoard(state.board, null, handleClick, false);
    const whose = state.mode === 'ai' ? 'Your' : `${state.current}'s`;
    renderStatus(`${whose} turn`);
  }
}

function aiMove() {
  state.thinking = false;
  const move = getBestMove(state.board, state.aiSym, state.humanSym);
  if (move !== -1) placeMove(move);
}

// ── Controls ───────────────────────────────────────────────────

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.dataset.mode;

    const sidePicker = document.getElementById('side-picker');
    sidePicker.hidden = state.mode === 'human';

    // in human mode the AI/human distinction doesn't apply
    if (state.mode === 'human') {
      state.humanSym = 'X';
      state.aiSym    = 'O';
    }

    startGame();
  });
});

document.querySelectorAll('.side-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.humanSym = btn.dataset.side;
    state.aiSym    = btn.dataset.side === 'X' ? 'O' : 'X';
    startGame();
  });
});

document.getElementById('new-game').addEventListener('click', startGame);

document.getElementById('reset-scores').addEventListener('click', () => {
  state.scores = { x: 0, draws: 0, o: 0 };
  saveScores();
  renderScores(state.scores, state.mode, state.humanSym);
});

// ── Theme ──────────────────────────────────────────────────────

const root        = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  root.dataset.theme       = theme;
  themeToggle.textContent  = theme === 'dark' ? '☀︎' : '☾';
  localStorage.setItem(STORAGE_THEME, theme);
}

themeToggle.addEventListener('click', () => {
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

// ── Init ───────────────────────────────────────────────────────

applyTheme(localStorage.getItem(STORAGE_THEME) || 'dark');
startGame();
