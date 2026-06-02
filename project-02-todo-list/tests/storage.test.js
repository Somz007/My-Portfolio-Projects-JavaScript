import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTasks, addTask, toggleTask, toggleAll,
  deleteTask, restoreTask, updateTask,
  clearCompleted, reorderTasks,
} from '../js/storage.js';

beforeEach(() => localStorage.clear());

describe('getTasks', () => {
  it('returns empty array when nothing is stored', () => {
    expect(getTasks()).toEqual([]);
  });
});

describe('addTask', () => {
  it('adds a task and returns it', () => {
    const task = addTask('Buy milk');
    expect(task.text).toBe('Buy milk');
    expect(task.completed).toBe(false);
    expect(task.dueDate).toBeNull();
    expect(task.id).toBeTruthy();
  });

  it('stores a due date when provided', () => {
    const task = addTask('Meeting', '2026-07-01');
    expect(task.dueDate).toBe('2026-07-01');
  });

  it('trims whitespace', () => {
    expect(addTask('  Buy milk  ').text).toBe('Buy milk');
  });

  it('adds newest tasks at the top', () => {
    addTask('First');
    addTask('Second');
    expect(getTasks()[0].text).toBe('Second');
  });

  it('persists to localStorage', () => {
    addTask('Buy milk');
    expect(getTasks()).toHaveLength(1);
  });
});

describe('toggleTask', () => {
  it('marks an incomplete task as complete', () => {
    const task = addTask('Exercise');
    toggleTask(task.id);
    expect(getTasks()[0].completed).toBe(true);
  });

  it('toggles back to incomplete', () => {
    const task = addTask('Exercise');
    toggleTask(task.id);
    toggleTask(task.id);
    expect(getTasks()[0].completed).toBe(false);
  });
});

describe('toggleAll', () => {
  it('marks all tasks complete when some are incomplete', () => {
    addTask('A'); addTask('B');
    toggleAll();
    expect(getTasks().every(t => t.completed)).toBe(true);
  });

  it('unchecks all when all are complete', () => {
    addTask('A'); addTask('B');
    toggleAll(); // all complete
    toggleAll(); // all incomplete
    expect(getTasks().every(t => !t.completed)).toBe(true);
  });
});

describe('deleteTask', () => {
  it('removes the task', () => {
    const task = addTask('Delete me');
    deleteTask(task.id);
    expect(getTasks()).toHaveLength(0);
  });

  it('leaves other tasks untouched', () => {
    addTask('Keep me');
    const gone = addTask('Delete me');
    deleteTask(gone.id);
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].text).toBe('Keep me');
  });
});

describe('restoreTask', () => {
  it('re-inserts a deleted task', () => {
    const task = addTask('Restore me');
    deleteTask(task.id);
    restoreTask(task);
    expect(getTasks()[0].text).toBe('Restore me');
  });
});

describe('updateTask', () => {
  it('updates text', () => {
    const task = addTask('Old');
    updateTask(task.id, 'New');
    expect(getTasks()[0].text).toBe('New');
  });

  it('updates due date when provided', () => {
    const task = addTask('Task');
    updateTask(task.id, 'Task', '2026-08-01');
    expect(getTasks()[0].dueDate).toBe('2026-08-01');
  });

  it('clears due date when passed empty string', () => {
    const task = addTask('Task', '2026-08-01');
    updateTask(task.id, 'Task', '');
    expect(getTasks()[0].dueDate).toBeNull();
  });

  it('does not touch due date when not passed', () => {
    const task = addTask('Task', '2026-08-01');
    updateTask(task.id, 'New text');
    expect(getTasks()[0].dueDate).toBe('2026-08-01');
  });

  it('ignores empty text updates', () => {
    const task = addTask('Keep this');
    updateTask(task.id, '   ');
    expect(getTasks()[0].text).toBe('Keep this');
  });
});

describe('clearCompleted', () => {
  it('removes all completed tasks', () => {
    const a = addTask('Done');
    addTask('Not done');
    toggleTask(a.id);
    clearCompleted();
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].text).toBe('Not done');
  });

  it('does nothing when no tasks are completed', () => {
    addTask('Active');
    clearCompleted();
    expect(getTasks()).toHaveLength(1);
  });
});

describe('reorderTasks', () => {
  it('moves a task to a new position', () => {
    const a = addTask('A');
    const b = addTask('B');
    const c = addTask('C');
    // stored as [C, B, A] (newest first)
    reorderTasks(c.id, a.id); // move C to position of A → [B, A, C] or similar
    const texts = getTasks().map(t => t.text);
    // all three tasks still exist
    expect(texts).toContain('A');
    expect(texts).toContain('B');
    expect(texts).toContain('C');
    // C is no longer at index 0 (it was moved away from the top)
    expect(texts[0]).not.toBe('C');
  });

  it('does not change anything when moving to the same position', () => {
    const a = addTask('A');
    const before = getTasks().map(t => t.id).join();
    reorderTasks(a.id, a.id);
    expect(getTasks().map(t => t.id).join()).toBe(before);
  });
});
