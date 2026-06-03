import { describe, it, expect } from 'vitest';
import {
  createBoard, getWinner, getWinLine, isDraw,
  getBestMove, getRandomMove, WIN_LINES,
} from '../js/game.js';

// ── Board ──────────────────────────────────────────────────────

describe('createBoard', () => {
  it('returns 9 nulls', () => {
    expect(createBoard()).toEqual(Array(9).fill(null));
  });
});

// ── getWinner ──────────────────────────────────────────────────

describe('getWinner', () => {
  it('detects a top-row win for X', () => {
    const b = ['X','X','X', null,null,null, null,null,null];
    expect(getWinner(b)).toBe('X');
  });

  it('detects a column win for O', () => {
    const b = ['O',null,null, 'O',null,null, 'O',null,null];
    expect(getWinner(b)).toBe('O');
  });

  it('detects a main-diagonal win for X', () => {
    const b = ['X',null,null, null,'X',null, null,null,'X'];
    expect(getWinner(b)).toBe('X');
  });

  it('detects an anti-diagonal win for O', () => {
    const b = [null,null,'O', null,'O',null, 'O',null,null];
    expect(getWinner(b)).toBe('O');
  });

  it('returns null on an empty board', () => {
    expect(getWinner(createBoard())).toBeNull();
  });

  it('returns null on a draw board', () => {
    // X O X / X O O / O X X — no winner
    const b = ['X','O','X', 'X','O','O', 'O','X','X'];
    expect(getWinner(b)).toBeNull();
  });
});

// ── getWinLine ─────────────────────────────────────────────────

describe('getWinLine', () => {
  it('returns the winning indices for a row', () => {
    const b = ['X','X','X', null,null,null, null,null,null];
    expect(getWinLine(b)).toEqual([0, 1, 2]);
  });

  it('returns the winning indices for a diagonal', () => {
    const b = ['O',null,null, null,'O',null, null,null,'O'];
    expect(getWinLine(b)).toEqual([0, 4, 8]);
  });

  it('returns null when no winner', () => {
    expect(getWinLine(createBoard())).toBeNull();
  });
});

// ── isDraw ─────────────────────────────────────────────────────

describe('isDraw', () => {
  it('returns true for a full board with no winner', () => {
    const b = ['X','O','X', 'X','O','O', 'O','X','X'];
    expect(isDraw(b)).toBe(true);
  });

  it('returns false when there is a winner', () => {
    const b = ['X','X','X', 'O','O',null, null,null,null];
    expect(isDraw(b)).toBe(false);
  });

  it('returns false on an empty board', () => {
    expect(isDraw(createBoard())).toBe(false);
  });

  it('returns false on a partially filled board', () => {
    const b = ['X','O',null, null,null,null, null,null,null];
    expect(isDraw(b)).toBe(false);
  });
});

// ── WIN_LINES ──────────────────────────────────────────────────

describe('WIN_LINES', () => {
  it('contains exactly 8 lines', () => {
    expect(WIN_LINES).toHaveLength(8);
  });

  it('each line has exactly 3 unique indices in [0,8]', () => {
    for (const line of WIN_LINES) {
      expect(line).toHaveLength(3);
      const unique = new Set(line);
      expect(unique.size).toBe(3);
      for (const idx of line) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThanOrEqual(8);
      }
    }
  });
});

// ── getBestMove ────────────────────────────────────────────────

describe('getBestMove — AI picks the winning move', () => {
  it('plays the winning move when one is available (row)', () => {
    // X at 0,1 — AI (X) should play 2 to win
    const b = ['X','X',null, 'O','O',null, null,null,null];
    // wait: O also threatens 5, but AI wins faster at 2
    expect(getBestMove(b, 'X', 'O')).toBe(2);
  });

  it('plays the winning move when one is available (column)', () => {
    // X at 0,3 — play 6 to win
    const b = ['X','O',null, 'X',null,null, null,null,null];
    expect(getBestMove(b, 'X', 'O')).toBe(6);
  });
});

describe('getBestMove — AI blocks the human', () => {
  it('blocks a row threat', () => {
    // O at 6,7 threatens 8 — AI (X) must block
    const b = [null,null,null, null,null,null, 'O','O',null];
    expect(getBestMove(b, 'X', 'O')).toBe(8);
  });

  it('blocks a diagonal threat', () => {
    // O at 0,4 threatens 8 — AI (X) must block
    const b = ['O',null,null, null,'O',null, null,null,null];
    expect(getBestMove(b, 'X', 'O')).toBe(8);
  });
});

describe('getBestMove — AI never loses', () => {
  // run a full game: AI vs. a "first available cell" human (hardest to exploit)
  function simulateGame(aiSym, humanSym) {
    const board   = createBoard();
    let current   = 'X';  // X always goes first
    while (!getWinner(board) && !isDraw(board)) {
      if (current === aiSym) {
        const move = getBestMove(board, aiSym, humanSym);
        board[move] = aiSym;
      } else {
        const move = board.findIndex(c => !c);
        board[move] = humanSym;
      }
      current = current === 'X' ? 'O' : 'X';
    }
    return getWinner(board);
  }

  it('AI as X never loses (human goes second)', () => {
    expect(simulateGame('X', 'O')).not.toBe('O');
  });

  it('AI as O never loses (human goes first)', () => {
    expect(simulateGame('O', 'X')).not.toBe('X');
  });
});

// ── getRandomMove ──────────────────────────────────────────────

describe('getRandomMove', () => {
  it('returns an empty cell index', () => {
    const b = ['X','O','X', null,null,null, 'X','O','X'];
    const move = getRandomMove(b);
    expect([3, 4, 5]).toContain(move);
  });

  it('returns the only remaining cell', () => {
    const b = ['X','O','X', 'O','X','O', 'O','X',null];
    expect(getRandomMove(b)).toBe(8);
  });

  it('returns -1 on a full board', () => {
    const b = ['X','O','X', 'O','X','O', 'O','X','O'];
    expect(getRandomMove(b)).toBe(-1);
  });
});
