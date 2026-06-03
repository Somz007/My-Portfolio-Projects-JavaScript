// render.js — builds DOM. No event handling; no imports from other local modules.
// app.js wires up all events via delegation after calling these.

const gridEl     = document.getElementById('grid');
const catsEl     = document.getElementById('categories');
const favCountEl = document.getElementById('fav-count');

// ── States ─────────────────────────────────────────────────────

export function renderLoading() {
  gridEl.innerHTML = `
    <div class="state-box">
      <div class="spinner"></div>
      <p>Loading…</p>
    </div>`;
}

export function renderEmpty(msg = 'No recipes found.') {
  gridEl.innerHTML = `
    <div class="state-box">
      <span class="state-icon">🍽</span>
      <p>${msg}</p>
    </div>`;
}

export function renderError(msg) {
  gridEl.innerHTML = `
    <div class="state-box">
      <span class="state-icon">⚠️</span>
      <p>${msg}</p>
      <button type="button" id="retry-btn" class="retry-btn">Try again</button>
    </div>`;
}

// ── Categories ─────────────────────────────────────────────────

export function renderCategories(categories, activeCategory, onSelect) {
  catsEl.innerHTML = '';
  catsEl.appendChild(chip('All', !activeCategory, () => onSelect(null)));
  categories.forEach(cat =>
    catsEl.appendChild(
      chip(cat.strCategory, activeCategory === cat.strCategory, () => onSelect(cat.strCategory))
    )
  );
}

function chip(label, active, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chip' + (active ? ' active' : '');
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

// ── Cards ──────────────────────────────────────────────────────

// meals: array of card-level objects; favIds: Set<idMeal>
export function renderCards(meals, favIds) {
  if (!meals.length) { renderEmpty(); return; }

  gridEl.innerHTML = '';
  meals.forEach(meal => {
    const isFav = favIds.has(meal.idMeal);
    const meta  = [meal.strCategory, meal.strArea].filter(Boolean).join(' · ');

    const article = document.createElement('article');
    article.className   = 'card';
    article.dataset.id  = meal.idMeal;
    article.innerHTML   = `
      <div class="card-img-wrap">
        <img src="${meal.strMealThumb}/preview" alt="${esc(meal.strMeal)}" loading="lazy"
             onerror="this.onerror=null;this.classList.add('img-error')">
        <button type="button" class="fav-btn${isFav ? ' active' : ''}"
          aria-label="${isFav ? 'Remove from' : 'Add to'} favourites">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(meal.strMeal)}</h3>
        <p class="card-meta">${esc(meta)}</p>
      </div>`;

    gridEl.appendChild(article);
  });
}

// update a single card's fav button without re-rendering everything
export function updateFavBtn(id, isFav) {
  const card = gridEl.querySelector(`.card[data-id="${id}"]`);
  if (!card) return;
  const btn = card.querySelector('.fav-btn');
  btn.classList.toggle('active', isFav);
  btn.textContent = isFav ? '♥' : '♡';
  btn.setAttribute('aria-label', `${isFav ? 'Remove from' : 'Add to'} favourites`);
}

// ── Favourites count ───────────────────────────────────────────

export function renderFavCount(count) {
  favCountEl.textContent = count;
  favCountEl.hidden = count === 0;
}

// ── Modal ──────────────────────────────────────────────────────

// returns an HTML string — caller sets innerHTML
export function renderModal(meal, isFav) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing  = meal[`strIngredient${i}`]?.trim();
    const meas = meal[`strMeasure${i}`]?.trim();
    if (ing) ingredients.push(`<li><span class="measure">${esc(meas || '')}</span>${esc(ing)}</li>`);
  }

  const ytId   = meal.strYoutube?.match(/[?&]v=([^&]+)/)?.[1];
  const ytLink = ytId
    ? `<a class="yt-link" href="https://www.youtube.com/watch?v=${ytId}" target="_blank" rel="noopener">▶ Watch on YouTube</a>`
    : '';

  // paragraph-break double newlines; collapse single newlines to spaces
  const instructions = esc(meal.strInstructions ?? '')
    .replace(/\r?\n\r?\n/g, '</p><p class="instructions">')
    .replace(/\r?\n/g, ' ');

  const meta = [meal.strCategory, meal.strArea].filter(Boolean).join(' · ');

  return `
    <img class="modal-img" src="${meal.strMealThumb}" alt="${esc(meal.strMeal)}"
         onerror="this.onerror=null;this.classList.add('img-error')">
    <div class="modal-header">
      <div class="modal-title-wrap">
        <h2>${esc(meal.strMeal)}</h2>
        <p class="modal-meta">${esc(meta)}</p>
      </div>
      <button type="button" class="fav-btn modal-fav${isFav ? ' active' : ''}"
        data-id="${meal.idMeal}" aria-label="${isFav ? 'Remove from' : 'Add to'} favourites">
        ${isFav ? '♥' : '♡'}
      </button>
    </div>
    <h3 class="section-heading">Ingredients</h3>
    <ul class="ingredients">${ingredients.join('')}</ul>
    <h3 class="section-heading">Instructions</h3>
    <p class="instructions">${instructions}</p>
    ${ytLink}`;
}

// ── Util ───────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
