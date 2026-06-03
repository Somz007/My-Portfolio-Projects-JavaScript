// app.js — events, state, orchestration

import { getDocs, getDoc, createDoc, updateDoc, deleteDoc,
         getActiveId, setActiveId, getTheme, setTheme,
         seedIfEmpty }                                from './storage.js';
import { renderPreview, renderDocList,
         renderStats, flashSaved }                    from './render.js';
import { applyFormat }                                from './toolbar.js';
import { parseMarkdown }                              from './parser.js';

// ── State ──────────────────────────────────────────────────────
let activeId = null;

// ── DOM refs ───────────────────────────────────────────────────
const textarea    = document.getElementById('editor');
const titleInput  = document.getElementById('doc-title');
const toolbar     = document.getElementById('toolbar');
const docList     = document.getElementById('doc-list');
const newBtn      = document.getElementById('new-doc-btn');
const exportMdBtn = document.getElementById('export-md-btn');
const exportHtmlBtn = document.getElementById('export-html-btn');
const themeBtn    = document.getElementById('theme-btn');
const helpBtn     = document.getElementById('help-btn');
const helpOverlay = document.getElementById('help-overlay');
const helpClose   = document.getElementById('help-close');
const sidebarBtn  = document.getElementById('sidebar-toggle');
const sidebar     = document.getElementById('sidebar');
const divider     = document.getElementById('divider');
const editorPane  = document.getElementById('editor-pane');
const previewPane = document.getElementById('preview-pane');
const workspace   = document.getElementById('workspace');

// ── Small debounce helper ──────────────────────────────────────
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// ── Load a document into the editor ────────────────────────────
function loadDoc(id) {
  const doc = getDoc(id);
  if (!doc) return;
  activeId          = id;
  setActiveId(id);
  textarea.value    = doc.content;
  titleInput.value  = doc.title;
  renderPreview(doc.content);
  renderStats(doc.content);
  refreshList();
}

function refreshList() {
  renderDocList(getDocs(), activeId);
}

// ── Autosave (debounced) ───────────────────────────────────────
const saveContent = debounce(() => {
  updateDoc(activeId, { content: textarea.value });
  flashSaved();
  refreshList(); // keep the sidebar preview snippet fresh
}, 500);

const saveTitle = debounce(() => {
  updateDoc(activeId, { title: titleInput.value });
  flashSaved();
  refreshList();
}, 500);

// ── Editor input → live preview + stats + autosave ─────────────
textarea.addEventListener('input', () => {
  renderPreview(textarea.value);
  renderStats(textarea.value);
  saveContent();
});

titleInput.addEventListener('input', saveTitle);

// Tab inside the textarea should indent, not jump focus
textarea.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const { selectionStart: s, selectionEnd: e2, value } = textarea;
    textarea.value = value.slice(0, s) + '  ' + value.slice(e2);
    textarea.selectionStart = textarea.selectionEnd = s + 2;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
});

// ── Toolbar ────────────────────────────────────────────────────
toolbar.addEventListener('click', e => {
  const btn = e.target.closest('.tool-btn');
  if (btn) applyFormat(textarea, btn.dataset.action);
});

// ── Help panel ─────────────────────────────────────────────────
helpBtn.addEventListener('click', () => { helpOverlay.hidden = false; helpClose.focus(); });
helpClose.addEventListener('click', () => { helpOverlay.hidden = true; helpBtn.focus(); });
helpOverlay.addEventListener('click', e => { if (e.target === helpOverlay) helpOverlay.hidden = true; });

// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !helpOverlay.hidden) {
    helpOverlay.hidden = true;
    helpBtn.focus();
    return;
  }
  if (!(e.ctrlKey || e.metaKey)) return;
  const key = e.key.toLowerCase();

  if (key === 'b') { e.preventDefault(); applyFormat(textarea, 'bold'); }
  if (key === 'i') { e.preventDefault(); applyFormat(textarea, 'italic'); }
  if (key === 'k') { e.preventDefault(); applyFormat(textarea, 'link'); }
  if (key === 's') { e.preventDefault(); saveContent(); flashSaved(); }
});

// ── Document list (switch + delete) ────────────────────────────
docList.addEventListener('click', e => {
  const del  = e.target.closest('.doc-delete');
  const item = e.target.closest('.doc-item');

  if (del) {
    e.stopPropagation();
    const id   = del.dataset.id;
    const docs = getDocs();
    if (docs.length === 1) {
      // never leave the user with zero documents
      alert('Can\'t delete your only document.');
      return;
    }
    deleteDoc(id);
    // if we deleted the open doc, fall back to the first remaining one
    if (id === activeId) {
      const remaining = getDocs();
      loadDoc(remaining[0].id);
    } else {
      refreshList();
    }
    return;
  }

  if (item) loadDoc(item.dataset.id);
});

// ── New document ───────────────────────────────────────────────
newBtn.addEventListener('click', () => {
  const doc = createDoc('Untitled', '');
  loadDoc(doc.id);
  titleInput.focus();
  titleInput.select();
});

// ── Export ─────────────────────────────────────────────────────
function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function safeFileName(title) {
  return (title.trim() || 'document').replace(/[^\w\-]+/g, '-').toLowerCase();
}

exportMdBtn.addEventListener('click', () => {
  download(`${safeFileName(titleInput.value)}.md`, textarea.value, 'text/markdown');
});

exportHtmlBtn.addEventListener('click', () => {
  const body = parseMarkdown(textarea.value);
  // wrap the rendered markdown in a clean, self-contained HTML document
  const full = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${titleInput.value || 'Document'}</title>
<style>
  body { max-width: 720px; margin: 2rem auto; padding: 0 1rem;
         font-family: system-ui, sans-serif; line-height: 1.6; color: #1a1a1a; }
  pre { background: #f4f4f4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  code { background: #f4f4f4; padding: 0.15em 0.35em; border-radius: 3px; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
  img { max-width: 100%; }
  a { color: #2563eb; }
</style>
</head>
<body>
${body}
</body>
</html>`;
  download(`${safeFileName(titleInput.value)}.html`, full, 'text/html');
});

// ── Theme toggle ───────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeBtn.addEventListener('click', () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  applyTheme(next);
});

// ── Sidebar toggle (small screens) ─────────────────────────────
sidebarBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// ── Split-pane drag resize ─────────────────────────────────────
let dragging = false;

divider.addEventListener('pointerdown', e => {
  dragging = true;
  divider.setPointerCapture(e.pointerId);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
});

divider.addEventListener('pointermove', e => {
  if (!dragging) return;
  const rect    = workspace.getBoundingClientRect();
  const offset  = sidebar.offsetWidth;
  // position of the cursor within the editor+preview area, as a fraction
  let ratio = (e.clientX - rect.left - offset) / (rect.width - offset);
  ratio = Math.min(0.8, Math.max(0.2, ratio)); // clamp 20%–80%
  editorPane.style.flex  = `${ratio}`;
  previewPane.style.flex = `${1 - ratio}`;
  localStorage.setItem('md-split', String(ratio));
});

divider.addEventListener('pointerup', e => {
  dragging = false;
  divider.releasePointerCapture(e.pointerId);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
});

// restore a saved split ratio
const savedSplit = parseFloat(localStorage.getItem('md-split'));
if (!isNaN(savedSplit)) {
  editorPane.style.flex  = `${savedSplit}`;
  previewPane.style.flex = `${1 - savedSplit}`;
}

// ── Synced scrolling ───────────────────────────────────────────
// scrolling the editor scrolls the preview by the same fraction
let syncing = false;
textarea.addEventListener('scroll', () => {
  if (syncing) return;
  syncing = true;
  const ratio = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight || 1);
  previewPane.scrollTop = ratio * (previewPane.scrollHeight - previewPane.clientHeight);
  requestAnimationFrame(() => { syncing = false; });
});

// ── Boot ───────────────────────────────────────────────────────
applyTheme(getTheme());
activeId = seedIfEmpty();
loadDoc(activeId);
