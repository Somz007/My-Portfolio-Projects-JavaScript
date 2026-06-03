const KEY = 'habit-tracker-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
}

function save(habits) {
  localStorage.setItem(KEY, JSON.stringify(habits));
}

export function getHabits() {
  return load();
}

export function getHabit(id) {
  return load().find(h => h.id === id) ?? null;
}

export function addHabit(name) {
  const habits = load();
  const habit = {
    id: Date.now().toString(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    log: {},
  };
  habits.push(habit);
  save(habits);
  return habit;
}

export function deleteHabit(id) {
  save(load().filter(h => h.id !== id));
}

export function renameHabit(id, name) {
  const habits = load();
  const habit  = habits.find(h => h.id === id);
  if (habit && name.trim()) { habit.name = name.trim(); save(habits); }
}

// returns the updated habit, or null if id not found
export function toggleLog(id, date) {
  const habits = load();
  const habit = habits.find(h => h.id === id);
  if (!habit) return null;
  if (habit.log[date]) delete habit.log[date];
  else habit.log[date] = true;
  save(habits);
  return habit;
}
