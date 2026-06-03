import { describe, it, expect } from 'vitest';
import { createBoard, addCard, deleteCard, editCard, moveCard, getStats } from '../js/board.js';

// ── createBoard ────────────────────────────────────────────────

describe('createBoard', () => {
  it('has 3 columns', () => {
    expect(createBoard().columns).toHaveLength(3);
  });

  it('columns have the correct ids in order', () => {
    const ids = createBoard().columns.map(c => c.id);
    expect(ids).toEqual(['todo', 'in-progress', 'done']);
  });

  it('all columns start with no cards', () => {
    createBoard().columns.forEach(col => expect(col.cards).toHaveLength(0));
  });
});

// ── addCard ────────────────────────────────────────────────────

describe('addCard', () => {
  it('adds a card to the correct column', () => {
    const b = addCard(createBoard(), 'todo', 'Buy milk');
    expect(b.columns[0].cards).toHaveLength(1);
    expect(b.columns[0].cards[0].text).toBe('Buy milk');
  });

  it('generates a non-empty string id', () => {
    const b = addCard(createBoard(), 'todo', 'Task');
    const id = b.columns[0].cards[0].id;
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('trims whitespace from card text', () => {
    const b = addCard(createBoard(), 'todo', '  task  ');
    expect(b.columns[0].cards[0].text).toBe('task');
  });

  it('does not mutate the original board', () => {
    const original = createBoard();
    addCard(original, 'todo', 'Task');
    expect(original.columns[0].cards).toHaveLength(0);
  });

  it('does not affect other columns', () => {
    const b = addCard(createBoard(), 'todo', 'Task');
    expect(b.columns[1].cards).toHaveLength(0);
    expect(b.columns[2].cards).toHaveLength(0);
  });

  it('ignores empty or whitespace-only text', () => {
    const b = addCard(createBoard(), 'todo', '   ');
    expect(b.columns[0].cards).toHaveLength(0);
  });
});

// ── deleteCard ─────────────────────────────────────────────────

describe('deleteCard', () => {
  it('removes the card from its column', () => {
    let b = addCard(createBoard(), 'todo', 'Task A');
    const id = b.columns[0].cards[0].id;
    b = deleteCard(b, 'todo', id);
    expect(b.columns[0].cards).toHaveLength(0);
  });

  it('leaves other cards in the same column untouched', () => {
    let b = addCard(createBoard(), 'todo', 'Task A');
    b = addCard(b, 'todo', 'Task B');
    const idA = b.columns[0].cards[0].id;
    b = deleteCard(b, 'todo', idA);
    expect(b.columns[0].cards).toHaveLength(1);
    expect(b.columns[0].cards[0].text).toBe('Task B');
  });

  it('is a no-op for an unknown card id', () => {
    let b = addCard(createBoard(), 'todo', 'Task A');
    b = deleteCard(b, 'todo', 'does-not-exist');
    expect(b.columns[0].cards).toHaveLength(1);
  });
});

// ── editCard ───────────────────────────────────────────────────

describe('editCard', () => {
  it('updates the card text', () => {
    let b = addCard(createBoard(), 'todo', 'Old text');
    const id = b.columns[0].cards[0].id;
    b = editCard(b, 'todo', id, 'New text');
    expect(b.columns[0].cards[0].text).toBe('New text');
  });

  it('trims the new text', () => {
    let b = addCard(createBoard(), 'todo', 'Old');
    const id = b.columns[0].cards[0].id;
    b = editCard(b, 'todo', id, '  Updated  ');
    expect(b.columns[0].cards[0].text).toBe('Updated');
  });

  it('does not affect other cards', () => {
    let b = addCard(createBoard(), 'todo', 'Card A');
    b = addCard(b, 'todo', 'Card B');
    const idA = b.columns[0].cards[0].id;
    b = editCard(b, 'todo', idA, 'Card A edited');
    expect(b.columns[0].cards[1].text).toBe('Card B');
  });
});

// ── moveCard ───────────────────────────────────────────────────

describe('moveCard', () => {
  it('moves a card to a different column', () => {
    let b = addCard(createBoard(), 'todo', 'Task');
    const id = b.columns[0].cards[0].id;
    b = moveCard(b, 'todo', 'in-progress', id, 0);
    expect(b.columns[0].cards).toHaveLength(0);
    expect(b.columns[1].cards).toHaveLength(1);
    expect(b.columns[1].cards[0].text).toBe('Task');
  });

  it('inserts at the correct index in the target column', () => {
    let b = addCard(createBoard(), 'in-progress', 'First');
    b = addCard(b, 'todo', 'Inserted');
    const id = b.columns[0].cards[0].id;
    b = moveCard(b, 'todo', 'in-progress', id, 0);
    expect(b.columns[1].cards[0].text).toBe('Inserted');
    expect(b.columns[1].cards[1].text).toBe('First');
  });

  it('appends when toIndex equals column length', () => {
    let b = addCard(createBoard(), 'in-progress', 'First');
    b = addCard(b, 'todo', 'Appended');
    const id = b.columns[0].cards[0].id;
    b = moveCard(b, 'todo', 'in-progress', id, 1);
    expect(b.columns[1].cards[1].text).toBe('Appended');
  });

  it('reorders cards within the same column', () => {
    let b = addCard(createBoard(), 'todo', 'First');
    b = addCard(b, 'todo', 'Second');
    const firstId = b.columns[0].cards[0].id;
    b = moveCard(b, 'todo', 'todo', firstId, 1);
    expect(b.columns[0].cards[0].text).toBe('Second');
    expect(b.columns[0].cards[1].text).toBe('First');
  });

  it('is a no-op for an unknown card id', () => {
    const b = createBoard();
    const b2 = moveCard(b, 'todo', 'done', 'nonexistent', 0);
    expect(b2).toEqual(b);
  });
});

// ── getStats ───────────────────────────────────────────────────

describe('getStats', () => {
  it('returns 0 for all columns on an empty board', () => {
    expect(getStats(createBoard())).toEqual({ todo: 0, 'in-progress': 0, done: 0 });
  });

  it('counts correctly after adding and moving cards', () => {
    let b = addCard(createBoard(), 'todo', 'A');
    b = addCard(b, 'todo', 'B');
    b = addCard(b, 'done', 'C');
    expect(getStats(b)).toEqual({ todo: 2, 'in-progress': 0, done: 1 });
  });
});
