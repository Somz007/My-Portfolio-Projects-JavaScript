// render.js — all DOM writes live here so app.js stays declarative

const boardEl     = document.getElementById('board');
const statusEl    = document.getElementById('status');
const scoreXEl    = document.getElementById('score-x');
const scoreDrawEl = document.getElementById('score-draws');
const scoreOEl    = document.getElementById('score-o');
const labelXEl    = document.getElementById('label-x');
const labelOEl    = document.getElementById('label-o');

// cell-centre coordinates (%) for each win-line pattern
const WIN_COORDS = {
  '0,1,2': [12, 17, 88, 17],
  '3,4,5': [12, 50, 88, 50],
  '6,7,8': [12, 83, 88, 83],
  '0,3,6': [17, 12, 17, 88],
  '1,4,7': [50, 12, 50, 88],
  '2,5,8': [83, 12, 83, 88],
  '0,4,8': [12, 12, 88, 88],
  '2,4,6': [88, 12, 12, 88],
};

function buildWinLineSVG(winLine) {
  if (!winLine) return null;
  const coords = WIN_COORDS[winLine.join(',')];
  if (!coords) return null;
  const [x1, y1, x2, y2] = coords;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'win-line');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1); line.setAttribute('y1', y1);
  line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  svg.appendChild(line);
  return svg;
}

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

  const svg = buildWinLineSVG(winLine);
  if (svg) boardEl.appendChild(svg);
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

// triggers a pop animation on the given score element
export function popScore(el) {
  if (!el) return;
  el.classList.remove('pop');
  void el.offsetWidth; // force reflow so the animation re-fires
  el.classList.add('pop');
}
