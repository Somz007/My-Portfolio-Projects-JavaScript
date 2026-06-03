import { fetchWeather, fetchWeatherByCoords } from './api.js';
import { getRecent, addRecent } from './storage.js';
import {
  showSpinner, hideSpinner, showError, hideError,
  renderWeather, renderForecast, renderRecentSearches,
} from './render.js';

// app state
let lastData  = null;
let isCelsius = true;

// DOM refs needed for events
const form       = document.getElementById("search-form");
const cityInput  = document.getElementById("city-input");
const unitToggle = document.getElementById("unit-toggle");
const geoBtn     = document.getElementById("geo-btn");

function redraw() {
  if (!lastData) return;
  renderWeather(lastData, isCelsius);
  renderForecast(lastData, isCelsius);
}

async function loadCity(city) {
  try {
    showSpinner();
    hideError();

    lastData  = await fetchWeather(city);
    isCelsius = true;

    addRecent(city);
    renderRecentSearches(getRecent(), loadCity);
    redraw();

  } catch (err) {
    showError(err.message);
  } finally {
    hideSpinner();
  }
}

async function loadByGeolocation() {
  if (!navigator.geolocation) {
    showError("Geolocation isn't supported by your browser.");
    return;
  }

  // geolocation requires a secure context — file:// won't work
  if (location.protocol === "file:") {
    showError("Geolocation needs Live Server (localhost). Open the project via Live Server and try again.");
    return;
  }

  showSpinner();
  hideError();

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        lastData  = await fetchWeatherByCoords(coords.latitude, coords.longitude);
        isCelsius = true;
        redraw();
      } catch (err) {
        showError(err.message);
      } finally {
        hideSpinner();
      }
    },
    (err) => {
      hideSpinner();
      // PositionError codes: 1 = denied, 2 = unavailable, 3 = timeout
      const messages = {
        1: "Location access was denied. Allow it in your browser settings and try again.",
        2: "Your location couldn't be determined. Try searching manually.",
        3: "Location request timed out. Try searching manually.",
      };
      showError(messages[err.code] ?? "Couldn't get your location. Try searching manually.");
    },
    { timeout: 10_000 }
  );
}

// event listeners
form.addEventListener("submit", e => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) { showError("Please enter a city name."); return; }
  loadCity(city);
});

unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  redraw();
});

geoBtn.addEventListener("click", loadByGeolocation);

// show saved searches on page load
renderRecentSearches(getRecent(), loadCity);

// register service worker for offline support + asset caching
// SW needs HTTP — skip registration when opening via file://
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // non-fatal — app works fine without it
  });
}
