const KEY = 'weather-recent';
const MAX  = 5;

export function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

export function addRecent(city) {
  const trimmed = city.trim();
  if (!trimmed) return;

  // move to front if already in list, otherwise prepend
  const list = getRecent().filter(c => c.toLowerCase() !== trimmed.toLowerCase());
  list.unshift(trimmed);

  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // storage unavailable — silently skip
  }
}
