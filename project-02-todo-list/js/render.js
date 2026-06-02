// render.js — all DOM updates
// one call to render(tasks, filter) handles everything

import { formatDueDate } from './utils.js';

// DOM refs
const taskListEl    = document.getElementById('task-list');
const emptyStateEl  = document.getElementById('empty-state');
const emptyIconEl   = document.getElementById('empty-icon');
const emptyTextEl   = document.getElementById('empty-text');
const controlsEl    = document.getElementById('controls');
const taskCountEl   = document.getElementById('task-count');
const remainingEl   = document.getElementById('remaining');
const clearBtnEl    = document.getElementById('clear-btn');
const toggleAllEl   = document.getElementById('toggle-all');

// builds one <li> for a task — createElement + textContent for user data (no XSS risk)
export function createTaskEl(task) {
  const li = document.createElement('li');
  li.className    = `task-item${task.completed ? ' completed' : ''}`;
  li.dataset.id   = task.id;
  li.dataset.dueDate = task.dueDate || '';
  li.draggable    = true;
  li.setAttribute('role', 'listitem');

  // drag handle — shows on hover, gives a grab affordance
  const handle = document.createElement('span');
  handle.className       = 'drag-handle';
  handle.setAttribute('aria-hidden', 'true');
  handle.innerHTML = `
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
      <circle cx="2.5" cy="2.5" r="1.5"/><circle cx="7.5" cy="2.5" r="1.5"/>
      <circle cx="2.5" cy="8"   r="1.5"/><circle cx="7.5" cy="8"   r="1.5"/>
      <circle cx="2.5" cy="13.5" r="1.5"/><circle cx="7.5" cy="13.5" r="1.5"/>
    </svg>`;

  // checkbox — opacity:0 instead of display:none so it stays focusable for keyboard nav
  const label = document.createElement('label');
  label.className = 'task-check-wrap';
  label.setAttribute('aria-label', 'Toggle complete');

  const checkbox = document.createElement('input');
  checkbox.type      = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked   = task.completed;

  const customCheck = document.createElement('span');
  customCheck.className = 'custom-check';
  customCheck.innerHTML = `
    <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="1,6 4,9 11,1" stroke="white" stroke-width="1.8"
        stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  label.append(checkbox, customCheck);

  // task body — holds text and optional due date badge side by side
  const body = document.createElement('div');
  body.className = 'task-body';

  const textSpan = document.createElement('span');
  textSpan.className   = 'task-text';
  textSpan.textContent = task.text;

  body.appendChild(textSpan);

  // due date badge if one is set
  const due = formatDueDate(task.dueDate);
  if (due) {
    const badge = document.createElement('span');
    badge.className   = `due-badge ${due.cls}`;
    badge.textContent = due.label;
    body.appendChild(badge);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.type      = 'button';
  deleteBtn.className = 'task-delete';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.textContent = '×';

  li.append(handle, label, body, deleteBtn);
  return li;
}

export function render(tasks, filter) {
  const filtered       = applyFilter(tasks, filter);
  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount    = tasks.length - completedCount;

  // header count
  taskCountEl.textContent = tasks.length === 1 ? '1 task' : `${tasks.length} tasks`;

  // show/hide the controls block (filter + footer)
  controlsEl.hidden = tasks.length === 0;

  if (tasks.length > 0) {
    // toggle-all checkbox: checked = all done, indeterminate = some done
    toggleAllEl.checked       = completedCount === tasks.length;
    toggleAllEl.indeterminate = completedCount > 0 && completedCount < tasks.length;

    remainingEl.textContent = activeCount === 1 ? '1 left' : `${activeCount} left`;
    clearBtnEl.disabled     = completedCount === 0;
  }

  // sync active filter button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  // build task list
  taskListEl.innerHTML = '';

  if (filtered.length === 0) {
    emptyStateEl.hidden = false;
    // different message depending on whether any tasks exist at all
    emptyIconEl.hidden  = tasks.length > 0; // hide icon if filter is just empty, not truly empty
    emptyTextEl.textContent = tasks.length === 0
      ? 'No tasks yet. Add something above.'
      : `No ${filter} tasks.`;
  } else {
    emptyStateEl.hidden = true;
    filtered.forEach(task => taskListEl.appendChild(createTaskEl(task)));
  }
}

function applyFilter(tasks, filter) {
  if (filter === 'active')    return tasks.filter(t => !t.completed);
  if (filter === 'completed') return tasks.filter(t =>  t.completed);
  return tasks;
}
