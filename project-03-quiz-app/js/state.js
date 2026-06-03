import { CATEGORIES } from './config.js';

export const state = {
  screen:      'start',
  categoryId:  18,                        // default: Computers & Tech
  difficulty:  'medium',
  questions:   [],
  current:     0,
  score:       0,
  streak:      0,
  bestStreak:  0,
  correct:     0,
  timeLeft:    0,
  answered:    false,
  results:     [],                        // { correct, skipped, question, correctAnswer }
  lifelines: {
    fifty: true,
    skip:  true,
  },
};

export function getCategoryName(id) {
  return CATEGORIES.find(c => c.id === id)?.name ?? 'Unknown';
}

export function resetGame(categoryId, difficulty, questions) {
  state.screen     = 'countdown';
  state.categoryId = categoryId;
  state.difficulty = difficulty;
  state.questions  = questions;
  state.current    = 0;
  state.score      = 0;
  state.streak     = 0;
  state.bestStreak = 0;
  state.correct    = 0;
  state.answered   = false;
  state.results    = [];
  state.lifelines  = { fifty: true, skip: true };
}
