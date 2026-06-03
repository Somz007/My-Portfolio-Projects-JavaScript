import { createBoard, getWinner, getWinLine, isDraw, getBestMove, getRandomMove } from './game.js';
import { renderBoard, renderStatus, renderScores, popScore } from './render.js';
import { playPlace, playWin, playDraw, playLose } from './sound.js';

const STORAGE_SCORES = 'ttt-scores';
const STORAGE_THEME  = 'ttt-theme';
const AI_DELAY_MS    = 400; // feels more natural than instant

// ── State ──────────────────────────────────────────────────────

const state = {
  board:      createBoard(),
  mode:       'ai',    // 'ai' | 'human'
  difficulty: 'hard',  // 'easy' | 'medium' | 'hard'
  humanSym:   'X',
  aiSym:      'O',
  current:    'X',     // X always goes first
  gameOver:   false,
  thinking:   false,   // true while AI's setTimeout is in flight
  scores:     loadScores(),
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
  playPlace();

  const winner  = getWinner(state.board);
  const winLine = getWinLine(state.board);
  const draw    = isDraw(state.board);

  if (winner) {
    state.gameOver = true;
    state.scores[winner.toLowerCase()]++;
    saveScores();
    renderBoard(state.board, winLine, handleClick, true);
    renderScores(state.scores, state.mode, state.humanSym);
    popScore(document.getElementById(`score-${winner.toLowerCase()}`));

    if (state.mode === 'ai') {
      const humanWon = winner === state.humanSym;
      renderStatus(humanWon ? 'You win! 🎉' : 'AI wins!', 'win');
      humanWon ? playWin() : playLose();
    } else {
      renderStatus(`${winner} wins! 🎉`, 'win');
      playWin();
    }
    return;
  }

  if (draw) {
    state.gameOver = true;
    state.scores.draws++;
    saveScores();
    renderBoard(state.board, null, handleClick, true);
    renderScores(state.scores, state.mode, state.humanSym);
    popScore(document.getElementById('score-draws'));
    renderStatus("It's a draw!", 'draw');
    playDraw();
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
  let move;
  if (state.difficulty === 'easy') {
    move = getRandomMove(state.board);
  } else if (state.difficulty === 'medium') {
    // 50/50 between random and optimal — beatable but not trivial
    move = Math.random() < 0.5
      ? getRandomMove(state.board)
      : getBestMove(state.board, state.aiSym, state.humanSym);
  } else {
    move = getBestMove(state.board, state.aiSym, state.humanSym);
  }
  if (move !== -1) placeMove(move);
}

// ── Controls ───────────────────────────────────────────────────

document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.dataset.mode;

    const sidePicker = document.getElementById('side-picker');
    const diffPicker = document.getElementById('diff-picker');
    sidePicker.hidden = state.mode === 'human';
    diffPicker.hidden = state.mode === 'human';

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

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.difficulty = btn.dataset.diff;
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
