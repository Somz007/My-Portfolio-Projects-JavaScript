// game.js — pure game logic, no DOM. All functions are testable in isolation.

export const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

export function createBoard() {
  return Array(9).fill(null);
}

export function getWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

// returns the three-cell indices of the winning line, or null
export function getWinLine(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

export function isDraw(board) {
  return board.every(cell => cell !== null) && !getWinner(board);
}

// minimax with alpha-beta pruning.
// scores: +10 for AI win (minus depth so it prefers faster wins),
//         -10 for human win (plus depth so it delays losses as long as possible),
//          0 for draw.
function minimax(board, aiSym, humanSym, isMaximizing, alpha, beta, depth) {
  const winner = getWinner(board);
  if (winner === aiSym)    return 10 - depth;
  if (winner === humanSym) return depth - 10;
  if (board.every(c => c !== null)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = aiSym;
        best = Math.max(best, minimax(board, aiSym, humanSym, false, alpha, beta, depth + 1));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break; // prune
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = humanSym;
        best = Math.min(best, minimax(board, aiSym, humanSym, true, alpha, beta, depth + 1));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break; // prune
      }
    }
    return best;
  }
}

// returns the index of the best move for the AI
export function getBestMove(board, aiSym, humanSym) {
  let bestScore = -Infinity;
  let bestMove  = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = aiSym;
      const score = minimax(board, aiSym, humanSym, false, -Infinity, Infinity, 0);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove  = i;
      }
    }
  }
  return bestMove;
}

// picks a random empty cell — used for easy difficulty
export function getRandomMove(board) {
  const empty = board.reduce((acc, c, i) => { if (!c) acc.push(i); return acc; }, []);
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : -1;
}
