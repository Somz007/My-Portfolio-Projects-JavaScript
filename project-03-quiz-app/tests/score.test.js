import { describe, it, expect, beforeEach } from 'vitest';
import { calcPoints, getHighScore, saveHighScore } from '../js/score.js';

beforeEach(() => localStorage.clear());

describe('calcPoints', () => {
  it('returns 100 base with no time and no streak', () => {
    expect(calcPoints(0, 'easy', 0)).toBe(100);
  });

  it('adds time bonus scaled by difficulty multiplier', () => {
    // easy multiplier = 1, 10s left → 10 × 1 × 5 = 50 bonus
    expect(calcPoints(10, 'easy', 0)).toBe(150);
  });

  it('scales higher on hard', () => {
    // hard multiplier = 2, 10s → 10 × 2 × 5 = 100 bonus
    expect(calcPoints(10, 'hard', 0)).toBe(200);
  });

  it('adds 10 per streak hit', () => {
    expect(calcPoints(0, 'easy', 3)).toBe(130);
  });

  it('caps streak bonus at 50', () => {
    expect(calcPoints(0, 'easy', 100)).toBe(150);
  });

  it('combines all components correctly', () => {
    // 100 + (5 × 1.5 × 5 = 37) + (2 × 10 = 20) = 157
    expect(calcPoints(5, 'medium', 2)).toBe(157);
  });
});

describe('getHighScore', () => {
  it('returns 0 when nothing stored', () => {
    expect(getHighScore(18, 'easy')).toBe(0);
  });
});

describe('saveHighScore', () => {
  it('saves and returns true on first save', () => {
    expect(saveHighScore(18, 'easy', 500)).toBe(true);
    expect(getHighScore(18, 'easy')).toBe(500);
  });

  it('returns true when beating the record', () => {
    saveHighScore(18, 'easy', 500);
    expect(saveHighScore(18, 'easy', 750)).toBe(true);
    expect(getHighScore(18, 'easy')).toBe(750);
  });

  it('returns false and keeps old record when score is lower', () => {
    saveHighScore(18, 'easy', 500);
    expect(saveHighScore(18, 'easy', 300)).toBe(false);
    expect(getHighScore(18, 'easy')).toBe(500);
  });

  it('tracks scores per category independently', () => {
    saveHighScore(9,  'medium', 400);
    saveHighScore(18, 'medium', 700);
    expect(getHighScore(9,  'medium')).toBe(400);
    expect(getHighScore(18, 'medium')).toBe(700);
  });

  it('tracks scores per difficulty independently', () => {
    saveHighScore(18, 'easy',   300);
    saveHighScore(18, 'medium', 600);
    saveHighScore(18, 'hard',   900);
    expect(getHighScore(18, 'easy')).toBe(300);
    expect(getHighScore(18, 'hard')).toBe(900);
  });
});
