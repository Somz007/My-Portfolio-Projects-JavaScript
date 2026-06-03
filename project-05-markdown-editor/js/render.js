// render.js — DOM updates: preview, document list, status bar

import { parseMarkdown, countWords, countChars, readingTime } from './parser.js';

const previewEl = document.getElementById('preview');
const docListEl = document.getElementById('doc-list');
const wordsEl   = document.getElementById('stat-words');
const charsEl   = document.getElementById('stat-chars');
const timeEl    = document.getElementById('stat-time');
const savedEl   = document.getElementById('saved-indicator');

// render markdown → preview pane
export function renderPreview(markdown) {
  previewEl.innerHTML = parseMarkdown(markdown);
}

// render the sidebar document list
export function renderDocList(docs, activeId) {
  docListEl.innerHTML = docs.map(doc => {
    const active  = doc.id === activeId ? 'active' : '';
    const preview = doc.content.replace(/[#*`>\-\[\]]/g, '').trim().slice(0, 40) || 'Empty document';
    return `
      <div class="doc-item ${active}" data-id="${doc.id}">
        <div class="doc-item-body">
          <span class="doc-item-title">${escapeText(doc.title)}</span>
          <span class="doc-item-preview">${escapeText(preview)}</span>
        </div>
        <button class="doc-delete" data-id="${doc.id}" title="Delete" aria-label="Delete document">🗑</button>
      </div>`;
  }).join('');
}

// update word/char/reading-time counters
export function renderStats(markdown) {
  wordsEl.textContent = `${countWords(markdown)} words`;
  charsEl.textContent = `${countChars(markdown)} chars`;
  const t = readingTime(markdown);
  timeEl.textContent  = t === 0 ? '—' : `${t} min read`;
}

// briefly flash a "Saved" indicator
let savedTimer = null;
export function flashSaved() {
  savedEl.textContent = '✓ Saved';
  savedEl.classList.add('visible');
  if (savedTimer) clearTimeout(savedTimer);
  savedTimer = setTimeout(() => savedEl.classList.remove('visible'), 1500);
}

// small helper for the doc list — keeps titles/previews from breaking the markup
function escapeText(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
