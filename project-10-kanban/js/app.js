import { addCard, deleteCard, editCard, moveCard } from './board.js';
import { loadBoard, saveBoard } from './storage.js';
import { renderBoard } from './render.js';

// ── State ──────────────────────────────────────────────────────
let board = loadBoard();

// ── DOM ────────────────────────────────────────────────────────
const boardEl   = document.getElementById('board');
const themeBtn  = document.getElementById('theme-toggle');
const toast     = document.getElementById('toast');
const toastMsg  = document.getElementById('toast-msg');
const toastUndo = document.getElementById('toast-undo');
const root      = document.documentElement;

// ── Theme ──────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('kanban-theme') || 'dark';
root.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('kanban-theme', next);
});

// ── Render ─────────────────────────────────────────────────────
function renderAll() {
  renderBoard(board, boardEl);
}

renderAll();

// ── Undo delete ────────────────────────────────────────────────

let undoTimeout = null;
let undoBoard   = null; // full board snapshot before the delete

function showUndo(text) {
  if (undoTimeout) clearTimeout(undoTimeout);
  const label = text.length > 36 ? text.slice(0, 36) + '…' : text;
  toastMsg.textContent = `"${label}" deleted`;
  toast.hidden = false;
  toast.getBoundingClientRect(); // force reflow so transition fires
  toast.classList.add('visible');
  undoTimeout = setTimeout(hideToast, 4000);
}

function hideToast() {
  toast.classList.remove('visible');
  toast.addEventListener('transitionend', () => { toast.hidden = true; }, { once: true });
  undoBoard = null;
}

toastUndo.addEventListener('click', () => {
  if (!undoBoard) return;
  clearTimeout(undoTimeout);
  board = undoBoard;
  saveBoard(board);
  hideToast();
  renderAll();
});

// ── Pointer-events drag (desktop mouse + mobile touch) ─────────

let ptr     = null;  // active drag: { pointerId, cardId, colId, card, startX, startY, offsetX, offsetY, dragging }
let ghostEl = null;

boardEl.addEventListener('pointerdown', e => {
  if (e.button !== undefined && e.button !== 0) return;
  if (e.target.closest('button, textarea, .card-form, .col-empty')) return;
  const card = e.target.closest('.card');
  if (!card) return;

  const rect = card.getBoundingClientRect();
  ptr = {
    pointerId: e.pointerId,
    cardId:    card.dataset.id,
    colId:     card.dataset.col,
    card,
    startX:    e.clientX,
    startY:    e.clientY,
    offsetX:   e.clientX - rect.left,
    offsetY:   e.clientY - rect.top,
    dragging:  false,
  };
});

document.addEventListener('pointermove', e => {
  if (!ptr || e.pointerId !== ptr.pointerId) return;

  const dist = Math.hypot(e.clientX - ptr.startX, e.clientY - ptr.startY);
  if (!ptr.dragging && dist < 6) return;

  e.preventDefault();

  if (!ptr.dragging) {
    ptr.dragging = true;
    ptr.card.classList.add('dragging');

    const rect = ptr.card.getBoundingClientRect();
    ghostEl = ptr.card.cloneNode(true);
    ghostEl.className = `card card-ghost`;
    ghostEl.style.width  = `${rect.width}px`;
    ghostEl.style.left   = `${e.clientX - ptr.offsetX}px`;
    ghostEl.style.top    = `${e.clientY - ptr.offsetY}px`;
    document.body.appendChild(ghostEl);
  }

  ghostEl.style.left = `${e.clientX - ptr.offsetX}px`;
  ghostEl.style.top  = `${e.clientY - ptr.offsetY}px`;

  updateDropTarget(e.clientX, e.clientY);
}, { passive: false });

document.addEventListener('pointerup', e => {
  if (!ptr || e.pointerId !== ptr.pointerId) return;
  finishDrag(e.clientX, e.clientY);
});

document.addEventListener('pointercancel', e => {
  if (!ptr || e.pointerId !== ptr.pointerId) return;
  cleanup();
  ptr = null;
  renderAll();
});

function updateDropTarget(clientX, clientY) {
  boardEl.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  boardEl.querySelectorAll('.drop-line').forEach(el => el.remove());

  // ghost has pointer-events:none so elementFromPoint sees through it
  const under = document.elementFromPoint(clientX, clientY);
  const col   = under?.closest('.column');
  if (!col) return;

  col.classList.add('drag-over');
  const cardsEl = col.querySelector('.cards');
  const visible = [...cardsEl.querySelectorAll('.card:not(.dragging)')];
  const after   = visible.find(c => clientY < c.getBoundingClientRect().top + c.getBoundingClientRect().height / 2);

  const line = document.createElement('div');
  line.className = 'drop-line';
  if (after) cardsEl.insertBefore(line, after);
  else cardsEl.appendChild(line);
}

function finishDrag(clientX, clientY) {
  if (!ptr) return;

  const { dragging, colId: fromColId, cardId } = ptr;
  cleanup();
  ptr = null;

  if (!dragging) return;

  const under = document.elementFromPoint(clientX, clientY);
  const col   = under?.closest('.column');

  if (col) {
    const toColId  = col.dataset.col;
    const cardsEl  = col.querySelector('.cards');
    // exclude the dragged card from the visible list for correct index calculation
    const visible  = [...cardsEl.querySelectorAll('.card')].filter(c => c.dataset.id !== cardId);
    const after    = visible.find(c => clientY < c.getBoundingClientRect().top + c.getBoundingClientRect().height / 2);
    const toIndex  = after ? visible.indexOf(after) : visible.length;

    board = moveCard(board, fromColId, toColId, cardId, toIndex);
    saveBoard(board);
  }

  renderAll();
}

function cleanup() {
  ghostEl?.remove();
  ghostEl = null;
  ptr?.card.classList.remove('dragging');
  boardEl.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  boardEl.querySelectorAll('.drop-line').forEach(el => el.remove());
}

// ── Card and column interaction (delegation) ───────────────────

boardEl.addEventListener('click', e => {
  const addBtn = e.target.closest('.add-card-btn');
  if (addBtn) { openAddForm(addBtn.dataset.col); return; }

  const delBtn = e.target.closest('.delete-btn');
  if (delBtn) {
    const card     = delBtn.closest('.card');
    const cardText = card.querySelector('.card-text').textContent;
    undoBoard = board;
    board     = deleteCard(board, card.dataset.col, card.dataset.id);
    saveBoard(board);
    renderAll();
    showUndo(cardText);
    return;
  }

  const editBtn = e.target.closest('.edit-btn');
  if (editBtn) {
    openEditForm(editBtn.closest('.card'));
    return;
  }
});

// ── Add card inline form ───────────────────────────────────────

function openAddForm(colId) {
  closeAllForms();

  const cardsEl = boardEl.querySelector(`.cards[data-col="${colId}"]`);
  const form    = document.createElement('form');
  form.className = 'card-form';
  form.innerHTML = `
    <textarea class="card-form-input" placeholder="Card title…" rows="2" maxlength="200"></textarea>
    <div class="card-form-actions">
      <button type="submit" class="form-add-btn">Add</button>
      <button type="button" class="form-cancel-btn">Cancel</button>
    </div>`;

  cardsEl.appendChild(form);
  form.querySelector('textarea').focus();

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const text = form.querySelector('textarea').value.trim();
    if (text) { board = addCard(board, colId, text); saveBoard(board); renderAll(); }
  });

  form.querySelector('.form-cancel-btn').addEventListener('click', () => {
    closeAllForms(); renderAll();
  });

  form.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { closeAllForms(); renderAll(); }
    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) form.dispatchEvent(new Event('submit'));
  });
}

// ── Edit card inline ───────────────────────────────────────────

function openEditForm(cardEl) {
  const textEl  = cardEl.querySelector('.card-text');
  const current = textEl.textContent;
  const colId   = cardEl.dataset.col;
  const cardId  = cardEl.dataset.id;

  const textarea = document.createElement('textarea');
  textarea.className = 'card-edit-input';
  textarea.value     = current;
  textarea.rows      = 2;
  textarea.maxLength = 200;
  textEl.replaceWith(textarea);
  textarea.focus();
  textarea.select();

  const commit = () => {
    const newText = textarea.value.trim();
    if (newText && newText !== current) {
      board = editCard(board, colId, cardId, newText);
      saveBoard(board);
    }
    renderAll();
  };

  textarea.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { renderAll(); return; }
    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); commit(); }
  });
  textarea.addEventListener('blur', commit);
}

// ── Helpers ────────────────────────────────────────────────────

function closeAllForms() {
  boardEl.querySelectorAll('.card-form').forEach(f => f.remove());
}
