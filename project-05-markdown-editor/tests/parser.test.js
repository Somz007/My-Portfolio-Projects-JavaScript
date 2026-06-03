import { describe, it, expect } from 'vitest';
import {
  parseMarkdown, escapeHtml,
  countWords, countChars, readingTime,
} from '../js/parser.js';

describe('escapeHtml', () => {
  it('escapes angle brackets and ampersands', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });
});

describe('headings', () => {
  it('parses h1 through h6', () => {
    expect(parseMarkdown('# One')).toBe('<h1>One</h1>');
    expect(parseMarkdown('### Three')).toBe('<h3>Three</h3>');
    expect(parseMarkdown('###### Six')).toBe('<h6>Six</h6>');
  });

  it('requires a space after the hashes', () => {
    // no space → treated as a paragraph, not a heading
    expect(parseMarkdown('#NoSpace')).toBe('<p>#NoSpace</p>');
  });
});

describe('emphasis', () => {
  it('parses bold', () => {
    expect(parseMarkdown('**bold**')).toBe('<p><strong>bold</strong></p>');
  });

  it('parses italic', () => {
    expect(parseMarkdown('*italic*')).toBe('<p><em>italic</em></p>');
  });

  it('parses strikethrough', () => {
    expect(parseMarkdown('~~gone~~')).toBe('<p><del>gone</del></p>');
  });

  it('does not turn snake_case into emphasis', () => {
    expect(parseMarkdown('my_cool_variable')).toBe('<p>my_cool_variable</p>');
  });
});

describe('inline code', () => {
  it('wraps backtick spans in <code>', () => {
    expect(parseMarkdown('use `npm test`')).toBe('<p>use <code>npm test</code></p>');
  });

  it('does not format markdown inside code spans', () => {
    expect(parseMarkdown('`**not bold**`')).toBe('<p><code>**not bold**</code></p>');
  });

  it('leaves plain numbers with spaces alone', () => {
    // regression: the old placeholder approach broke this
    expect(parseMarkdown('I have 0 apples')).toBe('<p>I have 0 apples</p>');
  });
});

describe('links and images', () => {
  it('parses a link', () => {
    expect(parseMarkdown('[MDN](https://mdn.io)'))
      .toBe('<p><a href="https://mdn.io" target="_blank" rel="noopener">MDN</a></p>');
  });

  it('parses an image', () => {
    expect(parseMarkdown('![alt](https://x.com/a.png)'))
      .toBe('<p><img src="https://x.com/a.png" alt="alt"></p>');
  });

  it('blocks javascript: URLs', () => {
    const html = parseMarkdown('[click](javascript:alert(1))');
    expect(html).toContain('href="#"');
    expect(html).not.toContain('javascript:');
  });
});

describe('lists', () => {
  it('parses an unordered list', () => {
    expect(parseMarkdown('- one\n- two'))
      .toBe('<ul><li>one</li><li>two</li></ul>');
  });

  it('parses an ordered list', () => {
    expect(parseMarkdown('1. first\n2. second'))
      .toBe('<ol><li>first</li><li>second</li></ol>');
  });
});

describe('blockquote', () => {
  it('parses a blockquote', () => {
    expect(parseMarkdown('> quoted')).toBe('<blockquote>quoted</blockquote>');
  });
});

describe('horizontal rule', () => {
  it('parses three or more dashes', () => {
    expect(parseMarkdown('---')).toBe('<hr>');
  });
});

describe('code blocks', () => {
  it('keeps fenced content literal', () => {
    const md = '```\nconst x = 1;\n```';
    expect(parseMarkdown(md)).toBe('<pre><code>const x = 1;</code></pre>');
  });

  it('does not format markdown inside fences', () => {
    const md = '```\n# not a heading\n**not bold**\n```';
    expect(parseMarkdown(md)).toBe('<pre><code># not a heading\n**not bold**</code></pre>');
  });
});

describe('XSS safety', () => {
  it('neutralises raw HTML', () => {
    const html = parseMarkdown('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });

  it('neutralises script tags', () => {
    const html = parseMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('paragraphs', () => {
  it('wraps plain text in a paragraph', () => {
    expect(parseMarkdown('just text')).toBe('<p>just text</p>');
  });

  it('joins wrapped lines into one paragraph', () => {
    expect(parseMarkdown('line one\nline two')).toBe('<p>line one line two</p>');
  });

  it('separates paragraphs on a blank line', () => {
    expect(parseMarkdown('para one\n\npara two'))
      .toBe('<p>para one</p>\n<p>para two</p>');
  });
});

describe('text stats', () => {
  it('counts words', () => {
    expect(countWords('one two three')).toBe(3);
    expect(countWords('   ')).toBe(0);
    expect(countWords('')).toBe(0);
  });

  it('counts characters', () => {
    expect(countChars('hello')).toBe(5);
  });

  it('estimates reading time', () => {
    expect(readingTime('')).toBe(0);
    expect(readingTime('word')).toBe(1);
    expect(readingTime('word '.repeat(400))).toBe(2);
  });
});
