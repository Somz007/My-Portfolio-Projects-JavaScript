import { searchByName, getCategories, filterByCategory, lookupById } from './api.js';
import { getFavourites, isFavourite, addFavourite, removeFavourite } from './storage.js';
import {
  renderCategories, renderCards, renderLoading, renderEmpty,
  renderModal, renderFavCount, updateFavBtn,
} from './render.js';

const STORAGE_THEME    = 'recipe-theme';
const DEFAULT_CATEGORY = 'Chicken';

// ── State ──────────────────────────────────────────────────────

const state = {
  categories:     [],
  activeCategory: DEFAULT_CATEGORY,
  query:          '',
  tab:            'results',
  meals:          [],        // card-level objects for the current results view
  mealMap:        new Map(), // id → card-level (or full) meal object
};

// ── Init ───────────────────────────────────────────────────────

async function init() {
  applyTheme(localStorage.getItem(STORAGE_THEME) || 'dark');
  renderFavCount(getFavourites().length);
  renderLoading();

  try {
    // fetch categories and default category in parallel
    const [cats, meals] = await Promise.all([
      getCategories(),
      filterByCategory(DEFAULT_CATEGORY),
    ]);

    state.categories = cats;
    meals.forEach(m => { m.strCategory = DEFAULT_CATEGORY; });

    renderCategories(cats, DEFAULT_CATEGORY, handleCategorySelect);
    setMeals(meals);
  } catch {
    renderEmpty('Could not load recipes — check your connection.');
  }
}

// ── Data helpers ───────────────────────────────────────────────

function setMeals(meals) {
  state.meals = meals;
  meals.forEach(m => state.mealMap.set(m.idMeal, m));
  const favIds = new Set(getFavourites().map(f => f.idMeal));
  renderCards(meals, favIds);
}

async function loadCategory(category) {
  state.activeCategory = category;
  state.query          = '';
  searchInput.value    = '';
  renderCategories(state.categories, category, handleCategorySelect);
  renderLoading();

  try {
    const meals = await filterByCategory(category);
    meals.forEach(m => { m.strCategory = category; });
    setMeals(meals);
  } catch {
    renderEmpty('Could not load recipes.');
  }
}

async function loadSearch(query) {
  state.query          = query;
  state.activeCategory = null;
  renderCategories(state.categories, null, handleCategorySelect);
  renderLoading();

  try {
    const meals = await searchByName(query);
    setMeals(meals);
  } catch {
    renderEmpty('Search failed — check your connection.');
  }
}

// ── Event handlers ─────────────────────────────────────────────

function handleCategorySelect(category) {
  if (!category) {
    // "All" chip — if there's no active search just show a prompt
    state.activeCategory = null;
    state.query          = '';
    searchInput.value    = '';
    renderCategories(state.categories, null, handleCategorySelect);
    renderEmpty('Search for a recipe above, or pick a category.');
    return;
  }
  setTab('results');
  loadCategory(category);
}

// debounced search
const searchInput = document.getElementById('search-input');
let searchTimer;

searchInput.addEventListener('input', e => {
  const q = e.target.value.trim();
  clearTimeout(searchTimer);

  if (!q) {
    // user cleared the search — restore the last category or show prompt
    if (state.activeCategory) {
      renderCategories(state.categories, state.activeCategory, handleCategorySelect);
      const favIds = new Set(getFavourites().map(f => f.idMeal));
      renderCards(state.meals, favIds);
    } else {
      state.query = '';
      renderEmpty('Search for a recipe above, or pick a category.');
    }
    return;
  }

  setTab('results');
  searchTimer = setTimeout(() => loadSearch(q), 400);
});

// grid — card opens modal, fav button toggles fav
document.getElementById('grid').addEventListener('click', async e => {
  const favBtn = e.target.closest('.fav-btn');
  const card   = e.target.closest('.card');

  if (favBtn && card) {
    handleFavToggle(card.dataset.id);
    return;
  }
  if (card) {
    await openModal(card.dataset.id);
  }
});

// fav button inside the modal
document.getElementById('modal-content').addEventListener('click', e => {
  const btn = e.target.closest('.modal-fav');
  if (btn) handleFavToggle(btn.dataset.id);
});

// modal close
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// tabs
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => setTab(btn.dataset.tab));
});

// ── Modal ──────────────────────────────────────────────────────

async function openModal(id) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  content.innerHTML = `<div class="state-box"><div class="spinner"></div></div>`;

  try {
    const meal = await lookupById(id);
    if (!meal) { content.innerHTML = '<p style="padding:2rem">Recipe not found.</p>'; return; }

    // cache full data so favouriting from the modal gets category + area
    state.mealMap.set(id, meal);
    content.innerHTML = renderModal(meal, isFavourite(id));
    content.scrollTop = 0;
  } catch {
    content.innerHTML = '<p style="padding:2rem">Failed to load recipe.</p>';
  }
}

function closeModal() {
  document.getElementById('modal-overlay').hidden = true;
  document.body.style.overflow = '';
}

// ── Favourites ─────────────────────────────────────────────────

function handleFavToggle(id) {
  const meal = state.mealMap.get(id);
  if (!meal) return;

  const card = {
    idMeal:       meal.idMeal,
    strMeal:      meal.strMeal,
    strMealThumb: meal.strMealThumb,
    strCategory:  meal.strCategory || '',
    strArea:      meal.strArea     || '',
  };

  const isNowFav = !isFavourite(id);
  if (isNowFav) addFavourite(card); else removeFavourite(id);

  // update the card in the grid (if visible)
  updateFavBtn(id, isNowFav);

  // update the fav button inside the open modal (if it's this meal)
  const modalFav = document.querySelector('.modal-fav');
  if (modalFav?.dataset.id === id) {
    modalFav.classList.toggle('active', isNowFav);
    modalFav.textContent = isNowFav ? '♥' : '♡';
    modalFav.setAttribute('aria-label', `${isNowFav ? 'Remove from' : 'Add to'} favourites`);
  }

  renderFavCount(getFavourites().length);

  // if on the favourites tab, re-render immediately so removed items disappear
  if (state.tab === 'favourites') renderFavouritesTab();
}

function renderFavouritesTab() {
  const favs   = getFavourites();
  const favIds = new Set(favs.map(f => f.idMeal));
  favs.forEach(f => state.mealMap.set(f.idMeal, f));

  if (!favs.length) {
    renderEmpty('No saved recipes yet — heart one to save it here.');
  } else {
    renderCards(favs, favIds);
  }
}

// ── Tabs ───────────────────────────────────────────────────────

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.tab === tab)
  );

  if (tab === 'favourites') {
    renderFavouritesTab();
  } else {
    const favIds = new Set(getFavourites().map(f => f.idMeal));
    if (state.meals.length) {
      renderCards(state.meals, favIds);
    } else {
      renderEmpty('Search for a recipe above, or pick a category.');
    }
  }
}

// ── Theme ──────────────────────────────────────────────────────

const root        = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
  root.dataset.theme      = theme;
  themeToggle.textContent = theme === 'dark' ? '☀︎' : '☾';
  localStorage.setItem(STORAGE_THEME, theme);
}

themeToggle.addEventListener('click', () =>
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark')
);

// ── Start ──────────────────────────────────────────────────────

init();
