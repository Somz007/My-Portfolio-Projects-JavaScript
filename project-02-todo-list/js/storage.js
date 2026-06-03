// storage.js — CRUD for tasks in localStorage
//
// Task shape: { id, text, completed, dueDate, createdAt }
// dueDate is "YYYY-MM-DD" string or null

const KEY = 'todo-tasks';

export function getTasks() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

function save(tasks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    console.warn('localStorage quota exceeded — task not saved.');
  }
}

export function addTask(text, dueDate = null) {
  const task = {
    id:        crypto.randomUUID(),
    text:      text.trim(),
    completed: false,
    dueDate:   dueDate || null,
    createdAt: Date.now(),
  };
  const tasks = getTasks();
  tasks.unshift(task);
  save(tasks);
  return task;
}

export function toggleTask(id) {
  const tasks = getTasks();
  const task  = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  save(tasks);
}

// if every task is done → uncheck all; otherwise → check all
export function toggleAll() {
  const tasks   = getTasks();
  const allDone = tasks.every(t => t.completed);
  tasks.forEach(t => t.completed = !allDone);
  save(tasks);
}

export function deleteTask(id) {
  save(getTasks().filter(t => t.id !== id));
}

// re-inserts a deleted task at the top (used by undo)
export function restoreTask(task) {
  const tasks = getTasks();
  tasks.unshift(task);
  save(tasks);
}

// dueDate = undefined means "don't touch the existing value"
export function updateTask(id, text, dueDate = undefined) {
  const tasks = getTasks();
  const task  = tasks.find(t => t.id === id);
  if (!task) return;
  if (text.trim()) task.text = text.trim();
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  save(tasks);
}

export function clearCompleted() {
  save(getTasks().filter(t => !t.completed));
}

// moves the task at fromId to the position of toId
export function reorderTasks(fromId, toId) {
  const tasks   = getTasks();
  const fromIdx = tasks.findIndex(t => t.id === fromId);
  const toIdx   = tasks.findIndex(t => t.id === toId);
  if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
  const [moved] = tasks.splice(fromIdx, 1);
  tasks.splice(toIdx, 0, moved);
  save(tasks);
}
