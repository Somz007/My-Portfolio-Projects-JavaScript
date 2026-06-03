import { describe, it, expect } from 'vitest';
import {
  createGame, tick, safeDir, placeFood, getScore,
  COLS, ROWS, INIT_LENGTH,
} from '../js/game.js';

// ── helpers ────────────────────────────────────────────────────

function makeState(overrides = {}) {
  return {
    snake:   [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
    dir:     { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food:    { x: 15, y: 15 },
    ate:     false,
    dead:    false,
    ticks:   0,
    ...overrides,
  };
}

// ── createGame ─────────────────────────────────────────────────

describe('createGame', () => {
  it('starts alive', () => {
    expect(createGame().dead).toBe(false);
  });

  it(`snake has ${INIT_LENGTH} segments`, () => {
    expect(createGame().snake).toHaveLength(INIT_LENGTH);
  });

  it('initial direction is right', () => {
    expect(createGame().dir).toEqual({ x: 1, y: 0 });
  });

  it('food is not placed on the snake', () => {
    const g = createGame();
    const onSnake = g.snake.some(s => s.x === g.food.x && s.y === g.food.y);
    expect(onSnake).toBe(false);
  });
});

// ── tick ───────────────────────────────────────────────────────

describe('tick', () => {
  it('moves the head in its direction', () => {
    const s = tick(makeState());
    expect(s.snake[0]).toEqual({ x: 6, y: 5 });
  });

  it('keeps length the same when not eating', () => {
    expect(tick(makeState()).snake).toHaveLength(3);
  });

  it('grows when the head reaches food', () => {
    const s = tick(makeState({ food: { x: 6, y: 5 } }));
    expect(s.snake).toHaveLength(4);
    expect(s.ate).toBe(true);
  });

  it('places new food after eating', () => {
    const s = tick(makeState({ food: { x: 6, y: 5 } }));
    expect(s.food).not.toEqual({ x: 6, y: 5 });
  });

  it('increments ticks', () => {
    expect(tick(makeState()).ticks).toBe(1);
  });

  it('uses nextDir, not dir, for the move', () => {
    const s = tick(makeState({ dir: { x: 1, y: 0 }, nextDir: { x: 0, y: -1 } }));
    expect(s.snake[0]).toEqual({ x: 5, y: 4 }); // moved up
  });

  it('updates dir to match nextDir after the move', () => {
    const s = tick(makeState({ nextDir: { x: 0, y: -1 } }));
    expect(s.dir).toEqual({ x: 0, y: -1 });
  });

  it('dies on right wall hit', () => {
    const s = tick(makeState({
      snake: [{ x: 19, y: 5 }, { x: 18, y: 5 }],
      food:  { x: 0, y: 0 },
    }), 20, 20);
    expect(s.dead).toBe(true);
  });

  it('dies on left wall hit', () => {
    const s = tick(makeState({
      snake:   [{ x: 0, y: 5 }, { x: 1, y: 5 }],
      dir:     { x: -1, y: 0 },
      nextDir: { x: -1, y: 0 },
      food:    { x: 10, y: 10 },
    }), 20, 20);
    expect(s.dead).toBe(true);
  });

  it('dies on top wall hit', () => {
    const s = tick(makeState({
      snake:   [{ x: 5, y: 0 }, { x: 5, y: 1 }],
      dir:     { x: 0, y: -1 },
      nextDir: { x: 0, y: -1 },
      food:    { x: 10, y: 10 },
    }), 20, 20);
    expect(s.dead).toBe(true);
  });

  it('dies on bottom wall hit', () => {
    const s = tick(makeState({
      snake:   [{ x: 5, y: 19 }, { x: 5, y: 18 }],
      dir:     { x: 0, y: 1 },
      nextDir: { x: 0, y: 1 },
      food:    { x: 10, y: 10 },
    }), 20, 20);
    expect(s.dead).toBe(true);
  });

  it('dies on self collision', () => {
    // snake curls right — head moves into its own body at {4,3}
    const snake = [
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 4, y: 3 }, // target position after move right
      { x: 4, y: 2 }, // tail — excluded from collision check
    ];
    const s = tick(makeState({ snake, food: { x: 0, y: 0 } }), 20, 20);
    expect(s.dead).toBe(true);
  });

  it('does nothing when already dead', () => {
    const dead = makeState({ dead: true, ticks: 7 });
    expect(tick(dead).ticks).toBe(7);
  });
});

// ── placeFood ──────────────────────────────────────────────────

describe('placeFood', () => {
  it('places food within grid bounds', () => {
    const food = placeFood([{ x: 0, y: 0 }], 20, 20);
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(20);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(20);
  });

  it('does not place food on a snake segment', () => {
    // fill all but one cell
    const snake = [];
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 19; x++) snake.push({ x, y });
    }
    const food = placeFood(snake, 20, 20);
    expect(food.x).toBe(19);
  });
});

// ── getScore ───────────────────────────────────────────────────

describe('getScore', () => {
  it('returns 0 for a fresh game', () => {
    expect(getScore(createGame())).toBe(0);
  });

  it('returns snake.length − INIT_LENGTH', () => {
    const g = { snake: Array(7).fill(null).map((_, i) => ({ x: i, y: 0 })) };
    expect(getScore(g)).toBe(7 - INIT_LENGTH);
  });
});

// ── safeDir ────────────────────────────────────────────────────

describe('safeDir', () => {
  it('allows a perpendicular direction change', () => {
    expect(safeDir({ x: 1, y: 0 }, { x: 0, y: -1 })).toEqual({ x: 0, y: -1 });
  });

  it('rejects a 180° reversal', () => {
    expect(safeDir({ x: 1, y: 0 }, { x: -1, y: 0 })).toBeNull();
  });

  it('allows continuing in the same direction', () => {
    expect(safeDir({ x: 0, y: 1 }, { x: 0, y: 1 })).toEqual({ x: 0, y: 1 });
  });

  it('rejects vertical reversal too', () => {
    expect(safeDir({ x: 0, y: -1 }, { x: 0, y: 1 })).toBeNull();
  });
});
