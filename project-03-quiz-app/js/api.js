// api.js — OpenTDB question fetching
//
// OpenTDB is free, no API key needed.
// Questions come HTML-encoded, so we decode them before returning.

const BASE = 'https://opentdb.com/api.php';

// decodes HTML entities (e.g. &amp; → &, &#039; → ')
// only safe to call in a browser environment
function decodeHtml(str) {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

// Fisher-Yates shuffle — used to randomise option order
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j  = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// converts a raw OpenTDB result into our internal question format
function processQuestion(raw) {
  const correct  = decodeHtml(raw.correct_answer);
  const options  = shuffle([correct, ...raw.incorrect_answers.map(decodeHtml)]);
  return {
    question:  decodeHtml(raw.question),
    options,
    correct:   options.indexOf(correct), // index after shuffling
    category:  decodeHtml(raw.category),
  };
}

// OpenTDB response codes:
//   0 = success
//   1 = no results for this category/difficulty combination
//   2 = invalid parameter
//   5 = rate limited (max 1 request per 5s)
export async function fetchQuestions(categoryId, difficulty, amount = 10) {
  const url = `${BASE}?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Network error (${res.status}). Check your connection.`);

  const data = await res.json();

  if (data.response_code === 1) {
    throw new Error('Not enough questions for this category and difficulty. Try a different combination.');
  }
  if (data.response_code === 5) {
    throw new Error('Too many requests. Wait a moment and try again.');
  }
  if (data.response_code !== 0) {
    throw new Error(`Could not load questions (code ${data.response_code}).`);
  }

  return data.results.map(processQuestion);
}
