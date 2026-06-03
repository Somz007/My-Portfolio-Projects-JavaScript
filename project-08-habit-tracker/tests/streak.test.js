import { describe, it, expect } from 'vitest';
import { toDateStr, getStreak, getLongestStreak, getHeatmapData } from '../js/streak.js';

// local-time-safe date arithmetic for building test fixtures
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateStr(d);
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

// parse YYYY-MM-DD in local time to avoid UTC-midnight timezone issues
function localDayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

// ── toDateStr ──────────────────────────────────────────────────

describe('toDateStr', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(toDateStr(new Date(2025, 0, 5))).toBe('2025-01-05');
  });

  it('zero-pads month and day', () => {
    expect(toDateStr(new Date(2025, 8, 3))).toBe('2025-09-03');
  });

  it('defaults to today and matches YYYY-MM-DD pattern', () => {
    expect(toDateStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── getStreak ──────────────────────────────────────────────────

describe('getStreak', () => {
  it('returns 0 for empty log', () => {
    expect(getStreak({})).toBe(0);
  });

  it('returns 1 if only today is done', () => {
    expect(getStreak({ [daysAgo(0)]: true })).toBe(1);
  });

  it('returns 1 if only yesterday is done', () => {
    expect(getStreak({ [daysAgo(1)]: true })).toBe(1);
  });

  it('returns 2 for today and yesterday', () => {
    expect(getStreak({ [daysAgo(0)]: true, [daysAgo(1)]: true })).toBe(2);
  });

  it('returns 3 for 3 consecutive days ending today', () => {
    const log = { [daysAgo(0)]: true, [daysAgo(1)]: true, [daysAgo(2)]: true };
    expect(getStreak(log)).toBe(3);
  });

  it('returns 0 if today and yesterday are both unchecked', () => {
    // old streak that ended 3+ days ago shouldn't count
    expect(getStreak({ [daysAgo(3)]: true, [daysAgo(4)]: true })).toBe(0);
  });

  it('counts streak ending yesterday when today is unchecked', () => {
    const log = { [daysAgo(1)]: true, [daysAgo(2)]: true, [daysAgo(3)]: true };
    expect(getStreak(log)).toBe(3);
  });

  it('resets on a gap even with today checked', () => {
    const log = { [daysAgo(0)]: true, [daysAgo(3)]: true, [daysAgo(4)]: true };
    expect(getStreak(log)).toBe(1);
  });
});

// ── getLongestStreak ───────────────────────────────────────────

describe('getLongestStreak', () => {
  it('returns 0 for empty log', () => {
    expect(getLongestStreak({})).toBe(0);
  });

  it('returns 1 for a single day', () => {
    expect(getLongestStreak({ [daysAgo(0)]: true })).toBe(1);
  });

  it('returns the run length for one consecutive block', () => {
    const log = { [daysAgo(0)]: true, [daysAgo(1)]: true, [daysAgo(2)]: true };
    expect(getLongestStreak(log)).toBe(3);
  });

  it('returns the longer of two separate runs', () => {
    const log = {
      [daysAgo(10)]: true, [daysAgo(11)]: true,
      [daysAgo(2)]: true,  [daysAgo(3)]: true,  [daysAgo(4)]: true,
    };
    expect(getLongestStreak(log)).toBe(3);
  });

  it('treats non-consecutive days as separate streaks of 1', () => {
    const log = { [daysAgo(0)]: true, [daysAgo(2)]: true };
    expect(getLongestStreak(log)).toBe(1);
  });
});

// ── getHeatmapData ─────────────────────────────────────────────

describe('getHeatmapData', () => {
  it('returns exactly weeks * 7 cells', () => {
    expect(getHeatmapData({}, 12)).toHaveLength(84);
    expect(getHeatmapData({}, 4)).toHaveLength(28);
  });

  it('marks a done day as done', () => {
    const today = daysAgo(0);
    const data = getHeatmapData({ [today]: true });
    expect(data.find(c => c.date === today)?.done).toBe(true);
  });

  it('marks an unchecked day as not done', () => {
    const today = daysAgo(0);
    const data = getHeatmapData({});
    expect(data.find(c => c.date === today)?.done).toBe(false);
  });

  it('marks all cells after today as isFuture', () => {
    const todayStr = daysAgo(0);
    const data = getHeatmapData({}, 12);
    for (const cell of data) {
      if (cell.date > todayStr) expect(cell.isFuture).toBe(true);
      else expect(cell.isFuture).toBe(false);
    }
  });

  it('first cell is a Sunday', () => {
    const data = getHeatmapData({}, 12);
    expect(localDayOfWeek(data[0].date)).toBe(0);
  });

  it('last cell is a Saturday', () => {
    const data = getHeatmapData({}, 12);
    expect(localDayOfWeek(data[data.length - 1].date)).toBe(6);
  });
});
