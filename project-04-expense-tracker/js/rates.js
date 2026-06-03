// rates.js — exchange rates from Frankfurter (free, no API key)
//
// All expenses are stored in ZAR. Rates are fetched relative to ZAR
// and cached in localStorage for 1 hour so we don't hit the API every load.

const BASE      = 'ZAR';
const CACHE_KEY = 'expense-rates';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function fetchRates() {
  const cached = getCache();
  if (cached) return cached;

  const res = await fetch(`https://api.frankfurter.app/latest?from=${BASE}`);
  if (!res.ok) throw new Error(`Rate fetch failed (${res.status})`);

  const data  = await res.json();
  // Frankfurter omits the base currency itself — add it manually
  const rates = { ZAR: 1, ...data.rates };

  saveCache(rates);
  return rates;
}

function getCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (!raw || Date.now() - raw.t > CACHE_TTL) return null;
    return raw.rates;
  } catch {
    return null;
  }
}

function saveCache(rates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, t: Date.now() }));
  } catch {}
}
