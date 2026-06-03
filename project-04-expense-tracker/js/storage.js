import { DEFAULT_BUDGETS, SAMPLE_EXPENSES } from './config.js';
import { currentMonth } from './filters.js';

const EXPENSE_KEY = 'expenses-data';
const BUDGET_KEY  = 'expenses-budget';
const SEEDED_KEY  = 'expenses-seeded';

// ── Expenses ───────────────────────────────────────────────────

export function getExpenses() {
  try {
    return JSON.parse(localStorage.getItem(EXPENSE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveExpenses(expenses) {
  try {
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
  } catch {
    console.warn('localStorage quota exceeded.');
  }
}

export function addExpense(data) {
  const expense = {
    id:          crypto.randomUUID(),
    amount:      parseFloat(data.amount),
    category:    data.category,
    description: data.description.trim(),
    date:        data.date,
    createdAt:   Date.now(),
  };
  const expenses = getExpenses();
  expenses.unshift(expense);
  saveExpenses(expenses);
  return expense;
}

export function updateExpense(id, data) {
  const expenses = getExpenses();
  const idx      = expenses.findIndex(e => e.id === id);
  if (idx < 0) return;
  expenses[idx] = {
    ...expenses[idx],
    amount:      parseFloat(data.amount),
    category:    data.category,
    description: data.description.trim(),
    date:        data.date,
  };
  saveExpenses(expenses);
}

export function deleteExpense(id) {
  saveExpenses(getExpenses().filter(e => e.id !== id));
}

export function restoreExpense(expense) {
  const expenses = getExpenses();
  expenses.unshift(expense);
  saveExpenses(expenses);
}

// ── Budget ─────────────────────────────────────────────────────

export function getBudgets() {
  try {
    return { ...DEFAULT_BUDGETS, ...JSON.parse(localStorage.getItem(BUDGET_KEY)) };
  } catch {
    return { ...DEFAULT_BUDGETS };
  }
}

export function setBudget(category, amount) {
  const budgets = getBudgets();
  budgets[category] = parseFloat(amount) || 0;
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
}

// ── Sample data seeding ────────────────────────────────────────
// runs once on first load so charts are populated immediately

export function seedIfEmpty() {
  if (localStorage.getItem(SEEDED_KEY)) return;

  const today = new Date();
  const seeded = SAMPLE_EXPENSES.map(s => {
    const d = new Date(today);
    d.setDate(d.getDate() - s.daysAgo);
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      id:          crypto.randomUUID(),
      amount:      s.amount,
      category:    s.category,
      description: s.description,
      date,
      createdAt:   d.getTime(),
    };
  });

  saveExpenses(seeded);
  localStorage.setItem(SEEDED_KEY, '1');
}
