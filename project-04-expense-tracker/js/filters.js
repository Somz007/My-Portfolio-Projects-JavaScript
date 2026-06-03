// filters.js — pure aggregation and filtering functions
// no DOM, no storage — all inputs/outputs are plain data

// sum expense amounts grouped by category key
export function sumByCategory(expenses) {
  return expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
}

// sum expense amounts grouped by 'YYYY-MM' month string
export function sumByMonth(expenses) {
  return expenses.reduce((acc, e) => {
    const month = e.date.slice(0, 7);
    acc[month] = (acc[month] ?? 0) + e.amount;
    return acc;
  }, {});
}

// returns the last n months (including current) as 'YYYY-MM' strings, oldest first
export function lastNMonths(n) {
  const months = [];
  const now    = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    );
  }
  return months;
}

// current month as 'YYYY-MM'
export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// previous month as 'YYYY-MM'
export function previousMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// filter expenses by optional category, date range, and search string
export function filterExpenses(expenses, { category = 'all', startDate = '', endDate = '', search = '' } = {}) {
  return expenses.filter(e => {
    if (category !== 'all' && e.category !== category)                         return false;
    if (startDate && e.date < startDate)                                       return false;
    if (endDate   && e.date > endDate)                                         return false;
    if (search    && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

// sort expenses — returns a new array, never mutates
export function sortExpenses(expenses, by = 'newest') {
  const arr = [...expenses];
  if (by === 'newest')  return arr.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  if (by === 'oldest')  return arr.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
  if (by === 'highest') return arr.sort((a, b) => b.amount - a.amount);
  if (by === 'lowest')  return arr.sort((a, b) => a.amount - b.amount);
  return arr;
}

// 1234.5 → "1,234.50"
export function formatAmount(amount) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits:  2,
    maximumFractionDigits:  2,
  });
}

// 'YYYY-MM' → 'Jun 2026'
export function formatMonth(yyyymm) {
  const [y, m] = yyyymm.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year:  'numeric',
  });
}

// 'YYYY-MM-DD' → 'Today' | 'Yesterday' | 'Jun 3, 2026'
export function formatDate(dateStr) {
  const target    = new Date(`${dateStr}T00:00:00`);
  const today     = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  if (target.getTime() === today.getTime())     return 'Today';
  if (target.getTime() === yesterday.getTime()) return 'Yesterday';

  return target.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

// percentage change between two values — returns null if prev is 0
export function pctChange(current, previous) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}
