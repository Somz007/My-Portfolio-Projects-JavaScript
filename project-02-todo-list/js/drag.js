// drag.js — HTML5 drag-and-drop reordering for the task list
//
// Works on desktop. Mobile browsers don't support the HTML5 DnD API —
// a pointer-events implementation would be needed for touch support.

import { reorderTasks } from './storage.js';

let draggedId = null;

export function initDrag(listEl, onDrop) {
  listEl.addEventListener('dragstart', e => {
    const li = e.target.closest('.task-item');
    if (!li) return;
    draggedId = li.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    // defer the class so the drag ghost captures the un-dimmed state
    requestAnimationFrame(() => li.classList.add('dragging'));
  });

  listEl.addEventListener('dragend', e => {
    const li = e.target.closest('.task-item');
    if (li) li.classList.remove('dragging');
    clearHighlights(listEl);
    draggedId = null;
  });

  listEl.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const li = e.target.closest('.task-item');
    if (!li || li.dataset.id === draggedId) return;
    clearHighlights(listEl);
    li.classList.add('drag-over');
  });

  listEl.addEventListener('dragleave', e => {
    const li = e.target.closest('.task-item');
    // dragleave fires for child elements too — only clear if leaving the item itself
    if (li && !li.contains(e.relatedTarget)) {
      li.classList.remove('drag-over');
    }
  });

  listEl.addEventListener('drop', e => {
    e.preventDefault();
    const li = e.target.closest('.task-item');
    if (!li || !draggedId || li.dataset.id === draggedId) return;
    li.classList.remove('drag-over');
    reorderTasks(draggedId, li.dataset.id);
    onDrop();
  });
}

function clearHighlights(listEl) {
  listEl.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}
