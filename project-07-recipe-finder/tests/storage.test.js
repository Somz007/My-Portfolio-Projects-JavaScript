import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFavourites, isFavourite, addFavourite,
  removeFavourite, toggleFavourite,
} from '../js/storage.js';

const card = (id, name = `Recipe ${id}`) => ({
  idMeal:       id,
  strMeal:      name,
  strMealThumb: `https://example.com/${id}.jpg`,
  strCategory:  'Test',
  strArea:      'British',
});

beforeEach(() => localStorage.clear());

// ── getFavourites ───────────────────────────────────────────────

describe('getFavourites', () => {
  it('returns [] when storage is empty', () => {
    expect(getFavourites()).toEqual([]);
  });

  it('returns all added favourites', () => {
    addFavourite(card('1'));
    addFavourite(card('2'));
    const ids = getFavourites().map(f => f.idMeal).sort();
    expect(ids).toEqual(['1', '2']);
  });
});

// ── isFavourite ─────────────────────────────────────────────────

describe('isFavourite', () => {
  it('returns false for an unknown id', () => {
    expect(isFavourite('999')).toBe(false);
  });

  it('returns true after adding', () => {
    addFavourite(card('42'));
    expect(isFavourite('42')).toBe(true);
  });

  it('returns false after removing', () => {
    addFavourite(card('42'));
    removeFavourite('42');
    expect(isFavourite('42')).toBe(false);
  });
});

// ── addFavourite ────────────────────────────────────────────────

describe('addFavourite', () => {
  it('stores the card and makes it retrievable', () => {
    const c = card('10', 'Pasta');
    addFavourite(c);
    const favs = getFavourites();
    expect(favs).toHaveLength(1);
    expect(favs[0].strMeal).toBe('Pasta');
  });

  it('is idempotent — adding the same id twice yields one entry', () => {
    addFavourite(card('5'));
    addFavourite(card('5'));
    expect(getFavourites()).toHaveLength(1);
  });

  it('updates the stored card if the same id is added again', () => {
    addFavourite(card('5', 'Old Name'));
    addFavourite(card('5', 'New Name'));
    expect(getFavourites()[0].strMeal).toBe('New Name');
  });
});

// ── removeFavourite ─────────────────────────────────────────────

describe('removeFavourite', () => {
  it('removes a stored favourite', () => {
    addFavourite(card('7'));
    removeFavourite('7');
    expect(getFavourites()).toHaveLength(0);
  });

  it('is a no-op for an unknown id', () => {
    addFavourite(card('7'));
    removeFavourite('999'); // doesn't exist — should not throw
    expect(getFavourites()).toHaveLength(1);
  });

  it('leaves other favourites untouched', () => {
    addFavourite(card('1'));
    addFavourite(card('2'));
    addFavourite(card('3'));
    removeFavourite('2');
    const ids = getFavourites().map(f => f.idMeal).sort();
    expect(ids).toEqual(['1', '3']);
  });
});

// ── toggleFavourite ─────────────────────────────────────────────

describe('toggleFavourite', () => {
  it('adds a new favourite and returns true', () => {
    const result = toggleFavourite(card('20'));
    expect(result).toBe(true);
    expect(isFavourite('20')).toBe(true);
  });

  it('removes an existing favourite and returns false', () => {
    addFavourite(card('20'));
    const result = toggleFavourite(card('20'));
    expect(result).toBe(false);
    expect(isFavourite('20')).toBe(false);
  });

  it('toggling twice restores original state', () => {
    toggleFavourite(card('20'));
    toggleFavourite(card('20'));
    expect(isFavourite('20')).toBe(false);
    expect(getFavourites()).toHaveLength(0);
  });

  it('does not affect other favourites when removing', () => {
    addFavourite(card('A'));
    addFavourite(card('B'));
    toggleFavourite(card('A'));
    expect(isFavourite('A')).toBe(false);
    expect(isFavourite('B')).toBe(true);
  });
});
