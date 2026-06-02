export const GEO_URL     = "https://geocoding-api.open-meteo.com/v1/search";
export const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
export const NOMINATIM   = "https://nominatim.openstreetmap.org/reverse";

// cached responses expire after 10 minutes
export const CACHE_TTL = 10 * 60 * 1000;

// full WMO code list: https://open-meteo.com/en/docs#weathervariables
export const WMO_CODES = {
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

export const WMO_FAMILY = {
  0:  "sunny",  1:  "sunny",  2:  "cloudy", 3:  "cloudy",
  45: "foggy",  48: "foggy",
  51: "rainy",  53: "rainy",  55: "rainy",
  61: "rainy",  63: "rainy",  65: "rainy",
  71: "snowy",  73: "snowy",  75: "snowy",  77: "snowy",
  80: "rainy",  81: "rainy",  82: "stormy",
  85: "snowy",  86: "snowy",
  95: "stormy", 96: "stormy", 99: "stormy",
};

export const BG_CLASSES = [
  "weather-sunny", "weather-cloudy", "weather-rainy",
  "weather-snowy",  "weather-stormy", "weather-foggy",
];
