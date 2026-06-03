# Project 01 — Weather App

A clean, responsive weather app that fetches real-time data from the [OpenWeather API](https://openweathermap.org/api) and displays current conditions for any city in the world.

Built as Project 1 of my JavaScript portfolio while learning frontend web development.

🔗 **[Live Demo](https://Somz007.github.io/My-Portfolio-Projects-JavaScript/project-01-weather-app/) — ⚠️ requires a free [OpenWeather API key](https://openweathermap.org/api) (see setup below)**


---

## Features

- Search any city worldwide
- Displays temperature (°C), weather description, humidity, wind speed, and "feels like"
- Animated weather icons from OpenWeather's icon CDN
- Loading spinner during API requests
- Friendly error messages for invalid cities or API issues
- Fully responsive — works on mobile and desktop

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure & semantic markup |
| CSS3 | Styling, Flexbox layout, glassmorphism card, animations |
| Vanilla JavaScript (ES2017+) | DOM manipulation, Fetch API, async/await |
| OpenWeather API | Real-time weather data |

---

## Getting Started

### 1. Get a free API key

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Go to **My Account → API keys**
3. Copy your default key (or generate a new one)

> Free tier includes up to 1,000 calls/day — more than enough for personal use.

### 2. Configure your key

Create a file called `config.js` in the project folder:

```js
const CONFIG = {
  API_KEY: "paste_your_key_here",
};
```

> ⚠️ `config.js` is listed in `.gitignore` and will **not** be committed to Git. Never paste your API key directly into `script.js` or any other tracked file.

### 3. Open the app

Open `index.html` in your browser directly, or use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code extension for auto-reload on save.

---

## File Structure

```
project-01-weather-app/
├── index.html      # Page structure
├── style.css       # All styling
├── script.js       # All JavaScript logic
├── config.js       # ← YOU CREATE THIS (API key, gitignored)
├── .gitignore      # Excludes config.js from version control
└── README.md       # This file
```

---

## What I Learned

- How to use the **Fetch API** with `async/await` for cleaner asynchronous code
- How to handle HTTP errors manually (fetch doesn't throw on 4xx/5xx)
- **Separation of concerns** — keeping HTML, CSS, and JS in separate files
- How to secure API keys in a client-side app (`.gitignore` + separate config file)
- CSS **Flexbox** for responsive layouts
- CSS **glassmorphism** effect using `backdrop-filter`
- DOM manipulation: showing/hiding elements with the `hidden` attribute

---

## Screenshots

_Add a screenshot here once the app is running._

---

## Author

**Semeshan** — [GitHub](https://github.com/Semeshan)
