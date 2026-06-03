import { describe, it, expect, beforeEach } from 'vitest';
import {
  setRate, convert, toZAR, money,
  setCurrency, getCurrencyCode, getCurrencySymbol,
} from '../js/config.js';

beforeEach(() => {
  localStorage.clear();
  setRate(1); // reset module rate between tests
});

describe('currency code', () => {
  it('defaults to ZAR', () => {
    expect(getCurrencyCode()).toBe('ZAR');
    expect(getCurrencySymbol()).toBe('R');
  });

  it('persists a chosen currency', () => {
    setCurrency('USD');
    expect(getCurrencyCode()).toBe('USD');
    expect(getCurrencySymbol()).toBe('$');
  });
});

describe('convert', () => {
  it('returns the same value at rate 1 (ZAR base)', () => {
    setRate(1);
    expect(convert(100)).toBe(100);
  });

  it('multiplies by the active rate', () => {
    setRate(0.05); // ~USD per ZAR
    expect(convert(100)).toBeCloseTo(5);
  });
});

describe('toZAR', () => {
  it('is the inverse of convert', () => {
    setRate(0.05);
    const zar = 250;
    expect(toZAR(convert(zar))).toBeCloseTo(zar);
  });

  it('converts an active-currency amount back to ZAR', () => {
    setRate(0.05);
    expect(toZAR(5)).toBeCloseTo(100);
  });
});

describe('money', () => {
  it('formats ZAR with symbol and two decimals', () => {
    setCurrency('ZAR');
    setRate(1);
    expect(money(1234.5)).toBe('R1,234.50');
  });

  it('converts and formats into the active currency', () => {
    setCurrency('USD');
    setRate(0.05);
    expect(money(100)).toBe('$5.00');
  });

  it('drops decimals for JPY', () => {
    setCurrency('JPY');
    setRate(8); // ~JPY per ZAR
    expect(money(100)).toBe('¥800');
  });
});
