function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderHeatmap(cells) {
  return cells.map(({ date, done, isFuture }) => {
    const cls = ['hm-cell', done && 'done', isFuture && 'future'].filter(Boolean).join(' ');
    return `<div class="${cls}" data-date="${date}" title="${date}"></div>`;
  }).join('');
}

// receives pre-computed values so this file has no logic dependencies
export function renderCard({ habit, streak, longest, heatmapData, todayDone }) {
  return `
    <article class="habit-card" data-id="${esc(habit.id)}">
      <div class="habit-header">
        <h2 class="habit-name">${esc(habit.name)}</h2>
        <div class="habit-header-actions">
          <button class="edit-btn"   aria-label="Edit habit name">✎</button>
          <button class="delete-btn" aria-label="Delete ${esc(habit.name)}">✕</button>
        </div>
      </div>
      <div class="habit-stats">
        <div class="stat">
          <span class="stat-value">${streak}</span>
          <span class="stat-label">day streak</span>
        </div>
        <div class="stat">
          <span class="stat-value">${longest}</span>
          <span class="stat-label">best streak</span>
        </div>
        <button class="checkin-btn${todayDone ? ' done' : ''}" data-id="${esc(habit.id)}">
          ${todayDone ? '✓ Done today' : 'Check in'}
        </button>
      </div>
      <div class="heatmap" aria-label="Completion history for ${esc(habit.name)}">
        ${renderHeatmap(heatmapData)}
      </div>
    </article>
  `;
}
