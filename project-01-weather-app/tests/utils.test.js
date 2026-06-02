import { describe, it, expect } from 'vitest';
import { toFahrenheit, formatTemp, dateToShortDay } from '../js/utils.js';

describe('toFahrenheit', () => {
  it('converts 0°C to 32°F', () => {
    expect(toFahrenheit(0)).toBe(32);
  });

  it('converts 100°C to 212°F', () => {
    expect(toFahrenheit(100)).toBe(212);
  });

  it('converts negative values correctly', () => {
    expect(toFahrenheit(-40)).toBe(-40); // -40 is the same in both units
  });
});

describe('formatTemp', () => {
  it('formats Celsius with rounding', () => {
    expect(formatTemp(18.7, true)).toBe('19°C');
  });

  it('formats Fahrenheit with rounding', () => {
    expect(formatTemp(0, false)).toBe('32°F');
  });

  it('rounds down correctly', () => {
    expect(formatTemp(20.4, true)).toBe('20°C');
  });
});

describe('dateToShortDay', () => {
  it('returns a 3-letter day name', () => {
    const result = dateToShortDay('2026-06-01'); // a Monday
    expect(result).toBe('Mon');
  });

  it('returns a string', () => {
    expect(typeof dateToShortDay('2026-01-01')).toBe('string');
  });
});
