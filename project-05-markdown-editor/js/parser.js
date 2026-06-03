// parser.js — a small Markdown → HTML converter, written from scratch.
//
// Security model: markdown markers (#, >, -, *, backticks…) are all plain
// ASCII, so block detection runs on the RAW text. Anything that becomes
// visible *content* — paragraph text, code, headings — is escaped before it
// goes into the output, so user input can never become a real HTML tag.

// turns dangerous characters into harmless entities
export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// only let through link/image URLs that can't run script
// blocks things like javascript: and data: URIs
function safeUrl(url) {
  return /^(https?:|mailto:|\/|#|\.)/i.test(url.trim()) ? url.trim() : '#';
}

// ── Inline parsing ─────────────────────────────────────────────
// runs on the text inside headings, paragraphs, list items, quotes.
//
// I escape first, then split on backtick code spans and only format the
// parts OUTSIDE the backticks — so `*literal*` inside code stays literal
// without any fragile placeholder tricks.
function parseInline(text) {
  text = escapeHtml(text);

  return text.split(/(`[^`]+`)/).map(part => {
    if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
      return `<code>${part.slice(1, -1)}</code>`;
    }
    return formatSpans(part);
  }).join('');
}

// emphasis / link / image transforms, applied only to non-code text
function formatSpans(text) {
  // images before links — both use the [..](..) shape, image just has a ! prefix
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}">`);
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="noopener">${label}</a>`);

  // bold, then italic (bold first so ** isn't eaten by the single-* rule)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g,     '<em>$1</em>');

  // underscore emphasis, guarded so snake_case words aren't touched
  text = text.replace(/(^|[^\w])__([^_]+)__(?=[^\w]|$)/g, '$1<strong>$2</strong>');
  text = text.replace(/(^|[^\w])_([^_]+)_(?=[^\w]|$)/g,   '$1<em>$2</em>');

  // strikethrough
  text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  return text;
}

// is this line the start of a block-level element? used to know when a
// paragraph has ended
function isBlockStart(line) {
  return /^```/.test(line.trim())
      || /^#{1,6}\s+/.test(line)
      || /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)
      || /^\s*>\s?/.test(line)
      || /^\s*[-*+]\s+/.test(line)
      || /^\s*\d+\.\s+/.test(line);
}

// ── Block parsing ──────────────────────────────────────────────
// works on RAW lines; content gets escaped on the way into the output
export function parseMarkdown(src) {
  if (!src) return '';

  const lines = src.split('\n');
  const out   = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blank line — skip
    if (/^\s*$/.test(line)) { i++; continue; }

    // fenced code block ``` … ```
    if (/^```/.test(line.trim())) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip the closing fence
      // escape here — code is shown literally, never interpreted
      out.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // heading # … ######
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${parseInline(heading[2].trim())}</h${level}>`);
      i++;
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // blockquote — gather consecutive > lines
    if (/^\s*>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${parseInline(buf.join(' '))}</blockquote>`);
      continue;
    }

    // unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        buf.push(`<li>${parseInline(lines[i].replace(/^\s*[-*+]\s+/, ''))}</li>`);
        i++;
      }
      out.push(`<ul>${buf.join('')}</ul>`);
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        buf.push(`<li>${parseInline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i++;
      }
      out.push(`<ol>${buf.join('')}</ol>`);
      continue;
    }

    // paragraph — gather lines until a blank line or a new block starts.
    // soft-wrapped lines join with a space; a line ending in two spaces
    // becomes a hard break, marked with \n and turned into <br> after
    // inline parsing (so the <br> we add doesn't get escaped)
    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlockStart(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    let para = '';
    buf.forEach((l, idx) => {
      const hardBreak = /\s{2,}$/.test(l);
      para += l.trim();
      if (idx < buf.length - 1) para += hardBreak ? '\n' : ' ';
    });
    out.push(`<p>${parseInline(para).replace(/\n/g, '<br>')}</p>`);
  }

  return out.join('\n');
}

// ── Text stats ─────────────────────────────────────────────────
export function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function countChars(text) {
  return text.length;
}

// rough reading time at ~200 words per minute, min 1 if there's any text
export function readingTime(text) {
  const words = countWords(text);
  return words === 0 ? 0 : Math.max(1, Math.round(words / 200));
}
