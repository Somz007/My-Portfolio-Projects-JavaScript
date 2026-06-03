# Project 01 — Weather App

A clean, responsive weather app that fetches real-time conditions for any city using the [Open-Meteo API](https://open-meteo.com/) — completely free, no API key required.

Built as Project 1 of my JavaScript portfolio while learning frontend web development.

🔗 **[Live Demo](https://Somz007.github.io/My-Portfolio-Projects-JavaScript/project-01-weather-app/)**

---

## Features

- Search any city worldwide
- Displays temperature (°C / °F toggle), weather description, humidity, wind speed, and "feels like"
- Animated weather emoji icons mapped from WMO weather codes
- 7-day forecast strip
- Geolocation — "Use my location" fetches weather for your current position
- Recent searches saved in localStorage
- Dynamic background that changes with weather conditions (sunny, cloudy, rainy, etc.)
- 10-minute in-memory cache — repeated searches skip the network
- Service worker for offline support
- Fully responsive — works on mobile and desktop

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic markup, PWA manifest |
| CSS3 | Dynamic backgrounds, glassmorphism card, animations |
| Vanilla JavaScript (ES Modules) | Fetch API, async/await, caching, service worker |
| [Open-Meteo](https://open-meteo.com/) | Weather data — free, no key, no sign-up |
| [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) | City name → coordinates |
| [Nominatim (OpenStreetMap)](https://nominatim.org/) | Reverse geocoding for geolocation |

---

## Getting Started

No API key needed. Open `index.html` directly in your browser — or use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code extension for auto-reload.

> **Geolocation** requires a secure context (HTTPS or `localhost`). It will not work when the file is opened from the filesystem via `file://`. Use Live Server or the live demo link above.

### Run tests

```bash
npm install
npm test
```

---

## File Structure

```
project-01-weather-app/
├── js/
│   ├── app.js        ← events, state, orchestration
│   ├── api.js        ← Open-Meteo + Nominatim fetch calls
│   ├── constants.js  ← API URLs, WMO code map, cache TTL
│   ├── cache.js      ← in-memory response cache
│   ├── storage.js    ← recent searches (localStorage)
│   └── render.js     ← DOM updates: weather card, forecast, errors
├── icons/            ← PWA icons
├── tests/
├── index.html
├── style.css
├── sw.js             ← service worker (offline support)
├── manifest.json     ← PWA manifest
├── package.json
├── vitest.config.js
└── README.md
```

---

## How It Works

1. **City search** — the typed city name is sent to the Open-Meteo geocoding API, which returns latitude and longitude. Those coordinates are then passed to the weather API.
2. **Geolocation** — the browser's `navigator.geolocation` returns raw coordinates, which go through Nominatim for a human-readable city name and then directly to Open-Meteo for weather.
3. **Caching** — both paths cache the response in memory for 10 minutes so repeated requests for the same city don't hit the network.
4. **WMO codes** — Open-Meteo returns a numeric WMO weather code (e.g. `61` = slight rain). The app maps these to emoji icons and background themes via a lookup table in `constants.js`.

---

## What I Learned

- How to chain multiple API calls (geocoding → weather) using `async/await`
- How to handle HTTP errors manually (`fetch` doesn't throw on 4xx/5xx)
- **ES Modules** — splitting logic across files with `import`/`export`
- **In-memory caching** — avoiding redundant network requests with a `Map` keyed by city
- **WMO weather codes** — a standardised numeric system used by meteorological services worldwide
- How to register a **service worker** for offline support and asset caching
- CSS dynamic theming — swapping a background class based on weather conditions
- **Geolocation API** and how to handle its various error states (`PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`)

---

## Author

**Semeshan** — [GitHub](https://github.com/Somz007)
