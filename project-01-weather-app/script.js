// script.js — Weather App
//
// 1. fetchCoordinates(city) → lat/lon from Geocoding API
// 2. fetchWeatherData(lat, lon) → current + 7-day forecast
// 3. renderWeather() / renderForecast() → update the DOM from stored state

const GEO_URL     = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// WMO weather codes → display info
// full list: https://open-meteo.com/en/docs#weathervariables
const WMO_CODES = {
  0:  { description: "Clear sky",                     emoji: "☀️"  },
  1:  { description: "Mainly clear",                  emoji: "🌤️" },
  2:  { description: "Partly cloudy",                 emoji: "⛅"  },
  3:  { description: "Overcast",                      emoji: "☁️"  },
  45: { description: "Fog",                           emoji: "🌫️" },
  48: { description: "Icy fog",                       emoji: "🌫️" },
  51: { description: "Light drizzle",                 emoji: "🌦️" },
  53: { description: "Moderate drizzle",              emoji: "🌦️" },
  55: { description: "Dense drizzle",                 emoji: "🌦️" },
  61: { description: "Slight rain",                   emoji: "🌧️" },
  63: { description: "Moderate rain",                 emoji: "🌧️" },
  65: { description: "Heavy rain",                    emoji: "🌧️" },
  71: { description: "Slight snow",                   emoji: "🌨️" },
  73: { description: "Moderate snow",                 emoji: "🌨️" },
  75: { description: "Heavy snow",                    emoji: "❄️"  },
  77: { description: "Snow grains",                   emoji: "🌨️" },
  80: { description: "Slight showers",                emoji: "🌦️" },
  81: { description: "Moderate showers",              emoji: "🌦️" },
  82: { description: "Violent showers",               emoji: "⛈️" },
  85: { description: "Slight snow showers",           emoji: "🌨️" },
  86: { description: "Heavy snow showers",            emoji: "🌨️" },
  95: { description: "Thunderstorm",                  emoji: "⛈️" },
  96: { description: "Thunderstorm with hail",        emoji: "⛈️" },
  99: { description: "Thunderstorm with heavy hail",  emoji: "⛈️" },
};

// maps WMO codes to a CSS class suffix for the background gradient
const WMO_FAMILY = {
  0:  "sunny",  1:  "sunny",  2:  "cloudy", 3:  "cloudy",
  45: "foggy",  48: "foggy",
  51: "rainy",  53: "rainy",  55: "rainy",
  61: "rainy",  63: "rainy",  65: "rainy",
  71: "snowy",  73: "snowy",  75: "snowy",  77: "snowy",
  80: "rainy",  81: "rainy",  82: "stormy",
  85: "snowy",  86: "snowy",
  95: "stormy", 96: "stormy", 99: "stormy",
};

const BG_CLASSES = ["weather-sunny", "weather-cloudy", "weather-rainy",
                    "weather-snowy", "weather-stormy", "weather-foggy"];

// app state — I store raw °C from the API and convert on render
let lastWeatherData = null;
let isCelsius       = true;

// DOM refs
const form           = document.getElementById("search-form");
const cityInput      = document.getElementById("city-input");
const weatherCard    = document.getElementById("weather-card");
const errorMsg       = document.getElementById("error-message");
const spinner        = document.getElementById("spinner");
const cityNameEl     = document.getElementById("city-name");
const iconEl         = document.getElementById("weather-icon");
const tempEl         = document.getElementById("temperature");
const descEl         = document.getElementById("description");
const humidityEl     = document.getElementById("humidity");
const windEl         = document.getElementById("wind-speed");
const feelsLikeEl    = document.getElementById("feels-like");
const unitToggle     = document.getElementById("unit-toggle");
const forecastStrip  = document.getElementById("forecast-strip");

// °C → °F
function toFahrenheit(c) {
  return (c * 9) / 5 + 32;
}

function formatTemp(c) {
  return isCelsius
    ? `${Math.round(c)}°C`
    : `${Math.round(toFahrenheit(c))}°F`;
}

function applyBackground(code) {
  document.body.classList.remove(...BG_CLASSES);
  const family = WMO_FAMILY[code];
  if (family) document.body.classList.add(`weather-${family}`);
}

// UI state helpers
function showSpinner() {
  spinner.hidden      = false;
  weatherCard.hidden  = true;
  forecastStrip.hidden = true;
  errorMsg.hidden     = true;
}

function hideSpinner() {
  spinner.hidden = true;
}

function showError(msg) {
  errorMsg.textContent  = msg;
  errorMsg.hidden       = false;
  weatherCard.hidden    = true;
  forecastStrip.hidden  = true;
}

function hideError() {
  errorMsg.hidden = true;
}

// step 1 — city name → coordinates
async function fetchCoordinates(city) {
  const url = `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res  = await fetch(url);

  if (!res.ok) throw new Error("Could not reach the geocoding service. Try again later.");

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Check the spelling and try again.");
  }

  const { name, country, latitude, longitude } = data.results[0];
  return { name, country, latitude, longitude };
}

// step 2 — coordinates → weather data (current + daily)
async function fetchWeatherData(latitude, longitude) {
  const params = new URLSearchParams({
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

  const res = await fetch(`${WEATHER_URL}?${params}`);

  if (!res.ok) throw new Error("Could not reach the weather service. Try again later.");

  return res.json();
}

async function fetchWeather(city) {
  const location = await fetchCoordinates(city);
  const weather  = await fetchWeatherData(location.latitude, location.longitude);
  return { location, weather };
}

// render current conditions from lastWeatherData
// called after a fetch and also on unit toggle (no re-fetch needed)
function renderWeather() {
  if (!lastWeatherData) return;

  const { location, weather } = lastWeatherData;
  const { name, country } = location;
  const { temperature_2m, relative_humidity_2m, apparent_temperature,
          weather_code, wind_speed_10m } = weather.current;

  const condition = WMO_CODES[weather_code] ?? { description: "Unknown conditions", emoji: "🌡️" };

  applyBackground(weather_code);

  cityNameEl.textContent  = `${name}, ${country}`;
  iconEl.textContent      = condition.emoji;
  descEl.textContent      = condition.description;
  humidityEl.textContent  = `${relative_humidity_2m}%`;
  windEl.textContent      = `${wind_speed_10m} m/s`;
  tempEl.textContent      = formatTemp(temperature_2m);
  feelsLikeEl.textContent = formatTemp(apparent_temperature);

  // show the opposite unit on the button so it reads as "switch to X"
  unitToggle.textContent = isCelsius ? "°F" : "°C";

  weatherCard.hidden = false;
  renderForecast();
}

// render 7-day forecast strip
// daily arrays are parallel — index 0 = today, 1 = tomorrow, etc.
function renderForecast() {
  if (!lastWeatherData) return;

  const { daily } = lastWeatherData.weather;

  forecastStrip.innerHTML = "";

  daily.time.forEach((dateStr, i) => {
    const code = daily.weather_code[i];
    const high = daily.temperature_2m_max[i];
    const low  = daily.temperature_2m_min[i];

    const condition = WMO_CODES[code] ?? { emoji: "🌡️" };

    // "T12:00:00" avoids UTC midnight shifting the date back by one day
    const dayName = new Date(`${dateStr}T12:00:00`).toLocaleDateString("en", {
      weekday: "short",
    });

    const card = document.createElement("div");
    card.className = "forecast-day";

    // values are all from the API so no XSS risk using innerHTML here
    card.innerHTML = `
      <span class="forecast-day-name">${i === 0 ? "Today" : dayName}</span>
      <span class="forecast-emoji">${condition.emoji}</span>
      <span class="forecast-high">${formatTemp(high)}</span>
      <span class="forecast-low">${formatTemp(low)}</span>
    `;

    forecastStrip.appendChild(card);
  });

  forecastStrip.hidden = false;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  try {
    showSpinner();
    hideError();

    lastWeatherData = await fetchWeather(city);
    isCelsius = true; // reset on each new search

    renderWeather();

  } catch (error) {
    showError(error.message);

  } finally {
    hideSpinner();
  }
});

// toggle unit without re-fetching
unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  renderWeather();
});
