// game.js — pure snake logic, no DOM, fully testable

export const COLS        = 20;
export const ROWS        = 20;
export const INIT_LENGTH = 3;

export function createGame() {
  const snake = [
    { x: 12, y: 10 },
    { x: 11, y: 10 },
    { x: 10, y: 10 },
  ];
  return {
    snake,
    dir:    { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food:   placeFood(snake, COLS, ROWS),
    ate:    false,
    dead:   false,
    ticks:  0,
  };
}

// returns null when the proposed dir is a 180° reversal (forbidden)
export function safeDir(current, proposed) {
  if (current.x + proposed.x === 0 && current.y + proposed.y === 0) return null;
  return proposed;
}

// advances the game by one step; returns a new state object
export function tick(state, cols = COLS, rows = ROWS) {
  if (state.dead) return state;

  const { nextDir: dir, snake, food } = state;
  const head = snake[0];
  const next = { x: head.x + dir.x, y: head.y + dir.y };

  // wall collision
  if (next.x < 0 || next.x >= cols || next.y < 0 || next.y >= rows) {
    return { ...state, dead: true, dir };
  }

  // self collision — tail moves away so exclude it from the check
  const body = snake.slice(0, snake.length - 1);
  if (body.some(s => s.x === next.x && s.y === next.y)) {
    return { ...state, dead: true, dir };
  }

  const ateFood = next.x === food.x && next.y === food.y;
  const newSnake = [next, ...snake];
  if (!ateFood) newSnake.pop();

  return {
    ...state,
    snake:   newSnake,
    dir,
    nextDir: dir,
    food:    ateFood ? placeFood(newSnake, cols, rows) : food,
    ate:     ateFood,
    dead:    false,
    ticks:   state.ticks + 1,
  };
}

// random empty cell — exported so tests can verify the constraints
export function placeFood(snake, cols, rows) {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
  const free = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (!free.length) return snake[0]; // board full — shouldn't happen in practice
  return free[Math.floor(Math.random() * free.length)];
}

export function getScore(state) {
  return state.snake.length - INIT_LENGTH;
}
