import { describe, it, expect } from 'vitest';
import {
  sumByCategory, sumByMonth, lastNMonths,
  filterExpenses, sortExpenses,
  formatAmount, formatMonth, pctChange,
} from '../js/filters.js';

const sample = [
  { id: '1', category: 'food',      amount: 50,  date: '2026-06-01', createdAt: 1 },
  { id: '2', category: 'food',      amount: 30,  date: '2026-06-05', createdAt: 2 },
  { id: '3', category: 'transport', amount: 20,  date: '2026-06-03', createdAt: 3 },
  { id: '4', category: 'health',    amount: 100, date: '2026-05-20', createdAt: 4 },
];

describe('sumByCategory', () => {
  it('sums correctly', () => {
    const result = sumByCategory(sample);
    expect(result.food).toBe(80);
    expect(result.transport).toBe(20);
    expect(result.health).toBe(100);
  });

  it('returns empty object for empty input', () => {
    expect(sumByCategory([])).toEqual({});
  });
});

describe('sumByMonth', () => {
  it('groups by YYYY-MM correctly', () => {
    const result = sumByMonth(sample);
    expect(result['2026-06']).toBe(100);
    expect(result['2026-05']).toBe(100);
  });
});

describe('lastNMonths', () => {
  it('returns the correct number of months', () => {
    expect(lastNMonths(6)).toHaveLength(6);
  });

  it('last entry is current month', () => {
    const now   = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const last  = lastNMonths(3);
    expect(last[last.length - 1]).toBe(month);
  });
});

describe('filterExpenses', () => {
  it('returns all when no filters', () => {
    expect(filterExpenses(sample)).toHaveLength(4);
  });

  it('filters by category', () => {
    const result = filterExpenses(sample, { category: 'food' });
    expect(result).toHaveLength(2);
    expect(result.every(e => e.category === 'food')).toBe(true);
  });

  it('filters by startDate', () => {
    const result = filterExpenses(sample, { startDate: '2026-06-03' });
    expect(result.every(e => e.date >= '2026-06-03')).toBe(true);
  });

  it('filters by endDate', () => {
    const result = filterExpenses(sample, { endDate: '2026-05-31' });
    expect(result.every(e => e.date <= '2026-05-31')).toBe(true);
  });

  it('filters by search term (case insensitive)', () => {
    const data = [
      { ...sample[0], description: 'Grocery run' },
      { ...sample[1], description: 'Restaurant' },
    ];
    const result = filterExpenses(data, { search: 'grocery' });
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Grocery run');
  });
});

describe('sortExpenses', () => {
  it('sorts newest first by default', () => {
    const result = sortExpenses(sample, 'newest');
    expect(result[0].date >= result[1].date).toBe(true);
  });

  it('sorts highest amount first', () => {
    const result = sortExpenses(sample, 'highest');
    expect(result[0].amount).toBe(100);
  });

  it('sorts lowest amount first', () => {
    const result = sortExpenses(sample, 'lowest');
    expect(result[0].amount).toBe(20);
  });

  it('does not mutate the original array', () => {
    const original = [...sample];
    sortExpenses(sample, 'highest');
    expect(sample).toEqual(original);
  });
});

describe('formatAmount', () => {
  it('formats integers with two decimal places', () => {
    expect(formatAmount(100)).toBe('100.00');
  });

  it('formats large numbers with commas', () => {
    expect(formatAmount(1234.5)).toBe('1,234.50');
  });
});

describe('pctChange', () => {
  it('calculates positive change correctly', () => {
    expect(pctChange(150, 100)).toBeCloseTo(50);
  });

  it('calculates negative change correctly', () => {
    expect(pctChange(80, 100)).toBeCloseTo(-20);
  });

  it('returns null when previous is 0', () => {
    expect(pctChange(100, 0)).toBeNull();
  });
});
