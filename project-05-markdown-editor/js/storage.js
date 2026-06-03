// storage.js — document CRUD + active-doc tracking in localStorage
//
// document shape: { id, title, content, createdAt, updatedAt }

const DOCS_KEY   = 'md-docs';
const ACTIVE_KEY = 'md-active';
const THEME_KEY  = 'md-theme';

const WELCOME = `# Welcome to Markdown Editor

This is a **live** markdown editor — type on the left, see the result on the right.

## Things you can do

- **Bold** with \`**double asterisks**\`
- *Italic* with \`*single asterisks*\`
- ~~Strikethrough~~ with \`~~tildes~~\`
- \`inline code\` with backticks
- [Links](https://developer.mozilla.org) that open in a new tab

### Lists

1. Ordered lists
2. Work like this

And unordered:

- Just start a line
- With a dash

### Code blocks

\`\`\`
function hello() {
  return "fenced code stays literal";
}
\`\`\`

> Blockquotes are handy for callouts and notes.

---

Your work autosaves as you type. Create more documents from the sidebar.`;

// ── Documents ──────────────────────────────────────────────────
export function getDocs() {
  try {
    return JSON.parse(localStorage.getItem(DOCS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveDocs(docs) {
  try {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  } catch {
    console.warn('localStorage quota exceeded — document not saved.');
  }
}

export function getDoc(id) {
  return getDocs().find(d => d.id === id) ?? null;
}

export function createDoc(title = 'Untitled', content = '') {
  const doc = {
    id:        crypto.randomUUID(),
    title:     title.trim() || 'Untitled',
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const docs = getDocs();
  docs.unshift(doc);
  saveDocs(docs);
  setActiveId(doc.id);
  return doc;
}

// patch can include { title, content } — only provided fields change
export function updateDoc(id, patch) {
  const docs = getDocs();
  const doc  = docs.find(d => d.id === id);
  if (!doc) return;
  if (patch.title   !== undefined) doc.title   = patch.title.trim() || 'Untitled';
  if (patch.content !== undefined) doc.content = patch.content;
  doc.updatedAt = Date.now();
  saveDocs(docs);
}

export function deleteDoc(id) {
  saveDocs(getDocs().filter(d => d.id !== id));
}

// ── Active document ────────────────────────────────────────────
export function getActiveId() { return localStorage.getItem(ACTIVE_KEY); }
export function setActiveId(id) { localStorage.setItem(ACTIVE_KEY, id); }

// ── Theme ──────────────────────────────────────────────────────
export function getTheme()      { return localStorage.getItem(THEME_KEY) ?? 'dark'; }
export function setTheme(theme) { localStorage.setItem(THEME_KEY, theme); }

// ── First-run seeding ──────────────────────────────────────────
// ensures there's always at least one document to edit
export function seedIfEmpty() {
  const docs = getDocs();
  if (docs.length === 0) {
    const doc = createDoc('Welcome', WELCOME);
    return doc.id;
  }
  // make sure the active id still points at a real document
  const activeId = getActiveId();
  if (!activeId || !docs.some(d => d.id === activeId)) {
    setActiveId(docs[0].id);
    return docs[0].id;
  }
  return activeId;
}
