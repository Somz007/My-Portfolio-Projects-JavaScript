// app.js — state transitions, event delegation, keyboard shortcuts

import { DIFFICULTIES, QUESTIONS_PER_GAME } from './config.js';
import { fetchQuestions }                    from './api.js';
import { state, resetGame, getCategoryName } from './state.js';
import { startTimer, stopTimer, delay }      from './timer.js';
import { calcPoints, getHighScore, saveHighScore } from './score.js';
import { playCorrect, playWrong, playTick, playCountdown, playStart, toggleSound, isSoundEnabled } from './audio.js';
import { startHTML, loadingHTML, errorHTML, countdownHTML, questionHTML, resultsHTML } from './screens.js';

const app = document.getElementById('app');

// ── Helpers ────────────────────────────────────────────────────
function go(html) { app.innerHTML = html; }

function setDiffColor(difficulty) {
  document.documentElement.style.setProperty('--diff-color', DIFFICULTIES[difficulty].color);
}

function animateCount(el, target, duration) {
  if (!el) return;
  const start = performance.now();
  function frame(now) {
    const p     = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target);
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = target;
  }
  requestAnimationFrame(frame);
}

// ── Screens ────────────────────────────────────────────────────
function showStart() {
  state.screen = 'start';
  setDiffColor(state.difficulty);
  go(startHTML(state.categoryId, state.difficulty));
}

async function startGame() {
  state.screen = 'loading';
  setDiffColor(state.difficulty);
  go(loadingHTML(getCategoryName(state.categoryId), state.difficulty));

  try {
    const questions = await fetchQuestions(state.categoryId, state.difficulty, QUESTIONS_PER_GAME);
    resetGame(state.categoryId, state.difficulty, questions);
    showCountdown();
  } catch (err) {
    state.screen = 'error';
    go(errorHTML(err.message));
  }
}

async function showCountdown() {
  state.screen = 'countdown';
  go(countdownHTML());

  for (const val of [3, 2, 1, 'GO!']) {
    const el = document.getElementById('countdown-num');
    if (!el) return;
    el.textContent = String(val);
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    if (val !== 'GO!') playCountdown();
    else playStart();
    await delay(val === 'GO!' ? 600 : 850);
  }

  showQuestion();
}

function showQuestion() {
  state.screen   = 'question';
  state.answered = false;

  const q         = state.questions[state.current];
  const timeLimit = DIFFICULTIES[state.difficulty].time;

  go(questionHTML({
    question:    q,
    questionNum: state.current + 1,
    total:       state.questions.length,
    score:       state.score,
    streak:      state.streak,
    difficulty:  state.difficulty,
    results:     state.results,
    lifelines:   state.lifelines,
  }));

  // CSS transition for timer bar (smooth, no per-frame JS)
  const fill = document.getElementById('timer-fill');
  fill.style.transition = 'none';
  fill.style.width      = '100%';
  fill.getBoundingClientRect();
  fill.style.transition = `width ${timeLimit}s linear`;
  fill.style.width      = '0%';

  startTimer(
    timeLimit,
    remaining => {
      state.timeLeft = remaining;
      const numEl = document.getElementById('timer-num');
      if (numEl) numEl.textContent = remaining;
      // colour warning and tick sound in last 5s
      if (fill) {
        fill.classList.toggle('warn',   remaining <= Math.floor(timeLimit * 0.5) && remaining > 5);
        fill.classList.toggle('danger', remaining <= 5);
      }
      if (remaining <= 5 && remaining > 0) playTick();
    },
    () => handleTimeUp(),
  );
}

function showResults() {
  state.screen = 'results';
  stopTimer();

  const isNewRecord = saveHighScore(state.categoryId, state.difficulty, state.score);
  const prevBest    = isNewRecord ? 0 : getHighScore(state.categoryId, state.difficulty);

  go(resultsHTML({
    score:        state.score,
    correct:      state.correct,
    questions:    state.questions,
    bestStreak:   state.bestStreak,
    difficulty:   state.difficulty,
    categoryName: getCategoryName(state.categoryId),
    isNewRecord,
    prevBest,
    results:      state.results,
  }));

  animateCount(document.getElementById('result-score'), state.score, 1400);
}

// ── Answer handling ────────────────────────────────────────────
function handleAnswer(selectedIndex) {
  if (state.answered) return;
  state.answered = true;
  stopTimer();

  const q         = state.questions[state.current];
  const isCorrect = selectedIndex === q.correct;
  let   pts       = 0;

  if (isCorrect) {
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
    pts           = calcPoints(state.timeLeft, state.difficulty, state.streak);
    state.score  += pts;
    state.correct++;
    playCorrect();
  } else {
    state.streak = 0;
    playWrong();
  }

  state.results.push({
    correct:       isCorrect,
    skipped:       false,
    question:      q.question,
    correctAnswer: q.options[q.correct],
  });

  revealAnswer(q.correct, selectedIndex, pts, isCorrect);
}

function handleTimeUp() {
  if (state.answered) return;
  state.answered = true;

  const q = state.questions[state.current];
  state.streak = 0;
  playWrong();

  state.results.push({
    correct:       false,
    skipped:       false,
    question:      q.question,
    correctAnswer: q.options[q.correct],
  });

  revealAnswer(q.correct, -1, 0, false);
}

// modifies existing question DOM — no full re-render
function revealAnswer(correctIndex, selectedIndex, pts, isCorrect) {
  document.querySelectorAll('.opt-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIndex)                        btn.classList.add('correct');
    else if (i === selectedIndex && !isCorrect)    btn.classList.add('wrong');
    else                                           btn.classList.add('dimmed');
  });

  // disable lifeline buttons too
  document.querySelectorAll('.lifeline-btn').forEach(b => b.disabled = true);

  const hint = document.getElementById('action-hint');
  if (!hint) return;

  if (selectedIndex === -1) {
    hint.innerHTML = `<span class="feedback-wrong">⏱ Time's up!</span> — Press <kbd>Enter</kbd> to continue`;
  } else if (isCorrect) {
    hint.innerHTML = `<span class="feedback-correct">✓ +${pts} pts</span> — Press <kbd>Enter</kbd> to continue`;
  } else {
    hint.innerHTML = `<span class="feedback-wrong">✗ Incorrect</span> — Press <kbd>Enter</kbd> to continue`;
  }

  const isLast = state.current + 1 >= state.questions.length;
  const cont   = document.createElement('button');
  cont.type      = 'button';
  cont.className = 'continue-btn';
  cont.id        = 'continue-btn';
  cont.textContent = isLast ? 'See Results →' : 'Next Question →';
  document.getElementById('options-grid').after(cont);
}

function handleContinue() {
  state.current++;
  state.current < state.questions.length ? showQuestion() : showResults();
}

// ── Lifelines ──────────────────────────────────────────────────
function useFiftyFifty() {
  if (!state.lifelines.fifty || state.answered) return;
  state.lifelines.fifty = false;

  const q        = state.questions[state.current];
  const wrongIdx = [0, 1, 2, 3].filter(i => i !== q.correct);
  // keep one random wrong answer, eliminate the other two
  const keep     = wrongIdx[Math.floor(Math.random() * wrongIdx.length)];
  wrongIdx.filter(i => i !== keep).forEach(i => {
    const btn = document.querySelector(`.opt-btn[data-index="${i}"]`);
    if (btn) { btn.classList.add('eliminated'); btn.disabled = true; }
  });

  const btn = document.getElementById('fifty-btn');
  if (btn) { btn.classList.add('used'); btn.disabled = true; }
}

function useSkip() {
  if (!state.lifelines.skip || state.answered) return;
  state.answered       = true;
  state.lifelines.skip = false;
  state.streak         = 0;
  stopTimer();

  const q = state.questions[state.current];
  state.results.push({
    correct: false, skipped: true,
    question: q.question,
    correctAnswer: q.options[q.correct],
  });

  state.current++;
  state.current < state.questions.length ? showQuestion() : showResults();
}

// ── Event delegation ───────────────────────────────────────────
app.addEventListener('click', e => {

  // sound toggle (appears on start and question screens)
  if (e.target.closest('.sound-btn')) {
    const on = toggleSound();
    document.querySelectorAll('.sound-btn').forEach(b => b.textContent = on ? '🔊' : '🔇');
    return;
  }

  if (state.screen === 'start') {
    const catCard = e.target.closest('.cat-card');
    if (catCard) {
      state.categoryId = parseInt(catCard.dataset.catId, 10);
      go(startHTML(state.categoryId, state.difficulty));
      return;
    }

    const diffPill = e.target.closest('.diff-pill');
    if (diffPill) {
      state.difficulty = diffPill.dataset.diff;
      setDiffColor(state.difficulty);
      go(startHTML(state.categoryId, state.difficulty));
      return;
    }

    if (e.target.closest('#start-btn')) { startGame(); return; }
  }

  if (state.screen === 'error') {
    if (e.target.closest('#retry-btn'))  { startGame();  return; }
    if (e.target.closest('#back-btn'))   { showStart(); return; }
  }

  if (state.screen === 'question') {
    const opt = e.target.closest('.opt-btn');
    if (opt && !state.answered) { handleAnswer(parseInt(opt.dataset.index, 10)); return; }

    if (e.target.closest('#fifty-btn')) { useFiftyFifty(); return; }
    if (e.target.closest('#skip-btn'))  { useSkip();       return; }
    if (e.target.closest('#continue-btn')) { handleContinue(); return; }
  }

  if (state.screen === 'results') {
    if (e.target.closest('#play-again-btn'))  { startGame();  return; }
    if (e.target.closest('#change-cat-btn'))  { showStart();  return; }

    if (e.target.closest('#share-btn')) {
      const catName = getCategoryName(state.categoryId);
      const diff    = DIFFICULTIES[state.difficulty].label;
      const text    = `I scored ${state.score} pts on Quiz App!\nCategory: ${catName} · ${diff}\nCorrect: ${state.correct}/${state.questions.length} · Best streak: 🔥 ${state.bestStreak}`;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('share-btn');
        if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy Score'; }, 2000); }
      }).catch(() => {});
      return;
    }
  }
});

// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  const { screen } = state;

  if (screen === 'start' && e.key === 'Enter') { startGame(); return; }

  if (screen === 'question' && !state.answered && ['1','2','3','4'].includes(e.key)) {
    handleAnswer(parseInt(e.key, 10) - 1);
    return;
  }

  if (screen === 'question' && state.answered && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    handleContinue();
    return;
  }

  if (screen === 'results') {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startGame(); return; }
    if (e.key === 'Escape') { showStart(); return; }
  }
});

// ── Boot ───────────────────────────────────────────────────────
showStart();
