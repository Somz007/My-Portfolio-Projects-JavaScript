import { createBoard } from './board.js';

const KEY = 'kanban-board-v1';

export function loadBoard() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return raw ?? createBoard();
  } catch {
    return createBoard();
  }
}

export function saveBoard(board) {
  localStorage.setItem(KEY, JSON.stringify(board));
}
