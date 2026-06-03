// toolbar.js — formatting actions that operate on the editor textarea
//
// Each action either wraps the current selection (bold, italic…) or
// prefixes the current line (heading, quote, list). After changing the
// value we re-select sensibly and fire an 'input' event so autosave and
// the live preview both update.

// wrap the selection with `before`/`after`; if nothing is selected, insert
// a placeholder so the user can type over it
function wrapSelection(ta, before, after, placeholder = 'text') {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const selected = value.slice(s, e) || placeholder;
  const next     = value.slice(0, s) + before + selected + after + value.slice(e);

  ta.value = next;
  // select the inner text so it's easy to replace or keep typing
  ta.selectionStart = s + before.length;
  ta.selectionEnd   = s + before.length + selected.length;
  fireInput(ta);
}

// add a prefix to the start of every line touched by the selection
function prefixLines(ta, prefix) {
  const { selectionStart: s, selectionEnd: e, value } = ta;

  // expand selection to whole lines
  const lineStart = value.lastIndexOf('\n', s - 1) + 1;
  const lineEnd   = value.indexOf('\n', e) === -1 ? value.length : value.indexOf('\n', e);

  const block   = value.slice(lineStart, lineEnd);
  const updated = block.split('\n').map(l => prefix + l).join('\n');

  ta.value = value.slice(0, lineStart) + updated + value.slice(lineEnd);
  ta.selectionStart = lineStart;
  ta.selectionEnd   = lineStart + updated.length;
  fireInput(ta);
}

// insert a snippet at the cursor (used for links/images)
function insertAtCursor(ta, snippet, selectFrom, selectTo) {
  const { selectionStart: s, value } = ta;
  ta.value = value.slice(0, s) + snippet + value.slice(s);
  ta.selectionStart = s + selectFrom;
  ta.selectionEnd   = s + selectTo;
  fireInput(ta);
}

// tell the rest of the app the textarea changed
function fireInput(ta) {
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  ta.focus();
}

export function applyFormat(ta, type) {
  switch (type) {
    case 'bold':    return wrapSelection(ta, '**', '**', 'bold text');
    case 'italic':  return wrapSelection(ta, '*',  '*',  'italic text');
    case 'strike':  return wrapSelection(ta, '~~', '~~', 'struck text');
    case 'code':    return wrapSelection(ta, '`',  '`',  'code');
    case 'h1':      return prefixLines(ta, '# ');
    case 'h2':      return prefixLines(ta, '## ');
    case 'h3':      return prefixLines(ta, '### ');
    case 'quote':   return prefixLines(ta, '> ');
    case 'ul':      return prefixLines(ta, '- ');
    case 'ol':      return prefixLines(ta, '1. ');
    case 'link':
      // "[text](url)" — pre-select the url part so it's ready to paste
      return insertAtCursor(ta, '[text](url)', 7, 10);
    case 'image':
      return insertAtCursor(ta, '![alt](url)', 7, 10);
    default:
      return;
  }
}
