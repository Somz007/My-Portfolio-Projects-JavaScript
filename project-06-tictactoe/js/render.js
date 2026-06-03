// render.js — all DOM writes live here so app.js stays declarative

const boardEl    = document.getElementById('board');
const statusEl   = document.getElementById('status');
const scoreXEl   = document.getElementById('score-x');
const scoreDrawEl = document.getElementById('score-draws');
const scoreOEl   = document.getElementById('score-o');
const labelXEl   = document.getElementById('label-x');
const labelOEl   = document.getElementById('label-o');

// redraws all 9 cells; attaches fresh click listeners each time
export function renderBoard(board, winLine, onClick, disabled) {
  boardEl.innerHTML = '';
  board.forEach((cell, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cell';
    if (cell) btn.classList.add(cell.toLowerCase()); // 'x' or 'o' for color
    if (winLine?.includes(i)) btn.classList.add('win');
    btn.textContent = cell ?? '';
    btn.disabled = disabled || !!cell;
    btn.setAttribute('aria-label',
      cell ? `${cell} at position ${i + 1}` : `Empty cell ${i + 1}`);
    btn.addEventListener('click', () => onClick(i));
    boardEl.appendChild(btn);
  });
}

// 'type' drives color: 'win' = gold, 'draw' = muted, '' = default
export function renderStatus(msg, type = '') {
  statusEl.textContent  = msg;
  statusEl.dataset.type = type;
}

// X/O labels adapt: in AI mode one side is "You", the other "AI"
export function renderScores(scores, mode, humanSym) {
  scoreXEl.textContent    = scores.x;
  scoreDrawEl.textContent = scores.draws;
  scoreOEl.textContent    = scores.o;

  if (mode === 'ai') {
    labelXEl.textContent = humanSym === 'X' ? 'You' : 'AI';
    labelOEl.textContent = humanSym === 'O' ? 'You' : 'AI';
  } else {
    labelXEl.textContent = 'X';
    labelOEl.textContent = 'O';
  }
}
