// app.js — entry point, event listeners, orchestration

import {
  getTasks, addTask, toggleTask, toggleAll,
  deleteTask, restoreTask, updateTask,
  clearCompleted,
} from './storage.js';
import { render } from './render.js';
import { showToast } from './toast.js';
import { initDrag }  from './drag.js';

// filter state — persisted in the URL hash
let filter = location.hash.slice(1) || 'all';
if (!['all', 'active', 'completed'].includes(filter)) filter = 'all';

const taskListEl = document.getElementById('task-list');
const addInput   = document.getElementById('add-input');

function refresh() {
  render(getTasks(), filter);
}

// ── Filter helpers ─────────────────────────────────────────────
function setFilter(newFilter) {
  filter = newFilter;
  history.replaceState(null, '', `#${filter}`);

  // fade out → re-render → fade in
  taskListEl.style.transition = 'opacity 0.15s ease';
  taskListEl.style.opacity    = '0';
  setTimeout(() => {
    refresh();
    taskListEl.style.opacity = '1';
  }, 150);
}

// keep filter in sync if the user hits back/forward
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  if (['all', 'active', 'completed'].includes(h)) {
    filter = h;
    refresh();
  }
});

// ── Add task ───────────────────────────────────────────────────
const addForm      = document.getElementById('add-form');
const dueDateInput = document.getElementById('due-date-input');
const dateToggle   = document.getElementById('add-date-toggle');
const dateRow      = document.getElementById('add-date-row');
const dateClear    = document.getElementById('date-clear');

// show/hide the optional date row
dateToggle.addEventListener('click', () => {
  const open = !dateRow.hidden;
  dateRow.hidden    = open;
  dateToggle.textContent = open ? '+ Add due date' : '− Remove date';
  if (open) dueDateInput.value = '';
});

dateClear.addEventListener('click', () => {
  dueDateInput.value = '';
});

addForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = addInput.value.trim();
  if (!text) return;
  addTask(text, dueDateInput.value || null);
  addInput.value     = '';
  dueDateInput.value = '';
  dateRow.hidden     = true;
  dateToggle.textContent = '+ Add due date';
  refresh();
  addInput.focus();
});

// ── Task list — event delegation ───────────────────────────────
// one listener handles all task interactions, even dynamically added ones

taskListEl.addEventListener('change', e => {
  if (!e.target.matches('.task-checkbox')) return;
  toggleTask(e.target.closest('.task-item').dataset.id);
  refresh();
});

taskListEl.addEventListener('click', e => {
  const deleteBtn = e.target.closest('.task-delete');
  if (!deleteBtn) return;

  const li   = deleteBtn.closest('.task-item');
  const task = getTasks().find(t => t.id === li.dataset.id);
  if (!task) return;

  li.classList.add('removing');
  li.addEventListener('animationend', () => {
    deleteTask(task.id);
    refresh();
    // offer undo for 4 seconds
    showToast(task.text, () => {
      restoreTask(task);
      refresh();
    });
  }, { once: true });
});

// double-click task text → inline edit
taskListEl.addEventListener('dblclick', e => {
  const textSpan = e.target.closest('.task-text');
  if (!textSpan) return;
  startEditing(textSpan.closest('.task-item'));
});

// ── Inline editing ─────────────────────────────────────────────
function startEditing(li) {
  if (li.classList.contains('editing')) return;

  const body         = li.querySelector('.task-body');
  const textSpan     = li.querySelector('.task-text');
  const existingBadge = li.querySelector('.due-badge');
  const originalText = textSpan.textContent;
  const originalDate = li.dataset.dueDate || '';

  const textInput = document.createElement('input');
  textInput.type      = 'text';
  textInput.className = 'edit-input';
  textInput.value     = originalText;

  const dateInput = document.createElement('input');
  dateInput.type      = 'date';
  dateInput.className = 'edit-date-input';
  dateInput.value     = originalDate;
  dateInput.title     = 'Due date (optional)';

  li.classList.add('editing');
  textSpan.replaceWith(textInput);
  if (existingBadge) existingBadge.replaceWith(dateInput);
  else body.appendChild(dateInput);

  textInput.focus();
  textInput.select();

  function save() {
    const newText = textInput.value.trim();
    const newDate = dateInput.value || null;
    if (newText) updateTask(li.dataset.id, newText, newDate);
    refresh();
  }

  function cancel() { refresh(); }

  // blur on either input saves — unless focus moved to the other input
  textInput.addEventListener('blur', e => {
    if (e.relatedTarget === dateInput) return;
    save();
  }, { once: true });

  dateInput.addEventListener('blur', e => {
    if (e.relatedTarget === textInput) return;
    save();
  }, { once: true });

  [textInput, dateInput].forEach(input => {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter')  { save();   }
      if (e.key === 'Escape') { cancel(); }
    });
  });
}

// ── Toggle all ─────────────────────────────────────────────────
document.getElementById('toggle-all').addEventListener('change', () => {
  toggleAll();
  refresh();
});

// ── Filter tabs ────────────────────────────────────────────────
document.getElementById('filter-bar').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  setFilter(btn.dataset.filter);
});

// ── Clear completed ────────────────────────────────────────────
document.getElementById('clear-btn').addEventListener('click', () => {
  clearCompleted();
  refresh();
});

// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  const typing = document.activeElement.matches('input, textarea');

  // n → focus add input (when not already typing)
  if (e.key === 'n' && !typing && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    addInput.focus();
    return;
  }

  // Escape → clear add input if focused
  if (e.key === 'Escape' && document.activeElement === addInput) {
    addInput.value = '';
    addInput.blur();
  }
});

// ── Drag to reorder ────────────────────────────────────────────
initDrag(taskListEl, refresh);

// ── Initial render ─────────────────────────────────────────────
refresh();
