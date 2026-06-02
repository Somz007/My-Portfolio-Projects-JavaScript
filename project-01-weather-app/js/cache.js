import { CACHE_TTL } from './constants.js';

const PREFIX = 'weather-cache:';

export function getCached(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key.toLowerCase());
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);

    // expired — treat as a miss
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(PREFIX + key.toLowerCase());
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function setCached(key, data) {
  try {
    localStorage.setItem(
      PREFIX + key.toLowerCase(),
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // localStorage can be blocked (private mode, storage full) — just skip caching
  }
}
