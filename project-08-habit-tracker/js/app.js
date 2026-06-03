import { getHabits, addHabit, deleteHabit, toggleLog, renameHabit } from './storage.js';
import { getStreak, getLongestStreak, getHeatmapData, toDateStr } from './streak.js';
import { renderCard } from './render.js';

const list       = document.getElementById('habits-list');
const addBtn     = document.getElementById('add-btn');
const form       = document.getElementById('add-form');
const input      = document.getElementById('habit-input');
const cancelBtn  = document.getElementById('cancel-btn');
const emptyState = document.getElementById('empty-state');
const themeBtn   = document.getElementById('theme-toggle');

// ── Theme ──────────────────────────────────────────────────────

const savedTheme = localStorage.getItem('habit-theme') ?? 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('habit-theme', next);
});

// ── Render ─────────────────────────────────────────────────────

function renderAll() {
  const habits = getHabits();
  const today = toDateStr();
  emptyState.hidden = habits.length > 0;
  list.innerHTML = habits.map(h => renderCard({
    habit:       h,
    streak:      getStreak(h.log),
    longest:     getLongestStreak(h.log),
    heatmapData: getHeatmapData(h.log),
    todayDone:   !!h.log[today],
  })).join('');
}

// ── Add form ───────────────────────────────────────────────────

function openForm() {
  addBtn.hidden = true;
  form.hidden = false;
  input.focus();
}

function closeForm() {
  form.hidden = true;
  addBtn.hidden = false;
  input.value = '';
}

addBtn.addEventListener('click', openForm);
cancelBtn.addEventListener('click', closeForm);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !form.hidden) closeForm();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return;

  const duplicate = getHabits().some(h => h.name.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    input.setCustomValidity('A habit with this name already exists.');
    input.reportValidity();
    input.setCustomValidity('');
    return;
  }

  addHabit(name);
  closeForm();
  renderAll();
});

// ── Delegation ─────────────────────────────────────────────────

list.addEventListener('click', (e) => {
  const card = e.target.closest('.habit-card');
  if (!card) return;
  const { id } = card.dataset;

  if (e.target.closest('.delete-btn')) {
    if (confirm('Delete this habit and all its history?')) {
      deleteHabit(id);
      renderAll();
    }
    return;
  }

  if (e.target.closest('.checkin-btn')) {
    toggleLog(id, toDateStr());
    renderAll();
    return;
  }

  // heatmap cell click — toggle that day (past only, future = no-op)
  const cell = e.target.closest('.hm-cell');
  if (cell && !cell.classList.contains('future')) {
    const date = cell.dataset.date;
    if (date) { toggleLog(id, date); renderAll(); }
    return;
  }

  // edit button — swap name to an inline input
  if (e.target.closest('.edit-btn')) {
    const nameEl = card.querySelector('.habit-name');
    const original = nameEl.textContent;

    const inputEl = document.createElement('input');
    inputEl.type      = 'text';
    inputEl.value     = original;
    inputEl.className = 'name-edit-input';
    inputEl.maxLength = 60;
    nameEl.replaceWith(inputEl);
    inputEl.focus();
    inputEl.select();

    const commit = () => {
      const newName = inputEl.value.trim();
      if (newName && newName !== original) renameHabit(id, newName);
      renderAll();
    };

    inputEl.addEventListener('keydown', ev => {
      if (ev.key === 'Enter')  { ev.preventDefault(); commit(); }
      if (ev.key === 'Escape') renderAll(); // cancel without saving
    });
    inputEl.addEventListener('blur', commit);
  }
});

// ── Init ───────────────────────────────────────────────────────

renderAll();
