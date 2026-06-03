import { WMO_CODES, WMO_FAMILY, BG_CLASSES } from './constants.js';
import { formatTemp, dateToShortDay } from './utils.js';

// DOM refs — grabbed once at module load (DOM is ready because script is type="module")
const weatherCard    = document.getElementById("weather-card");
const errorMsg       = document.getElementById("error-message");
const spinner        = document.getElementById("spinner");
const forecastStrip  = document.getElementById("forecast-strip");
const recentEl       = document.getElementById("recent-searches");
const cityNameEl     = document.getElementById("city-name");
const iconEl         = document.getElementById("weather-icon");
const tempEl         = document.getElementById("temperature");
const descEl         = document.getElementById("description");
const humidityEl     = document.getElementById("humidity");
const windEl         = document.getElementById("wind-speed");
const feelsLikeEl    = document.getElementById("feels-like");
const unitToggle     = document.getElementById("unit-toggle");

export function showSpinner() {
  spinner.hidden       = false;
  weatherCard.hidden   = true;
  forecastStrip.hidden = true;
  errorMsg.hidden      = true;
}

export function hideSpinner() {
  spinner.hidden = true;
}

export function showError(msg) {
  errorMsg.textContent  = msg;
  errorMsg.hidden       = false;
  weatherCard.hidden    = true;
  forecastStrip.hidden  = true;
}

export function hideError() {
  errorMsg.hidden = true;
}

export function applyBackground(code) {
  document.body.classList.remove(...BG_CLASSES);
  const family = WMO_FAMILY[code];
  if (family) document.body.classList.add(`weather-${family}`);
}

export function renderWeather(data, isCelsius) {
  const { location, weather } = data;
  const { name, country } = location;
  const {
    temperature_2m, relative_humidity_2m, apparent_temperature,
    weather_code, wind_speed_10m,
  } = weather.current;

  const condition = WMO_CODES[weather_code] ?? { description: "Unknown conditions", emoji: "🌡️" };

  applyBackground(weather_code);

  cityNameEl.textContent  = `${name}, ${country}`;
  iconEl.textContent      = condition.emoji;
  descEl.textContent      = condition.description;
  humidityEl.textContent  = `${relative_humidity_2m}%`;
  windEl.textContent      = `${wind_speed_10m} m/s`;
  tempEl.textContent      = formatTemp(temperature_2m, isCelsius);
  feelsLikeEl.textContent = formatTemp(apparent_temperature, isCelsius);
  unitToggle.textContent  = isCelsius ? "°F" : "°C";

  weatherCard.hidden = false;
}

export function renderForecast(data, isCelsius) {
  const { daily } = data.weather;

  forecastStrip.innerHTML = "";

  // daily arrays are parallel — index 0 = today, 1 = tomorrow, etc.
  daily.time.forEach((dateStr, i) => {
    const code      = daily.weather_code[i];
    const high      = daily.temperature_2m_max[i];
    const low       = daily.temperature_2m_min[i];
    const condition = WMO_CODES[code] ?? { emoji: "🌡️" };
    const label     = i === 0 ? "Today" : dateToShortDay(dateStr);

    const card = document.createElement("div");
    card.className = "forecast-day";
    // values from API only — no user input here, no XSS risk
    card.innerHTML = `
      <span class="forecast-day-name">${label}</span>
      <span class="forecast-emoji">${condition.emoji}</span>
      <span class="forecast-high">${formatTemp(high, isCelsius)}</span>
      <span class="forecast-low">${formatTemp(low, isCelsius)}</span>
    `;

    forecastStrip.appendChild(card);
  });

  forecastStrip.hidden = false;
}

// renders clickable recent-search chips; onSelect(city) is called on click
export function renderRecentSearches(searches, onSelect) {
  if (!recentEl) return;

  recentEl.innerHTML = "";

  if (!searches.length) {
    recentEl.hidden = true;
    return;
  }

  searches.forEach(city => {
    const chip = document.createElement("button");
    chip.type      = "button";
    chip.className = "recent-chip";
    chip.textContent = city;
    chip.addEventListener("click", () => onSelect(city));
    recentEl.appendChild(chip);
  });

  recentEl.hidden = false;
}
