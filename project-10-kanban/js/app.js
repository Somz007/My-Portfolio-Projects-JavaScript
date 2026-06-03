import { addCard, deleteCard, editCard, moveCard } from './board.js';
import { loadBoard, saveBoard } from './storage.js';
import { renderBoard } from './render.js';

// ── State ──────────────────────────────────────────────────────
let board = loadBoard();

// ── DOM ────────────────────────────────────────────────────────
const boardEl   = document.getElementById('board');
const themeBtn  = document.getElementById('theme-toggle');
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

// ── Drag and Drop ───────────────────────────────────────────────

let dragging = null; // { cardId, colId }

boardEl.addEventListener('dragstart', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  dragging = { cardId: card.dataset.id, colId: card.dataset.col };
  e.dataTransfer.effectAllowed = 'move';
  // slight delay so the ghost renders before hiding the original
  requestAnimationFrame(() => card.classList.add('dragging'));
});

boardEl.addEventListener('dragend', () => {
  boardEl.querySelectorAll('.card.dragging').forEach(c => c.classList.remove('dragging'));
  boardEl.querySelectorAll('.column.drag-over').forEach(c => c.classList.remove('drag-over'));
  boardEl.querySelectorAll('.drop-line').forEach(el => el.remove());
  dragging = null;
});

boardEl.addEventListener('dragover', e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const col = e.target.closest('.column');
  if (!col) return;

  boardEl.querySelectorAll('.column').forEach(c => c.classList.remove('drag-over'));
  col.classList.add('drag-over');

  // show drop indicator between cards
  boardEl.querySelectorAll('.drop-line').forEach(el => el.remove());
  const cardsEl   = col.querySelector('.cards');
  const visible   = [...cardsEl.querySelectorAll('.card:not(.dragging)')];
  const afterCard = visible.find(c => {
    const r = c.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2;
  });

  const line = document.createElement('div');
  line.className = 'drop-line';
  if (afterCard) cardsEl.insertBefore(line, afterCard);
  else cardsEl.appendChild(line);
});

boardEl.addEventListener('dragleave', e => {
  const col = e.target.closest('.column');
  if (col && !col.contains(e.relatedTarget)) {
    col.classList.remove('drag-over');
    col.querySelectorAll('.drop-line').forEach(el => el.remove());
  }
});

boardEl.addEventListener('drop', e => {
  e.preventDefault();
  if (!dragging) return;

  const col = e.target.closest('.column');
  if (!col) return;

  const toColId  = col.dataset.col;
  const cardsEl  = col.querySelector('.cards');
  const visible  = [...cardsEl.querySelectorAll('.card:not(.dragging)')];
  const afterCard = visible.find(c => {
    const r = c.getBoundingClientRect();
    return e.clientY < r.top + r.height / 2;
  });
  const toIndex = afterCard ? visible.indexOf(afterCard) : visible.length;

  board = moveCard(board, dragging.colId, toColId, dragging.cardId, toIndex);
  saveBoard(board);
  renderAll();
});

// ── Card and column interaction (delegation) ───────────────────

boardEl.addEventListener('click', e => {
  // add card button
  const addBtn = e.target.closest('.add-card-btn');
  if (addBtn) { openAddForm(addBtn.dataset.col); return; }

  // delete card
  const delBtn = e.target.closest('.delete-btn');
  if (delBtn) {
    const card = delBtn.closest('.card');
    board = deleteCard(board, card.dataset.col, card.dataset.id);
    saveBoard(board);
    renderAll();
    return;
  }

  // edit card
  const editBtn = e.target.closest('.edit-btn');
  if (editBtn) {
    const card = editBtn.closest('.card');
    openEditForm(card);
    return;
  }
});

// ── Add card inline form ───────────────────────────────────────

function openAddForm(colId) {
  // remove any existing form first
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
    if (text) {
      board = addCard(board, colId, text);
      saveBoard(board);
      renderAll();
    }
  });

  form.querySelector('.form-cancel-btn').addEventListener('click', () => {
    closeAllForms();
    renderAll();
  });

  form.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { closeAllForms(); renderAll(); }
    // Ctrl+Enter submits without newline
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
