import { GEO_URL, WEATHER_URL, NOMINATIM } from './constants.js';
import { getCached, setCached } from './cache.js';

// shared daily + current params for the forecast request
function buildWeatherParams(latitude, longitude) {
  return new URLSearchParams({
    latitude,
    longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
    ].join(","),
    wind_speed_unit: "ms",
    timezone: "auto",
  });
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// city name → { name, country, latitude, longitude }
export async function fetchCoordinates(city) {
  const url  = `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const data = await getJSON(url);

  if (!data.results?.length) {
    throw new Error("City not found. Check the spelling and try again.");
  }

  const { name, country, latitude, longitude } = data.results[0];
  return { name, country, latitude, longitude };
}

// lat/lon → { name, country } via OpenStreetMap Nominatim
export async function reverseGeocode(latitude, longitude) {
  const url  = `${NOMINATIM}?lat=${latitude}&lon=${longitude}&format=json`;
  const data = await getJSON(url);

  // Nominatim returns address.city, .town, or .village depending on location type
  const name    = data.address?.city ?? data.address?.town ?? data.address?.village ?? "Current Location";
  const country = data.address?.country_code?.toUpperCase() ?? "";
  return { name, country, latitude, longitude };
}

// { latitude, longitude } → Open-Meteo weather JSON
async function fetchWeatherData(latitude, longitude) {
  const params = buildWeatherParams(latitude, longitude);
  return getJSON(`${WEATHER_URL}?${params}`);
}

// main entry — checks cache before hitting the network
export async function fetchWeather(city) {
  const cached = getCached(city);
  if (cached) return cached;

  const location = await fetchCoordinates(city);
  const weather  = await fetchWeatherData(location.latitude, location.longitude);
  const result   = { location, weather };

  setCached(city, result);
  return result;
}

// geolocation path — takes raw coords, skips the geocoding step
export async function fetchWeatherByCoords(latitude, longitude) {
  const cacheKey = `coords:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached   = getCached(cacheKey);
  if (cached) return cached;

  // run reverse geocode and weather fetch in parallel — they don't depend on each other
  const [location, weather] = await Promise.all([
    reverseGeocode(latitude, longitude),
    fetchWeatherData(latitude, longitude),
  ]);

  const result = { location, weather };
  setCached(cacheKey, result);
  return result;
}
