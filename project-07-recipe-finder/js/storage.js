// storage.js — favourites CRUD. Stored as { [idMeal]: cardObject } for O(1) lookup.
// Card shape: { idMeal, strMeal, strMealThumb, strCategory, strArea }

const KEY = 'recipe-favs';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; }
  catch { return {}; }
}

function save(favs) {
  localStorage.setItem(KEY, JSON.stringify(favs));
}

export function getFavourites() {
  return Object.values(load());
}

export function isFavourite(id) {
  return Object.prototype.hasOwnProperty.call(load(), id);
}

export function addFavourite(card) {
  const favs = load();
  favs[card.idMeal] = card;
  save(favs);
}

export function removeFavourite(id) {
  const favs = load();
  delete favs[id];
  save(favs);
}

// returns true if the meal is now a favourite, false if it was removed
export function toggleFavourite(card) {
  if (isFavourite(card.idMeal)) {
    removeFavourite(card.idMeal);
    return false;
  }
  addFavourite(card);
  return true;
}
