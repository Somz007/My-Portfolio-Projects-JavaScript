// local time only — toISOString() gives UTC which drifts in negative-offset zones
export function toDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// counts consecutive done days backwards from today (or from yesterday if today isn't done)
export function getStreak(log) {
  const cursor = new Date();

  // if today isn't checked, try counting from yesterday instead
  if (!log[toDateStr(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
    if (!log[toDateStr(cursor)]) return 0;
  }

  let streak = 0;
  while (log[toDateStr(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getLongestStreak(log) {
  const dates = Object.keys(log).sort();
  if (!dates.length) return 0;

  let longest = 1, run = 1;
  for (let i = 1; i < dates.length; i++) {
    // string-parsed as UTC midnight — subtraction is timezone-safe for day diffs
    const gap = (new Date(dates[i]) - new Date(dates[i - 1])) / 86400000;
    if (gap === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }
  return longest;
}

// returns weeks*7 cells aligned Sun–Sat; grid ends on the Saturday on/after today
export function getHeatmapData(log, weeks = 12) {
  const today = new Date();
  const todayStr = toDateStr(today);

  const end = new Date(today);
  end.setDate(today.getDate() + (6 - today.getDay())); // advance to this Saturday

  const cursor = new Date(end);
  cursor.setDate(end.getDate() - weeks * 7 + 1); // back to opening Sunday

  const cells = [];
  while (cursor <= end) {
    const key = toDateStr(cursor);
    cells.push({ date: key, done: !!log[key], isFuture: key > todayStr });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}
