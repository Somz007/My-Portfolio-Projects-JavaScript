// board.js — pure board logic, no DOM. All functions return a new board object.

export function createBoard() {
  return {
    columns: [
      { id: 'todo',        title: 'To Do',       cards: [] },
      { id: 'in-progress', title: 'In Progress',  cards: [] },
      { id: 'done',        title: 'Done',         cards: [] },
    ],
  };
}

export function addCard(board, colId, text) {
  const trimmed = text.trim();
  if (!trimmed) return board;
  return mapCol(board, colId, col => ({
    ...col,
    cards: [...col.cards, { id: Date.now().toString() + Math.random().toString(36).slice(2), text: trimmed }],
  }));
}

export function deleteCard(board, colId, cardId) {
  return mapCol(board, colId, col => ({
    ...col,
    cards: col.cards.filter(c => c.id !== cardId),
  }));
}

export function editCard(board, colId, cardId, text) {
  const trimmed = text.trim();
  if (!trimmed) return board;
  return mapCol(board, colId, col => ({
    ...col,
    cards: col.cards.map(c => c.id !== cardId ? c : { ...c, text: trimmed }),
  }));
}

// moves a card from one column to another (or reorders within the same column)
export function moveCard(board, fromColId, toColId, cardId, toIndex) {
  const card = board.columns.find(c => c.id === fromColId)?.cards.find(c => c.id === cardId);
  if (!card) return board;

  // remove from source
  let b = mapCol(board, fromColId, col => ({
    ...col,
    cards: col.cards.filter(c => c.id !== cardId),
  }));

  // insert into target at toIndex
  b = mapCol(b, toColId, col => {
    const cards = [...col.cards];
    cards.splice(toIndex, 0, card);
    return { ...col, cards };
  });

  return b;
}

export function getStats(board) {
  return Object.fromEntries(board.columns.map(col => [col.id, col.cards.length]));
}

// ── internal helper ────────────────────────────────────────────

function mapCol(board, colId, fn) {
  return {
    ...board,
    columns: board.columns.map(col => col.id === colId ? fn(col) : col),
  };
}
