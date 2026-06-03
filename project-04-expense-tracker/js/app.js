// app.js — events, state, orchestration

import { getExpenses, addExpense, updateExpense,
         deleteExpense, restoreExpense,
         getBudgets, setBudget, seedIfEmpty }    from './storage.js';
import { renderOverview, renderTransactions,
         renderBudget, populateForm }            from './render.js';
import { drawDonut, drawBars }                   from './charts.js';
import { fetchRates }                            from './rates.js';
import { sumByCategory, sumByMonth, lastNMonths,
         filterExpenses, sortExpenses,
         formatMonth }                           from './filters.js';
import { CATEGORIES, CURRENCIES,
         getCurrencyCode, setCurrency,
         setRate, money, toZAR }                 from './config.js';

// ── App state ──────────────────────────────────────────────────
let activeTab   = 'overview';
let editingId   = null;          // expense ID being edited in the modal
let undoTimeout = null;
let undoExpense = null;

const filterState = {
  category:  'all',
  startDate: '',
  endDate:   '',
  search:    '',
};
let sortState = 'newest';

// ── DOM refs ───────────────────────────────────────────────────
const tabBtns       = document.querySelectorAll('.tab-btn');
const tabPanes      = document.querySelectorAll('.tab-pane');
const overviewPane  = document.getElementById('tab-overview');
const txPane        = document.getElementById('tab-transactions');
const budgetPane    = document.getElementById('tab-budget');
const modal         = document.getElementById('modal');
const modalTitle    = document.getElementById('modal-title');
const modalForm     = document.getElementById('modal-form');
const formSubmitBtn = document.getElementById('form-submit');
const toast         = document.getElementById('toast');
const toastMsg      = document.getElementById('toast-msg');
const toastUndo     = document.getElementById('toast-undo');

// ── Tab switching ──────────────────────────────────────────────
function showTab(tab) {
  activeTab = tab;
  tabBtns.forEach(b  => b.classList.toggle('active', b.dataset.tab === tab));
  tabPanes.forEach(p => p.hidden = p.id !== `tab-${tab}`);
  refresh();
}

// ── Main refresh ───────────────────────────────────────────────
function refresh() {
  const expenses = getExpenses();
  const budgets  = getBudgets();

  if (activeTab === 'overview') {
    renderOverview(overviewPane, expenses);
    drawCharts(expenses);
  }
  if (activeTab === 'transactions') {
    renderTransactions(txPane, expenses, filterState, sortState);
  }
  if (activeTab === 'budget') {
    renderBudget(budgetPane, expenses, budgets);
  }
}

// ── Chart drawing ──────────────────────────────────────────────
function drawCharts(expenses) {
  const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const thisMoExp = expenses.filter(e => e.date.startsWith(thisMonth));
  const byCat     = sumByCategory(thisMoExp);
  const total     = thisMoExp.reduce((s, e) => s + e.amount, 0);

  // donut — category breakdown this month
  const donutCanvas = document.getElementById('donut-canvas');
  const segments    = Object.entries(CATEGORIES)
    .map(([key, cat]) => ({ label: cat.label, value: byCat[key] ?? 0, color: cat.color }))
    .filter(s => s.value > 0);
  drawDonut(donutCanvas, segments, money(total));

  // bar — last 6 months totals
  const barCanvas = document.getElementById('bar-canvas');
  const byMonth   = sumByMonth(expenses);
  const months    = lastNMonths(6);
  const bars      = months.map(m => ({
    label: formatMonth(m).split(' ')[0], // short month name "Jun"
    value: byMonth[m] ?? 0,
  }));
  drawBars(barCanvas, bars, '#3fb950');
}

// ── Modal open / close ─────────────────────────────────────────
function openModal(expense = null) {
  editingId        = expense?.id ?? null;
  modalTitle.textContent = expense ? 'Edit Expense' : 'Add Expense';
  formSubmitBtn.textContent = expense ? 'Save Changes' : 'Add Expense';
  populateForm(modalForm, expense);
  modal.hidden = false;
  document.getElementById('f-amount')?.focus();
}

function closeModal() {
  modal.hidden  = true;
  editingId     = null;
  modalForm.innerHTML = '';
}

// ── Modal form submit ──────────────────────────────────────────
document.getElementById('expense-form').addEventListener('submit', e => {
  e.preventDefault();
  // input is in the active currency — convert back to ZAR for storage
  const entered = parseFloat(modalForm.querySelector('[name="amount"]').value) || 0;
  const data = {
    amount:      toZAR(entered),
    category:    modalForm.querySelector('[name="category"]').value,
    description: modalForm.querySelector('[name="description"]').value,
    date:        modalForm.querySelector('[name="date"]').value,
  };
  if (editingId) updateExpense(editingId, data);
  else           addExpense(data);
  closeModal();
  refresh();
});

// ── Undo delete toast ──────────────────────────────────────────
function showUndo(expense) {
  if (undoTimeout) clearTimeout(undoTimeout);
  undoExpense           = expense;
  toastMsg.textContent  = `"${expense.description}" deleted`;
  toast.hidden          = false;
  toast.getBoundingClientRect();
  toast.classList.add('visible');
  undoTimeout = setTimeout(hideToast, 4000);
}

function hideToast() {
  toast.classList.remove('visible');
  toast.addEventListener('transitionend', () => { toast.hidden = true; }, { once: true });
  undoExpense = null;
}

toastUndo.addEventListener('click', () => {
  if (!undoExpense) return;
  clearTimeout(undoTimeout);
  restoreExpense(undoExpense);
  hideToast();
  refresh();
});

// ── CSV export ─────────────────────────────────────────────────
function exportCSV(expenses) {
  const headers = ['Date', 'Category', 'Description', 'Amount'];
  const rows    = expenses.map(e => [
    e.date,
    CATEGORIES[e.category]?.label ?? e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
  ]);
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Event delegation ───────────────────────────────────────────

// tab navigation
document.querySelector('.tab-nav').addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (btn) showTab(btn.dataset.tab);
});

// header add button
document.getElementById('add-btn').addEventListener('click', () => openModal());

// modal close
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('form-cancel').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

// transactions tab — edit, delete, filters, export
txPane.addEventListener('click', e => {
  const editBtn   = e.target.closest('.edit-btn');
  const deleteBtn = e.target.closest('.delete-btn');
  const exportBtn = e.target.closest('#export-btn');

  if (editBtn) {
    const expense = getExpenses().find(ex => ex.id === editBtn.dataset.id);
    if (expense) openModal(expense);
    return;
  }

  if (deleteBtn) {
    const expense = getExpenses().find(ex => ex.id === deleteBtn.dataset.id);
    if (!expense) return;
    deleteExpense(expense.id);
    refresh();
    showUndo(expense);
    return;
  }

  if (exportBtn) {
    const toExport = sortExpenses(filterExpenses(getExpenses(), filterState), sortState);
    exportCSV(toExport);
  }
});

// filter controls (delegated to the pane)
txPane.addEventListener('input', e => {
  if (e.target.id === 'filter-search') { filterState.search    = e.target.value; refresh(); }
  if (e.target.id === 'filter-start')  { filterState.startDate = e.target.value; refresh(); }
  if (e.target.id === 'filter-end')    { filterState.endDate   = e.target.value; refresh(); }
});

txPane.addEventListener('change', e => {
  if (e.target.id === 'filter-cat')  { filterState.category = e.target.value; refresh(); }
  if (e.target.id === 'filter-sort') { sortState            = e.target.value; refresh(); }
});

// budget tab — inline budget editing
budgetPane.addEventListener('change', e => {
  const input = e.target.closest('.budget-input');
  if (!input) return;
  const val = parseFloat(input.value);
  if (!isNaN(val) && val >= 0) {
    // input is in the active currency — store the budget in ZAR
    setBudget(input.dataset.cat, toZAR(val));
    refresh();
  }
});

// redraw charts on resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (activeTab === 'overview') drawCharts(getExpenses());
  }, 200);
});

// ── Currency selector ──────────────────────────────────────────
const currencySelect = document.getElementById('currency-select');

// rates map (target units per 1 ZAR), populated once rates load
let rateMap = { ZAR: 1 };

// populate dropdown options from CURRENCIES map
Object.entries(CURRENCIES).forEach(([code, { name }]) => {
  const opt   = document.createElement('option');
  opt.value   = code;
  opt.textContent = code;
  opt.title   = name;
  if (code === getCurrencyCode()) opt.selected = true;
  currencySelect.appendChild(opt);
});

// applies the rate for the active currency, then re-renders
function applyRate() {
  setRate(rateMap[getCurrencyCode()] ?? 1);
  refresh();
}

currencySelect.addEventListener('change', () => {
  setCurrency(currencySelect.value);
  applyRate();
});

// ── Load live exchange rates ───────────────────────────────────
async function loadRates() {
  try {
    rateMap = await fetchRates();
    applyRate();
  } catch {
    // offline or API down — fall back to ZAR only, disable other options
    currencySelect.value = 'ZAR';
    setCurrency('ZAR');
    setRate(1);
    refresh();
  }
}

// ── Boot ───────────────────────────────────────────────────────
seedIfEmpty();
showTab('overview');
loadRates();
