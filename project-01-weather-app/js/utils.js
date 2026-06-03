// pure utility functions — no DOM, no API, easy to unit test

export function toFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function formatTemp(celsius, isCelsius) {
  return isCelsius
    ? `${Math.round(celsius)}°C`
    : `${Math.round(toFahrenheit(celsius))}°F`;
}

// "2026-06-02" → "Mon"
// "T12:00:00" stops UTC midnight from rolling the date back one day
export function dateToShortDay(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en", {
    weekday: "short",
  });
}
