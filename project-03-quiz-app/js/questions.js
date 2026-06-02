// question bank — 12 per difficulty, 10 picked randomly each game
// each question: { question, options[4], correct (index), category }

export const QUESTIONS = {

  easy: [
    {
      question: 'What does HTML stand for?',
      options: ['HyperText Markup Language', 'HighText Machine Language', 'HyperText Markdown Language', 'HyperTransfer Markup Language'],
      correct: 0, category: 'HTML',
    },
    {
      question: 'Which CSS symbol targets an element by its ID?',
      options: ['. (dot)', '# (hash)', '* (star)', '@ (at)'],
      correct: 1, category: 'CSS',
    },
    {
      question: 'What does `typeof null` return in JavaScript?',
      options: ['"null"', '"undefined"', '"object"', '"number"'],
      correct: 2, category: 'JavaScript',
    },
    {
      question: 'Which HTML element creates the largest heading?',
      options: ['<h6>', '<head>', '<h1>', '<header>'],
      correct: 2, category: 'HTML',
    },
    {
      question: 'Which array method adds an item to the END?',
      options: ['unshift()', 'push()', 'pop()', 'shift()'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does `2 + "3"` evaluate to in JavaScript?',
      options: ['5', '23', '"23"', 'TypeError'],
      correct: 2, category: 'JavaScript',
    },
    {
      question: 'Which event fires when a user submits a form?',
      options: ['"click"', '"submit"', '"change"', '"input"'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does CSS stand for?',
      options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'],
      correct: 1, category: 'CSS',
    },
    {
      question: 'Which keyword declares a constant in JavaScript?',
      options: ['var', 'let', 'const', 'def'],
      correct: 2, category: 'JavaScript',
    },
    {
      question: 'What does DOM stand for?',
      options: ['Document Object Model', 'Data Object Model', 'Display Object Model', 'Document Orientation Model'],
      correct: 0, category: 'JavaScript',
    },
    {
      question: 'Which HTML tag creates a hyperlink?',
      options: ['<link>', '<href>', '<a>', '<url>'],
      correct: 2, category: 'HTML',
    },
    {
      question: 'What does `===` check in JavaScript?',
      options: ['Value only', 'Type only', 'Value AND type', 'Reference equality'],
      correct: 2, category: 'JavaScript',
    },
  ],

  medium: [
    {
      question: 'What is a closure in JavaScript?',
      options: ['A function that runs immediately', 'A function that retains access to its outer scope', 'A method for closing HTTP connections', 'A way to prevent code execution'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does `Array.prototype.map()` return?',
      options: ['The original array modified in place', 'A boolean', 'A new array with transformed elements', 'The first matching element'],
      correct: 2, category: 'JavaScript',
    },
    {
      question: 'What is the key difference between `let` and `var`?',
      options: ['let is global, var is local', 'let is block-scoped, var is function-scoped', 'They are completely identical', 'var cannot be reassigned'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does `Promise.all()` do?',
      options: ['Runs promises one by one sequentially', 'Resolves when ALL resolve; rejects if any fail', 'Returns the first promise to resolve', 'Silently ignores failed promises'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does the spread operator `...` do?',
      options: ['Creates a loop over an object', 'Deep copies a class', 'Expands an iterable into individual elements', 'Merges two functions'],
      correct: 2, category: 'JavaScript',
    },
    {
      question: 'What is event delegation?',
      options: ['Removing event listeners after use', 'Attaching one listener to a parent to handle child events', 'Delaying event execution with setTimeout', 'Preventing events from bubbling'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does `async/await` primarily enable?',
      options: ['True parallel execution on multiple threads', 'Writing asynchronous code that reads synchronously', 'Blocking the main thread until a task completes', 'Automatically cancelling stale promises'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does `Array.prototype.reduce()` do?',
      options: ['Removes duplicate values from an array', 'Reduces array length by one', 'Accumulates array values into a single result', 'Filters elements by a condition'],
      correct: 2, category: 'JavaScript',
    },
    {
      question: 'What is `localStorage`?',
      options: ['Server-side session storage', 'Browser storage cleared when the tab closes', 'Browser key-value storage that persists across sessions', 'An encrypted cookie storage'],
      correct: 2, category: 'Web APIs',
    },
    {
      question: 'What does `display: flex` do in CSS?',
      options: ['Hides the element visually', 'Makes the element a flex container', 'Aligns text to the left', 'Adds a border to the element'],
      correct: 1, category: 'CSS',
    },
    {
      question: 'What is a CSS custom property?',
      options: ['A shorthand for multiple properties', 'A browser-specific extension property', 'A reusable variable declared with a -- prefix', 'An animation timing function'],
      correct: 2, category: 'CSS',
    },
    {
      question: 'What does `fetch()` return?',
      options: ['The response data directly', 'A Promise resolving to a Response object', 'An XMLHttpRequest object', 'null until the request completes'],
      correct: 1, category: 'Web APIs',
    },
  ],

  hard: [
    {
      question: 'What is the time complexity of `Array.prototype.indexOf()`?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correct: 2, category: 'CS Concepts',
    },
    {
      question: 'What does `0.1 + 0.2 === 0.3` evaluate to in JavaScript?',
      options: ['true', 'false', 'undefined', 'NaN'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What is a JavaScript Proxy?',
      options: ['A type of Promise wrapper', 'An object that intercepts and redefines operations on another object', 'A network request middleware', 'A caching layer for DOM queries'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'When do microtasks run relative to macrotasks?',
      options: ['After all macrotasks complete', 'Before macrotasks, once the current call stack clears', 'In a completely separate thread', 'Only when explicitly scheduled with queueMicrotask()'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does tree shaking do in a JavaScript bundler?',
      options: ['Removes unused DOM nodes at runtime', 'Eliminates unused exports from the final bundle', 'Optimises CSS selector specificity', 'Garbage collects unreachable variables'],
      correct: 1, category: 'Tooling',
    },
    {
      question: 'What is memoization?',
      options: ['Storing module state in a database', 'Caching function return values for repeated inputs', 'A type of tail-call recursive pattern', 'Compressing JavaScript at build time'],
      correct: 1, category: 'CS Concepts',
    },
    {
      question: 'What does `Object.freeze()` do?',
      options: ['Prevents all property access', 'Creates a deep clone of an object', 'Prevents properties from being added, changed, or removed', 'Converts the object to an immutable JSON string'],
      correct: 2, category: 'JavaScript',
    },
    {
      question: 'What makes a WeakMap different from a regular Map?',
      options: ['WeakMap has a fixed maximum size', 'WeakMap keys are weakly referenced and garbage collectable', 'WeakMap is always slower than Map', 'WeakMap only accepts string keys'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does CORS stand for?',
      options: ['Cross-Origin Resource Sharing', 'Client-Oriented Request System', 'Cross-Object Rendering Standard', 'Cached Origin Response Service'],
      correct: 0, category: 'Web APIs',
    },
    {
      question: 'What is the key difference between `Function.call()` and `Function.apply()`?',
      options: ['call() is async, apply() is sync', 'call() passes args individually; apply() passes them as an array', 'They are functionally identical in modern JS', 'apply() is deprecated in ES6+'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does `Symbol.iterator` define on an object?',
      options: ['A unique ID for comparing objects', 'How the object is iterated with a for...of loop', 'The display order of object properties', 'Whether the object can be used as a Map key'],
      correct: 1, category: 'JavaScript',
    },
    {
      question: 'What does `requestAnimationFrame()` do?',
      options: ['Delays code by exactly 16ms', 'Schedules a callback before the next browser repaint', 'Runs code on a separate thread', 'Throttles expensive event handlers automatically'],
      correct: 1, category: 'Web APIs',
    },
  ],

};

// picks `count` random questions from the given difficulty pool
export function pickQuestions(difficulty, count) {
  const pool    = [...QUESTIONS[difficulty]];
  const picked  = [];
  while (picked.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}
