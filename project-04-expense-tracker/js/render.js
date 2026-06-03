// render.js — DOM rendering for all three tabs

import { CATEGORIES, CURRENCIES, money,
         convert, getCurrencySymbol }                    from './config.js';
import { sumByCategory, sumByMonth, lastNMonths,
         currentMonth, previousMonth, filterExpenses,
         sortExpenses, formatMonth,
         formatDate, pctChange }                         from './filters.js';

// ── Overview tab ───────────────────────────────────────────────
export function renderOverview(container, expenses) {
  const thisMonth = currentMonth();
  const prevMonth = previousMonth();

  const thisExpenses = expenses.filter(e => e.date.startsWith(thisMonth));
  const prevExpenses = expenses.filter(e => e.date.startsWith(prevMonth));

  const thisTotal = thisExpenses.reduce((s, e) => s + e.amount, 0);
  const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
  const change    = pctChange(thisTotal, prevTotal);

  const byCat     = sumByCategory(thisExpenses);
  const topCat    = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];

  const changeHTML = change === null ? '' : `
    <span class="stat-change ${change >= 0 ? 'up' : 'down'}">
      ${change >= 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(0)}% vs last month
    </span>`;

  // category legend for donut
  const legendHTML = Object.entries(CATEGORIES).map(([key, cat]) => {
    const amount = byCat[key] ?? 0;
    if (!amount) return '';
    return `
      <div class="legend-item">
        <span class="legend-dot" style="background:${cat.color}"></span>
        <span class="legend-label">${cat.label}</span>
        <span class="legend-amount">${money(amount)}</span>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="stats-row">
      <div class="stat-card primary">
        <p class="stat-label">This Month</p>
        <p class="stat-value">${money(thisTotal)}</p>
        ${changeHTML}
      </div>
      <div class="stat-card">
        <p class="stat-label">Top Category</p>
        <p class="stat-value">
          ${topCat ? CATEGORIES[topCat[0]]?.icon + ' ' + CATEGORIES[topCat[0]]?.label : '—'}
        </p>
        <span class="stat-sub">
          ${topCat ? money(topCat[1]) : 'No expenses yet'}
        </span>
      </div>
      <div class="stat-card">
        <p class="stat-label">Transactions</p>
        <p class="stat-value">${thisExpenses.length}</p>
        <span class="stat-sub">this month</span>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <h3 class="chart-title">By Category</h3>
        <div class="donut-wrap">
          <canvas class="donut-canvas" id="donut-canvas"></canvas>
        </div>
        <div class="donut-legend">${legendHTML || '<p class="empty-chart">No expenses this month</p>'}</div>
      </div>

      <div class="chart-card bar-card">
        <h3 class="chart-title">Monthly Trend</h3>
        <canvas class="bar-canvas" id="bar-canvas"></canvas>
      </div>
    </div>`;
}

// ── Transactions tab ───────────────────────────────────────────
export function renderTransactions(container, expenses, filters, sort) {
  const filtered = sortExpenses(filterExpenses(expenses, filters), sort);
  const total    = filtered.reduce((s, e) => s + e.amount, 0);

  const catOptions = Object.entries(CATEGORIES)
    .map(([k, c]) => `<option value="${k}" ${filters.category === k ? 'selected' : ''}>${c.icon} ${c.label}</option>`)
    .join('');

  const sortOptions = ['newest', 'oldest', 'highest', 'lowest']
    .map(s => `<option value="${s}" ${sort === s ? 'selected' : ''}>${{ newest:'Newest first', oldest:'Oldest first', highest:'Highest first', lowest:'Lowest first' }[s]}</option>`)
    .join('');

  const listHTML = filtered.length === 0
    ? `<div class="empty-state"><p>No transactions match your filters.</p></div>`
    : filtered.map(e => {
        const cat = CATEGORIES[e.category];
        return `
          <div class="expense-item" data-id="${e.id}">
            <div class="expense-icon" style="background:${cat.color}20;color:${cat.color}">${cat.icon}</div>
            <div class="expense-body">
              <span class="expense-desc">${e.description}</span>
              <span class="expense-meta">${cat.label} · ${formatDate(e.date)}</span>
            </div>
            <div class="expense-amount">−${money(e.amount)}</div>
            <div class="expense-actions">
              <button class="action-btn edit-btn"   data-id="${e.id}" title="Edit">✏️</button>
              <button class="action-btn delete-btn" data-id="${e.id}" title="Delete">🗑️</button>
            </div>
          </div>`;
      }).join('');

  container.innerHTML = `
    <div class="filter-bar">
      <input type="text"  class="filter-input" id="filter-search"
             placeholder="Search…" value="${filters.search ?? ''}">
      <select class="filter-select" id="filter-cat">
        <option value="all" ${filters.category === 'all' ? 'selected' : ''}>All categories</option>
        ${catOptions}
      </select>
      <select class="filter-select" id="filter-sort">${sortOptions}</select>
      <input type="date" class="filter-input date-input" id="filter-start" value="${filters.startDate ?? ''}" title="From date">
      <input type="date" class="filter-input date-input" id="filter-end"   value="${filters.endDate   ?? ''}" title="To date">
    </div>

    <div class="list-header">
      <span class="list-meta">
        ${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}
        · ${money(total)}
      </span>
      <button class="export-btn" id="export-btn" type="button">↓ Export CSV</button>
    </div>

    <div class="expense-list" id="expense-list">${listHTML}</div>`;
}

// ── Budget tab ─────────────────────────────────────────────────
export function renderBudget(container, expenses, budgets) {
  const month  = currentMonth();
  const byCat  = sumByCategory(expenses.filter(e => e.date.startsWith(month)));

  const cards = Object.entries(CATEGORIES).map(([key, cat]) => {
    const spent  = byCat[key] ?? 0;
    const budget = budgets[key] ?? 0;
    const pct    = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const over   = spent > budget && budget > 0;
    const warn   = pct >= 75 && !over;
    const statusCls = over ? 'over' : warn ? 'warn' : 'ok';
    const statusLbl = over ? 'Over budget' : warn ? 'Running low' : 'On track';

    return `
      <div class="budget-card">
        <div class="budget-header">
          <div class="budget-icon" style="background:${cat.color}20;color:${cat.color}">${cat.icon}</div>
          <div class="budget-info">
            <span class="budget-cat">${cat.label}</span>
            <span class="budget-status ${statusCls}">${statusLbl}</span>
          </div>
          <div class="budget-amounts">
            <span class="budget-spent">${money(spent)}</span>
            <span class="budget-limit">/
              <input class="budget-input" data-cat="${key}"
                     type="number" min="0" step="10"
                     value="${convert(budget).toFixed(2)}" title="Edit budget (in active currency)">
            </span>
          </div>
        </div>
        <div class="budget-bar-track">
          <div class="budget-bar-fill ${statusCls}" style="width:${pct}%"></div>
        </div>
        <div class="budget-footer">
          <span class="budget-remaining ${over ? 'over' : ''}">
            ${over
              ? `${money(spent - budget)} over`
              : `${money(budget - spent)} remaining`}
          </span>
          <span class="budget-pct">${Math.round(pct)}%</span>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <p class="budget-intro">
      Set monthly budgets per category. Changes save automatically.
    </p>
    <div class="budget-grid">${cards}</div>`;
}

// ── Modal form ─────────────────────────────────────────────────
export function populateForm(form, expense = null) {
  const today = new Date().toISOString().slice(0, 10);

  const catOptions = Object.entries(CATEGORIES)
    .map(([k, c]) => `<option value="${k}" ${expense?.category === k ? 'selected' : ''}>${c.icon} ${c.label}</option>`)
    .join('');

  form.innerHTML = `
    <div class="form-group">
      <label for="f-amount">Amount</label>
      <div class="amount-wrap">
        <span class="currency-sign">${getCurrencySymbol()}</span>
        <input type="number" id="f-amount" name="amount"
               min="0.01" step="0.01" placeholder="0.00" required
               value="${expense ? convert(expense.amount).toFixed(2) : ''}">
      </div>
    </div>
    <div class="form-group">
      <label for="f-category">Category</label>
      <select id="f-category" name="category" required>${catOptions}</select>
    </div>
    <div class="form-group">
      <label for="f-desc">Description</label>
      <input type="text" id="f-desc" name="description"
             placeholder="What was it for?" maxlength="100" required
             value="${expense ? expense.description : ''}">
    </div>
    <div class="form-group">
      <label for="f-date">Date</label>
      <input type="date" id="f-date" name="date"
             required value="${expense ? expense.date : today}">
    </div>`;
}
