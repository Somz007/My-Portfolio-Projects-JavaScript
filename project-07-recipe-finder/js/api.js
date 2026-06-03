// api.js — all TheMealDB calls. Lookup results are cached in memory so
// reopening a modal doesn't hit the network again.

const BASE = 'https://www.themealdb.com/api/json/v1/1';
const lookupCache = new Map(); // id → full meal object

export async function searchByName(query) {
  const res  = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getCategories() {
  const res  = await fetch(`${BASE}/categories.php`);
  const data = await res.json();
  return data.categories ?? [];
}

// returns minimal objects: { idMeal, strMeal, strMealThumb }
// limited to 24 to keep the grid manageable
export async function filterByCategory(category) {
  const res  = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  const data = await res.json();
  return (data.meals ?? []).slice(0, 24);
}

// full meal object — cached so repeat modal opens are instant
export async function lookupById(id) {
  if (lookupCache.has(id)) return lookupCache.get(id);
  const res  = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  const meal = data.meals?.[0] ?? null;
  if (meal) lookupCache.set(id, meal);
  return meal;
}
