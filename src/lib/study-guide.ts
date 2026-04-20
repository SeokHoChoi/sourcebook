type StudyGuideHeading = {
  id: string;
  level: number;
  text: string;
};

type StudyGuideStats = {
  partCount: number;
  sectionCount: number;
  codeBlockCount: number;
  tableCount: number;
  reflectionPromptCount: number;
  readingTimeMinutes: number;
};

export type ParsedStudyGuide = {
  html: string;
  headings: StudyGuideHeading[];
  stats: StudyGuideStats;
};

type ParseState = {
  explicitAnchors: Map<string, string>;
  headings: StudyGuideHeading[];
  slugCounts: Map<string, number>;
  codeBlockCount: number;
  tableCount: number;
};

const studyGuideCodeKeywords = new Set([
  'as',
  'async',
  'await',
  'const',
  'default',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'import',
  'interface',
  'let',
  'new',
  'null',
  'return',
  'throw',
  'true',
  'try',
  'type',
  'undefined',
  'var',
]);

const studyGuideCodeBuiltins = new Set(['console', 'Promise', 'Date', 'Array', 'Object']);

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function normalizeTextLookup(value: string): string {
  return value
    .replaceAll(/`([^`]+)`/g, '$1')
    .replaceAll(/\*\*([^*]+)\*\*/g, '$1')
    .replaceAll(/\*([^*]+)\*/g, '$1')
    .replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function buildExplicitAnchorMap(markdown: string): Map<string, string> {
  const map = new Map<string, string>();
  const regex = /\[([^\]]+)\]\(#([^)]+)\)/g;

  for (const match of markdown.matchAll(regex)) {
    const label = match[1];
    const anchor = match[2];

    if (!label || !anchor) {
      continue;
    }

    map.set(normalizeTextLookup(label), anchor);
  }

  return map;
}

function slugifyHeading(text: string, state: ParseState): string {
  const explicit = state.explicitAnchors.get(normalizeTextLookup(text));

  if (explicit) {
    return explicit;
  }

  const base =
    text
      .toLowerCase()
      .replaceAll(/<[^>]+>/g, '')
      .replaceAll(/[`*_~]/g, '')
      .replaceAll(/[^\p{L}\p{N}]+/gu, '-')
      .replaceAll(/^-+|-+$/g, '') || 'section';

  const seen = state.slugCounts.get(base) ?? 0;
  state.slugCounts.set(base, seen + 1);

  return seen === 0 ? base : `${base}-${seen + 1}`;
}

function renderInline(text: string, options?: { linkifyUrls?: boolean }): string {
  const placeholders: string[] = [];
  const stash = (html: string): string => {
    const token = `@@INLINE_${placeholders.length}@@`;
    placeholders.push(html);
    return token;
  };
  const linkifyUrls = options?.linkifyUrls ?? true;

  let value = text;

  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
    const safeHref = href.trim();
    const renderedLabel = renderInline(label, { linkifyUrls: false });

    return stash(
      `<a href="${escapeAttribute(safeHref)}" ${
        safeHref.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''
      }>${renderedLabel}</a>`,
    );
  });

  value = value.replace(/`([^`]+)`/g, (_, code: string) =>
    stash(`<code>${escapeHtml(code)}</code>`),
  );

  value = escapeHtml(value);
  value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  value = value.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  value = value.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  if (linkifyUrls) {
    value = value.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noreferrer">$1</a>',
    );
  }

  for (const [index, html] of placeholders.entries()) {
    value = value.replaceAll(`@@INLINE_${index}@@`, html);
  }

  return value;
}

function renderCodeTokenHtml(token: string): string {
  let className = 'study-guide-code-plain';

  if (token.startsWith('//') || token.startsWith('/*')) {
    className = 'study-guide-code-comment';
  } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
    className = 'study-guide-code-string';
  } else if (token.startsWith('</') || token.startsWith('<')) {
    className = 'study-guide-code-tag';
  } else if (studyGuideCodeKeywords.has(token)) {
    className = 'study-guide-code-keyword';
  } else if (studyGuideCodeBuiltins.has(token)) {
    className = 'study-guide-code-builtin';
  } else if (/^\d/.test(token)) {
    className = 'study-guide-code-number';
  } else if (/^[A-Z]/.test(token)) {
    className = 'study-guide-code-type';
  }

  return `<span class="${className}">${escapeHtml(token)}</span>`;
}

function renderHighlightedCodeLineHtml(line: string): string {
  const tokenRegex =
    /\/\/.*$|\/\*.*?\*\/|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|`(?:\\.|[^`])*`|<\/?[A-Za-z][^>\s]*|[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?/g;
  const parts: string[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(tokenRegex)) {
    const token = match[0];
    const start = match.index;

    if (start > lastIndex) {
      parts.push(escapeHtml(line.slice(lastIndex, start)));
    }

    parts.push(renderCodeTokenHtml(token));
    lastIndex = start + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(escapeHtml(line.slice(lastIndex)));
  }

  return parts.join('');
}

function renderCodeBlock(codeLines: string[], language: string, state: ParseState): string {
  state.codeBlockCount += 1;

  const normalizedLanguage = language || 'text';
  const languageLabel = normalizedLanguage.toUpperCase();
  const linesHtml = codeLines
    .map((line, lineIndex) => {
      const renderedLine = renderHighlightedCodeLineHtml(line);

      return `<div class="study-guide-code-line"><span class="study-guide-code-gutter">${lineIndex + 1}</span><span class="study-guide-code-content">${renderedLine || '&nbsp;'}</span></div>`;
    })
    .join('');

  return `<figure class="study-guide-code" data-language="${escapeAttribute(normalizedLanguage)}"><div class="study-guide-code-head"><div class="study-guide-code-chrome" aria-hidden="true"><span></span><span></span><span></span></div><div class="study-guide-code-title">Code Example</div><div class="study-guide-code-language">${escapeHtml(languageLabel)}</div></div><pre data-language="${escapeAttribute(normalizedLanguage)}"><code>${linesHtml}</code></pre></figure>`;
}

function splitTableCells(line: string): string[] {
  let value = line.trim();

  if (value.startsWith('|')) {
    value = value.slice(1);
  }

  if (value.endsWith('|')) {
    value = value.slice(0, -1);
  }

  const cells: string[] = [];
  let current = '';
  let insideCode = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const next = value[index + 1];

    if (char === '\\' && next === '|') {
      current += '|';
      index += 1;
      continue;
    }

    if (char === '`') {
      insideCode = !insideCode;
      current += char;
      continue;
    }

    if (char === '|' && !insideCode) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());

  return cells;
}

function isTableSeparatorRow(line: string): boolean {
  return splitTableCells(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderHeading(line: string, state: ParseState): string {
  const match = /^(#{1,6})\s+(.*)$/.exec(line);

  if (!match?.[1] || !match[2]) {
    return '';
  }

  const hashes = match[1];
  const headingText = match[2];
  const level = hashes.length;
  const text = headingText.trim();
  const id = slugifyHeading(text, state);

  state.headings.push({ id, level, text });

  return `<h${level} id="${escapeAttribute(id)}">${renderInline(text)}</h${level}>`;
}

function renderList(lines: string[], ordered: boolean): string {
  const tag = ordered ? 'ol' : 'ul';
  const items = lines
    .map((line) => line.replace(/^\d+\.\s+/, '').replace(/^[-*]\s+/, ''))
    .map((item) => `<li>${renderInline(item)}</li>`)
    .join('');

  return `<${tag}>${items}</${tag}>`;
}

function renderTable(lines: string[], state: ParseState): string {
  state.tableCount += 1;

  const headerCells = splitTableCells(lines[0] ?? '');
  const bodyStart = lines[1] && isTableSeparatorRow(lines[1]) ? 2 : 1;
  const bodyRows = lines.slice(bodyStart).map((line) => splitTableCells(line));

  const thead = `<thead><tr>${headerCells
    .map((cell) => `<th>${renderInline(cell)}</th>`)
    .join('')}</tr></thead>`;
  const tbody = bodyRows.length
    ? `<tbody>${bodyRows
        .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
        .join('')}</tbody>`
    : '';

  return `<div class="study-guide-table-wrap"><table>${thead}${tbody}</table></div>`;
}

function parseBlocks(lines: string[], state: ParseState): string {
  const html: string[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index] ?? '';
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      index += 1;
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      html.push(renderHeading(trimmed, state));
      index += 1;
      continue;
    }

    if (trimmed === '<details>') {
      const detailLines: string[] = [];
      index += 1;

      while (index < lines.length && lines[index]?.trim() !== '</details>') {
        detailLines.push(lines[index] ?? '');
        index += 1;
      }

      const summaryLine = detailLines.find((candidate) => candidate.trim().startsWith('<summary>'));
      const summary = summaryLine
        ? summaryLine
            .trim()
            .replace(/^<summary>/, '')
            .replace(/<\/summary>$/, '')
        : '상세 보기';
      const bodyLines = detailLines.filter((candidate) => candidate !== summaryLine);

      html.push(
        `<details class="study-guide-details"><summary>${renderInline(summary)}</summary><div class="study-guide-details-body">${parseBlocks(bodyLines, state)}</div></details>`,
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index]?.trim().startsWith('```')) {
        codeLines.push(lines[index] ?? '');
        index += 1;
      }

      html.push(renderCodeBlock(codeLines, language, state));
      index += 1;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];

      while (index < lines.length) {
        const current = lines[index] ?? '';

        if (!current.trim().startsWith('>')) {
          break;
        }

        quoteLines.push(current.replace(/^>\s?/, ''));
        index += 1;
      }

      html.push(`<blockquote>${parseBlocks(quoteLines, state)}</blockquote>`);
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      html.push('<hr />');
      index += 1;
      continue;
    }

    if (trimmed.startsWith('|')) {
      const tableLines: string[] = [];

      while (index < lines.length && (lines[index] ?? '').trim().startsWith('|')) {
        tableLines.push((lines[index] ?? '').trim());
        index += 1;
      }

      html.push(renderTable(tableLines, state));
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed) || /^[-*]\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const listLines: string[] = [];

      while (index < lines.length) {
        const current = (lines[index] ?? '').trim();
        const matches = ordered ? /^\d+\.\s+/.test(current) : /^[-*]\s+/.test(current);

        if (!matches) {
          break;
        }

        listLines.push(current);
        index += 1;
      }

      html.push(renderList(listLines, ordered));
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const current = lines[index] ?? '';
      const currentTrimmed = current.trim();

      if (
        currentTrimmed.length === 0 ||
        /^#{1,6}\s+/.test(currentTrimmed) ||
        currentTrimmed === '<details>' ||
        currentTrimmed.startsWith('```') ||
        currentTrimmed.startsWith('>') ||
        currentTrimmed === '---' ||
        currentTrimmed === '***' ||
        currentTrimmed.startsWith('|') ||
        /^\d+\.\s+/.test(currentTrimmed) ||
        /^[-*]\s+/.test(currentTrimmed)
      ) {
        break;
      }

      paragraphLines.push(currentTrimmed);
      index += 1;
    }

    html.push(`<p>${renderInline(paragraphLines.join(' '))}</p>`);
  }

  return html.join('');
}

export function parseStudyGuideMarkdown(markdown: string): ParsedStudyGuide {
  const normalized = markdown.replaceAll('\r\n', '\n');
  const lines = normalized.split('\n');
  const state: ParseState = {
    explicitAnchors: buildExplicitAnchorMap(normalized),
    headings: [],
    slugCounts: new Map(),
    codeBlockCount: 0,
    tableCount: 0,
  };
  const html = parseBlocks(lines, state);
  const wordCount = normalized
    .replaceAll(/```[\s\S]*?```/g, ' ')
    .replaceAll(/[#>*`\|\[\]-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    html,
    headings: state.headings,
    stats: {
      partCount: state.headings.filter(
        (heading) => heading.level === 1 && heading.text.startsWith('PART '),
      ).length,
      sectionCount: state.headings.filter(
        (heading) => heading.level === 2 && /^\d/.test(heading.text),
      ).length,
      codeBlockCount: state.codeBlockCount,
      tableCount: state.tableCount,
      reflectionPromptCount: (normalized.match(/자기 설명 질문|회상 질문/g) ?? []).length,
      readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 220)),
    },
  };
}
