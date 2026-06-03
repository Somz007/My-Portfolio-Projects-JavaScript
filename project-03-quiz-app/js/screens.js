// screens.js — HTML template functions, one per game state

import { CATEGORIES, DIFFICULTIES }   from './config.js';
import { getHighScore }                from './score.js';
import { isSoundEnabled }              from './audio.js';

const OPT_LABELS = ['A', 'B', 'C', 'D'];

// ── Start screen — category + difficulty selector ──────────────
export function startHTML(selCategory, selDiff) {
  const catCards = CATEGORIES.map(c => {
    const active = c.id === selCategory ? 'active' : '';
    return `
      <button class="cat-card ${active}" data-cat-id="${c.id}" type="button">
        <span class="cat-icon">${c.icon}</span>
        <span class="cat-name">${c.short}</span>
      </button>`;
  }).join('');

  const diffBtns = Object.entries(DIFFICULTIES).map(([key, d]) => `
    <button class="diff-pill ${key === selDiff ? 'active' : ''}"
            data-diff="${key}" type="button">
      ${d.icon} ${d.label}
    </button>`).join('');

  const best = getHighScore(selCategory, selDiff);
  const selCat = CATEGORIES.find(c => c.id === selCategory);
  const sound  = isSoundEnabled() ? '🔊' : '🔇';

  return `
    <div class="screen start-screen">
      <div class="start-top">
        <h1 class="quiz-title">Quiz App</h1>
        <button class="icon-btn sound-btn" id="sound-btn" title="Toggle sound">${sound}</button>
      </div>
      <p class="quiz-subtitle">Answer 10 questions fetched live from the web</p>

      <p class="section-label">Category</p>
      <div class="cat-grid" id="cat-grid">${catCards}</div>

      <p class="section-label">Difficulty</p>
      <div class="diff-pills" id="diff-pills">${diffBtns}</div>

      <div class="start-meta">
        <div class="best-score-badge">
          ${best > 0
            ? `🏆 Best: <strong>${best}</strong> pts — ${selCat?.short} · ${DIFFICULTIES[selDiff].label}`
            : `No record yet for ${selCat?.short} · ${DIFFICULTIES[selDiff].label}`}
        </div>
      </div>

      <button class="btn-primary start-btn" id="start-btn" type="button">
        Start Quiz →
      </button>

      <p class="key-hint"><kbd>Enter</kbd> to start</p>
    </div>`;
}

// ── Loading screen ─────────────────────────────────────────────
export function loadingHTML(categoryName, difficulty) {
  return `
    <div class="screen loading-screen">
      <div class="loading-spinner"></div>
      <p class="loading-text">Fetching ${DIFFICULTIES[difficulty].label} questions…</p>
      <p class="loading-sub">${categoryName}</p>
    </div>`;
}

// ── Error screen ───────────────────────────────────────────────
export function errorHTML(message) {
  return `
    <div class="screen error-screen">
      <div class="error-icon">⚠️</div>
      <p class="error-msg">${message}</p>
      <div class="error-actions">
        <button class="btn-primary"   id="retry-btn"  type="button">Try Again</button>
        <button class="btn-secondary" id="back-btn"   type="button">← Back</button>
      </div>
    </div>`;
}

// ── Countdown screen ───────────────────────────────────────────
export function countdownHTML() {
  return `
    <div class="screen countdown-screen">
      <div class="countdown-num" id="countdown-num">3</div>
      <p class="countdown-label">Get ready!</p>
    </div>`;
}

// ── Question screen ────────────────────────────────────────────
export function questionHTML({ question, questionNum, total, score, streak,
                               difficulty, results, lifelines }) {
  const { time } = DIFFICULTIES[difficulty];

  // progress dots — shows history of correct/wrong + current dot
  const dots = Array.from({ length: total }, (_, i) => {
    if (i < results.length) {
      const r = results[i];
      const cls = r.skipped ? 'skipped' : r.correct ? 'correct' : 'wrong';
      return `<span class="pdot ${cls}"></span>`;
    }
    if (i === questionNum - 1) return `<span class="pdot current"></span>`;
    return `<span class="pdot"></span>`;
  }).join('');

  const options = question.options.map((opt, i) => `
    <button class="opt-btn" data-index="${i}" type="button">
      <span class="opt-label">${OPT_LABELS[i]}</span>
      <span class="opt-text">${escapeHtml(opt)}</span>
    </button>`).join('');

  const fiftyClass = lifelines.fifty ? '' : 'used';
  const skipClass  = lifelines.skip  ? '' : 'used';
  const sound      = isSoundEnabled() ? '🔊' : '🔇';

  const streakBadge = streak >= 2
    ? `<span class="streak-badge">🔥 ${streak}</span>` : '';

  return `
    <div class="screen question-screen" id="question-screen">
      <div class="quiz-header">
        <div class="q-left">
          <span class="q-num">Q ${questionNum}/${total}</span>
          <span class="diff-pill-sm">${DIFFICULTIES[difficulty].label}</span>
        </div>
        <div class="q-right">
          ${streakBadge}
          <span class="q-score">⭐ ${score}</span>
          <button class="icon-btn sound-btn" id="sound-btn" title="Toggle sound">${sound}</button>
        </div>
      </div>

      <div class="progress-dots">${dots}</div>

      <div class="timer-wrap">
        <div class="timer-track">
          <div class="timer-fill" id="timer-fill"></div>
        </div>
        <span class="timer-num" id="timer-num">${time}</span>
      </div>

      <div class="question-card">
        <span class="q-category">${escapeHtml(question.category)}</span>
        <p class="q-text">${escapeHtml(question.question)}</p>
      </div>

      <div class="lifelines-row">
        <button class="lifeline-btn ${fiftyClass}" id="fifty-btn"
                data-lifeline="fifty" type="button" title="Remove 2 wrong answers"
                ${lifelines.fifty ? '' : 'disabled'}>
          50:50
        </button>
        <button class="lifeline-btn ${skipClass}" id="skip-btn"
                data-lifeline="skip" type="button" title="Skip this question"
                ${lifelines.skip ? '' : 'disabled'}>
          ⏭ Skip
        </button>
      </div>

      <div class="options-grid" id="options-grid">${options}</div>

      <p class="action-hint" id="action-hint">
        Press <kbd>1</kbd>–<kbd>4</kbd> to answer
      </p>
    </div>`;
}

// ── Results screen ─────────────────────────────────────────────
export function resultsHTML({ score, correct, questions, bestStreak, difficulty,
                              categoryName, isNewRecord, prevBest, results }) {
  const total   = questions.length;
  const pct     = Math.round((correct / total) * 100);
  const skipped = results.filter(r => r.skipped).length;

  const medal = pct === 100 ? '🏆' : pct >= 70 ? '🥈' : pct >= 50 ? '🥉' : '💪';
  const msg   = pct === 100 ? 'Perfect score!'
              : pct >= 70   ? 'Great job!'
              : pct >= 50   ? 'Not bad!'
              :                'Keep practising!';

  const recordBadge = isNewRecord
    ? `<div class="new-record">🏆 New High Score!</div>`
    : prevBest > 0
      ? `<p class="prev-best">Previous best: ${prevBest} pts</p>`
      : '';

  // question review — collapsed by default using <details>
  const reviewItems = results.map((r, i) => {
    const cls  = r.skipped ? 'skipped' : r.correct ? 'correct' : 'wrong';
    const icon = r.skipped ? '⏭' : r.correct ? '✓' : '✗';
    const wrongLine = (!r.correct && !r.skipped)
      ? `<span class="review-answer">Answer: ${escapeHtml(r.correctAnswer)}</span>`
      : '';
    return `
      <div class="review-item ${cls}">
        <span class="review-icon">${icon}</span>
        <div class="review-body">
          <span class="review-q">${i + 1}. ${escapeHtml(r.question)}</span>
          ${wrongLine}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="screen results-screen">
      <div class="result-top">
        <div class="result-medal">${medal}</div>
        <p class="result-msg">${msg}</p>
        <div class="result-score" id="result-score">0</div>
        <p class="result-score-label">points</p>
        ${recordBadge}
      </div>

      <div class="result-stats">
        <div class="stat-card">
          <div class="stat-value">${correct}/${total}</div>
          <div class="stat-label">Correct</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${pct}%</div>
          <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">🔥 ${bestStreak}</div>
          <div class="stat-label">Best streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:var(--diff-color)">
            ${DIFFICULTIES[difficulty].label}
          </div>
          <div class="stat-label">Difficulty</div>
        </div>
      </div>

      <details class="review-section">
        <summary>Review questions (${correct}/${total} correct${skipped > 0 ? `, ${skipped} skipped` : ''})</summary>
        <div class="review-list">${reviewItems}</div>
      </details>

      <div class="result-actions">
        <button class="btn-primary"   id="play-again-btn"  type="button">Play Again</button>
        <button class="btn-secondary" id="change-cat-btn"  type="button">Change Category</button>
      </div>

      <button class="share-btn" id="share-btn" type="button">📋 Copy Score</button>

      <p class="key-hint"><kbd>Enter</kbd> to play again · <kbd>Escape</kbd> for categories</p>
    </div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
