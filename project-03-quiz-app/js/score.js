import { DIFFICULTIES } from './config.js';

// scoring: 100 base + time bonus + streak bonus (capped at 50)
export function calcPoints(timeLeft, difficulty, streak) {
  const { multiplier } = DIFFICULTIES[difficulty];
  const base        = 100;
  const timeBonus   = Math.floor(timeLeft * multiplier * 5);
  const streakBonus = Math.min(streak * 10, 50);
  return base + timeBonus + streakBonus;
}

// high scores are stored per category+difficulty so each combo has its own record
function key(categoryId, difficulty) {
  return `quiz-best-${categoryId}-${difficulty}`;
}

export function getHighScore(categoryId, difficulty) {
  return parseInt(localStorage.getItem(key(categoryId, difficulty)) ?? '0', 10);
}

export function saveHighScore(categoryId, difficulty, score) {
  const prev = getHighScore(categoryId, difficulty);
  if (score > prev) {
    localStorage.setItem(key(categoryId, difficulty), String(score));
    return true;
  }
  return false;
}
