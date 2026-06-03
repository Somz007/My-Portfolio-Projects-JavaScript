// render.js — DOM string builders. No event handling, no imports.

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderCard(card, colId) {
  return `
    <div class="card" draggable="true"
         data-id="${esc(card.id)}" data-col="${esc(colId)}">
      <span class="drag-handle" aria-hidden="true">⠿</span>
      <span class="card-text">${esc(card.text)}</span>
      <div class="card-actions">
        <button class="edit-btn"   type="button" aria-label="Edit card">✎</button>
        <button class="delete-btn" type="button" aria-label="Delete card">✕</button>
      </div>
    </div>`;
}

function renderColumn(col) {
  return `
    <section class="column" data-col="${esc(col.id)}" aria-label="${esc(col.title)}">
      <div class="col-header">
        <h2 class="col-title">${esc(col.title)}</h2>
        <span class="col-count" aria-label="${col.cards.length} cards">${col.cards.length}</span>
      </div>
      <div class="cards" data-col="${esc(col.id)}">
        ${col.cards.map(c => renderCard(c, col.id)).join('')}
      </div>
      <button class="add-card-btn" data-col="${esc(col.id)}" type="button">
        + Add card
      </button>
    </section>`;
}

export function renderBoard(board, container) {
  container.innerHTML = board.columns.map(renderColumn).join('');
}
