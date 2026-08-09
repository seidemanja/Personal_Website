import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Download,
  MessageSquarePlus,
  Plus,
  Square,
} from 'lucide-react';
import Navigation from '../components/Navigation.jsx';
import {
  getMetricsExclusionHeaders,
  sendChatMetric,
  trackAnalyticsEvent,
} from '../analytics.js';
import styles from './AiChatPage.module.css';

const WARMUP_INTERVAL_MS = 10 * 60 * 1000;
const CHAT_HISTORY_TTL_MS = 15 * 60 * 1000;
const LAST_ACCEPTED_KEY = 'josh-ai-chat-last-accepted-at';
const CHAT_HISTORY_KEY = 'josh-ai-chat-history';
const CONVERSATION_LIMIT_MESSAGE =
  'This chat has reached its conversation limit. You can refresh the page to start a new session.';
const GENERIC_ERROR_MESSAGE =
  'Something went wrong — please try again in a moment.';
const STREAM_FLUSH_INTERVAL_MS = 33;
const CHAT_RESPONSE_TIMEOUT_MS = 30 * 1000;
const CHAT_STREAM_DEBUG = import.meta.env.VITE_CHAT_STREAM_DEBUG === 'true';
const EXAMPLE_QUESTIONS = [
  'Give me a brief summary of Josh’s product experience.',
  'What might a quick resume scan miss about Josh?',
  'How does Josh use AI to work more efficiently?',
];
const useBrowserLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

function createClientDebugLogger() {
  if (!CHAT_STREAM_DEBUG || typeof performance === 'undefined') {
    return null;
  }

  const startedAt = performance.now();

  return (event, metadata = {}) => {
    console.info('chat-stream-debug', {
      event,
      elapsed_ms: Math.round((performance.now() - startedAt) * 10) / 10,
      ...metadata,
    });
  };
}

function createMessage(role, content) {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    role,
    content,
  };
}

function isThinkingMessage(message) {
  return message.role === 'assistant' && !message.content.trim();
}

function formatModelLabel(label) {
  return label.replace(/\bgpt\b/gi, 'GPT').replace(/^gpt/gi, 'GPT');
}

function readLastAcceptedAt() {
  const value = window.sessionStorage.getItem(LAST_ACCEPTED_KEY);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function markAcceptedRequest() {
  window.sessionStorage.setItem(LAST_ACCEPTED_KEY, String(Date.now()));
}

function parseSseBuffer(buffer, onEvent) {
  const chunks = buffer.split('\n\n');
  const remainder = chunks.pop() || '';

  chunks.forEach((chunk) => {
    let eventName = 'message';
    const dataLines = [];

    chunk.split(/\r?\n/).forEach((line) => {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      }

      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    });

    if (!dataLines.length) {
      return;
    }

    try {
      onEvent(eventName, JSON.parse(dataLines.join('\n')));
    } catch {
      // Ignore malformed partial stream events.
    }
  });

  return remainder;
}

function sanitizePdfText(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/•/g, '-')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '?');
}

function stripMarkdownEmphasis(text) {
  return String(text || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/(^|\s)(?:\*\*|\*)(?=\s|$)/g, '$1');
}

function parseInlineLinks(text) {
  const sourceText = stripMarkdownEmphasis(text);
  const segments = [];
  const linkPattern = /\[([^\]]+)\]\s*\((https?:\/\/[^)\s]+|\/[^)\s]*)\)|(https?:\/\/[^\s<]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(sourceText))) {
    const [fullMatch, markdownLabel, markdownHref, rawHref] = match;
    const isRawUrl = Boolean(rawHref);
    let label = markdownLabel || rawHref;
    let href = markdownHref || rawHref;
    let trailingText = '';

    if (isRawUrl) {
      const trailingMatch = href.match(/[).,;:!?]+$/);

      if (trailingMatch) {
        trailingText = trailingMatch[0];
        href = href.slice(0, -trailingText.length);
        label = href;
      }
    }

    if (match.index > lastIndex) {
      segments.push({ text: sourceText.slice(lastIndex, match.index), href: '' });
    }

    if (isSafeLinkHref(href)) {
      segments.push({ text: stripMarkdownEmphasis(label), href });
    } else {
      segments.push({ text: stripMarkdownEmphasis(label), href: '' });
    }

    if (trailingText) {
      segments.push({ text: trailingText, href: '' });
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < sourceText.length) {
    segments.push({ text: sourceText.slice(lastIndex), href: '' });
  }

  return segments.length ? segments : [{ text: sourceText, href: '' }];
}

function isEmptyMarkdownMarker(text) {
  return /^[*_•\-\s]+$/.test(String(text || ''));
}

function escapePdfLiteral(text) {
  return `(${sanitizePdfText(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')})`;
}

const PDF_HELVETICA_WIDTHS = {
  ' ': 0.278,
  '!': 0.278,
  '"': 0.355,
  '#': 0.556,
  '$': 0.556,
  '%': 0.889,
  '&': 0.667,
  "'": 0.191,
  '(': 0.333,
  ')': 0.333,
  '*': 0.389,
  '+': 0.584,
  ',': 0.278,
  '-': 0.333,
  '.': 0.278,
  '/': 0.278,
  ':': 0.278,
  ';': 0.278,
  '<': 0.584,
  '=': 0.584,
  '>': 0.584,
  '?': 0.556,
  '@': 1.015,
  '[': 0.278,
  '\\': 0.278,
  ']': 0.278,
  '^': 0.469,
  '_': 0.556,
  '`': 0.222,
  '{': 0.334,
  '|': 0.26,
  '}': 0.334,
  '~': 0.584,
};

function approximatePdfTextWidth(text, fontSize, fontName = 'F1') {
  const normalizedText = sanitizePdfText(text);
  let width = 0;

  for (const character of normalizedText) {
    if (PDF_HELVETICA_WIDTHS[character] != null) {
      width += PDF_HELVETICA_WIDTHS[character];
    } else if (/[A-Z]/.test(character)) {
      width += 0.667;
    } else if (/[mw]/.test(character)) {
      width += 0.778;
    } else if (/[fijltI]/.test(character)) {
      width += 0.278;
    } else if (/[0-9]/.test(character)) {
      width += 0.556;
    } else {
      width += 0.5;
    }
  }

  const fontWeightAdjustment = fontName === 'F2' ? 1.08 : 1;
  return width * fontSize * fontWeightAdjustment;
}

function wrapPdfText(text, maxWidth, fontSize) {
  return wrapPdfTextSegments([{ text, href: '' }], maxWidth, fontSize).map(
    (line) => line.text,
  );
}

function wrapPdfTextSegments(segments, maxWidth, fontSize) {
  const words = [];

  segments.forEach((segment) => {
    sanitizePdfText(segment.text)
      .split(/(\s+)/)
      .filter(Boolean)
      .forEach((token) => {
        words.push({ text: token, href: segment.href || '' });
      });
  });

  const lines = [];
  let currentTokens = [];
  let currentText = '';

  function flushLine() {
    const lineText = currentText.trim();

    if (lineText) {
      const trimStartLength = currentText.length - currentText.trimStart().length;
      let cursor = 0;
      const links = [];

      currentTokens.forEach((token) => {
        const tokenStart = cursor - trimStartLength;
        const tokenEnd = tokenStart + token.text.length;

        if (token.href && tokenEnd > 0 && tokenStart < lineText.length) {
          links.push({
            href: token.href,
            start: Math.max(0, tokenStart),
            text: token.text.slice(
              Math.max(0, -tokenStart),
              token.text.length - Math.max(0, tokenEnd - lineText.length),
            ),
          });
        }

        cursor += token.text.length;
      });

      lines.push({ text: lineText, links });
    }

    currentTokens = [];
    currentText = '';
  }

  words.forEach((word) => {
    const nextLine = `${currentText}${word.text}`;

    if (
      approximatePdfTextWidth(nextLine.trim(), fontSize) > maxWidth &&
      currentText.trim()
    ) {
      flushLine();
      currentText = word.text;
      currentTokens = [word];
      return;
    }

    currentText = nextLine;
    currentTokens.push(word);
  });

  flushLine();

  return lines.length ? lines : [{ text: '', links: [] }];
}

function getPdfMessageLines(content, maxWidth, fontSize) {
  const normalizedContent = String(content || '')
    .trim()
    .replace(/\r\n?/g, '\n');

  if (!normalizedContent) {
    return [{ text: '', indent: 0, bullet: false, extraAfter: 0 }];
  }

  const blocks = parseChatMessageBlocks(normalizedContent);
  const pdfLines = [];
  const bulletTextIndent = 15;
  const bulletItemGap = 4;
  const blockGap = 8;

  blocks.forEach((block, blockIndex) => {
    if (blockIndex > 0) {
      const previousBlock = blocks[blockIndex - 1];
      const isAdjacentBulletBlock =
        previousBlock.type === 'bullets' && block.type === 'bullets';
      const previousLine = pdfLines[pdfLines.length - 1];

      if (previousLine) {
        previousLine.extraAfter = Math.max(
          previousLine.extraAfter || 0,
          isAdjacentBulletBlock ? bulletItemGap : blockGap,
        );
      }
    }

    if (block.type === 'bullets') {
      block.items.forEach((item, itemIndex) => {
        const wrappedBulletLines = wrapPdfTextSegments(
          parseInlineLinks(item),
          maxWidth - bulletTextIndent,
          fontSize,
        );

        wrappedBulletLines.forEach((wrappedLine, lineIndex) => {
          const isLastLineOfItem = lineIndex === wrappedBulletLines.length - 1;
          const isLastItem = itemIndex === block.items.length - 1;

          pdfLines.push({
            text: wrappedLine.text,
            indent: bulletTextIndent,
            bullet: lineIndex === 0,
            extraAfter: isLastLineOfItem && !isLastItem ? bulletItemGap : 0,
            links: wrappedLine.links || [],
          });
        });
      });
      return;
    }

    wrapPdfTextSegments(parseInlineLinks(block.text), maxWidth, fontSize).forEach((wrappedLine) => {
      pdfLines.push({
        text: wrappedLine.text,
        indent: 0,
        bullet: false,
        extraAfter: 0,
        links: wrappedLine.links || [],
      });
    });
  });

  return pdfLines.length
    ? pdfLines
    : [{ text: '', indent: 0, bullet: false, extraAfter: 0 }];
}

function parseChatMessageBlocks(content) {
  const lines = String(content || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let paragraphLines = [];
  let bulletItems = [];

  function flushParagraph() {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push({
      type: 'paragraph',
      text: paragraphLines.join('\n').trim(),
    });
    paragraphLines = [];
  }

  function flushBullets() {
    if (!bulletItems.length) {
      return;
    }

    blocks.push({
      type: 'bullets',
      items: bulletItems,
    });
    bulletItems = [];
  }

  lines.forEach((line) => {
    const bulletMatch = line.match(/^\s*[-*•]\s+(.*)$/);

    if (bulletMatch) {
      flushParagraph();
      const bulletText = stripMarkdownEmphasis(bulletMatch[1]).trim();

      if (bulletText && !isEmptyMarkdownMarker(bulletText)) {
        bulletItems.push(bulletText);
      }
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      flushBullets();
      return;
    }

    flushBullets();
    paragraphLines.push(stripMarkdownEmphasis(line));
  });

  flushParagraph();
  flushBullets();

  return blocks.length ? blocks : [{ type: 'paragraph', text: '' }];
}

function isSafeLinkHref(href) {
  return /^https?:\/\//i.test(href) || href.startsWith('/');
}

function renderInlineMessageText(text, keyPrefix) {
  const normalizedText = stripMarkdownEmphasis(text);
  const parts = [];
  const linkPattern = /\[([^\]]+)\]\s*\((https?:\/\/[^)\s]+|\/[^)\s]*)\)|(https?:\/\/[^\s<]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(normalizedText))) {
    const [fullMatch, markdownLabel, markdownHref, rawHref] = match;
    const isRawUrl = Boolean(rawHref);
    let label = markdownLabel;
    let href = markdownHref || rawHref;
    let trailingText = '';

    if (isRawUrl) {
      const trailingMatch = href.match(/[).,;:!?]+$/);

      if (trailingMatch) {
        trailingText = trailingMatch[0];
        href = href.slice(0, -trailingText.length);
      }

      label = href;
    }

    if (match.index > lastIndex) {
      parts.push(normalizedText.slice(lastIndex, match.index));
    }

    if (isSafeLinkHref(href)) {
      parts.push(
        <a
          href={href}
          key={`${keyPrefix}-link-${match.index}`}
          rel={href.startsWith('http') ? 'noreferrer' : undefined}
          target={href.startsWith('http') ? '_blank' : undefined}
        >
          {stripMarkdownEmphasis(label)}
        </a>,
      );
      if (trailingText) {
        parts.push(trailingText);
      }
    } else {
      parts.push(stripMarkdownEmphasis(label));
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < normalizedText.length) {
    parts.push(normalizedText.slice(lastIndex));
  }

  return parts.length ? parts : normalizedText;
}

function getStreamingSafeMessageContent(content) {
  const text = String(content || '');
  const lastMarkdownLinkStart = text.lastIndexOf('[');

  if (lastMarkdownLinkStart >= 0) {
    const trailingText = text.slice(lastMarkdownLinkStart);
    const isIncompleteMarkdownLink =
      /^\[[^\]]*$/.test(trailingText) ||
      /^\[[^\]]+\]\s*$/.test(trailingText) ||
      /^\[[^\]]+\]\s*\([^)]*$/.test(trailingText);

    if (isIncompleteMarkdownLink) {
      return text.slice(0, lastMarkdownLinkStart).replace(/\s+$/, '');
    }
  }

  const trailingRawUrlMatch = text.match(/(^|[\s(])https?:\/\/[^\s<>)]+$/);

  if (trailingRawUrlMatch) {
    const trailingUrlStart =
      trailingRawUrlMatch.index + trailingRawUrlMatch[1].length;

    return text.slice(0, trailingUrlStart).replace(/\s+$/, '');
  }

  return text;
}

function renderMessageContent(message, options = {}) {
  if (isThinkingMessage(message)) {
    return <p className={styles.thinkingText}>Thinking</p>;
  }

  const visibleContent = options.isStreaming
    ? getStreamingSafeMessageContent(message.content)
    : message.content;
  const blocks = parseChatMessageBlocks(visibleContent);

  return blocks.map((block, index) => {
    if (block.type === 'bullets') {
      return (
        <ul className={styles.messageBullets} key={`bullets-${index}`}>
          {block.items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>
              {renderInlineMessageText(item, `bullet-${index}-${itemIndex}`)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`paragraph-${index}`}>
        {renderInlineMessageText(block.text, `paragraph-${index}`)}
      </p>
    );
  });
}

function roundedRectOps(x, y, width, height, radius) {
  const k = 0.5522847498;
  const c = radius * k;
  const right = x + width;
  const top = y + height;

  return [
    `${x + radius} ${y} m`,
    `${right - radius} ${y} l`,
    `${right - radius + c} ${y} ${right} ${y + radius - c} ${right} ${y + radius} c`,
    `${right} ${top - radius} l`,
    `${right} ${top - radius + c} ${right - radius + c} ${top} ${right - radius} ${top} c`,
    `${x + radius} ${top} l`,
    `${x + radius - c} ${top} ${x} ${top - radius + c} ${x} ${top - radius} c`,
    `${x} ${y + radius} l`,
    `${x} ${y + radius - c} ${x + radius - c} ${y} ${x + radius} ${y} c`,
  ];
}

function circleOps(cx, cy, radius) {
  const k = 0.5522847498;
  const c = radius * k;

  return [
    `${cx} ${cy + radius} m`,
    `${cx + c} ${cy + radius} ${cx + radius} ${cy + c} ${cx + radius} ${cy} c`,
    `${cx + radius} ${cy - c} ${cx + c} ${cy - radius} ${cx} ${cy - radius} c`,
    `${cx - c} ${cy - radius} ${cx - radius} ${cy - c} ${cx - radius} ${cy} c`,
    `${cx - radius} ${cy + c} ${cx - c} ${cy + radius} ${cx} ${cy + radius} c`,
  ];
}

function createPdfDocument({ messages, modelLabel }) {
  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 50;
  const contentWidth = pageWidth - marginX * 2;
  const topY = 742;
  const bottomY = 50;
  const bodyFontSize = 11;
  const lineHeight = 15;
  const objects = [];
  const pages = [];
  let currentOps = [];
  let currentAnnotations = [];
  let cursorY = topY;

  function textOp(text, x, y, fontName = 'F1', fontSize = 11) {
    return `BT /${fontName} ${fontSize} Tf ${x} ${y} Td ${escapePdfLiteral(
      text,
    )} Tj ET`;
  }

  function textRunsOp(runs, x, y, fontSize) {
    const operations = [`BT ${x} ${y} Td`];
    let activeFont = '';

    runs.forEach(({ fontName = 'F1', text }) => {
      if (!text) {
        return;
      }

      if (fontName !== activeFont) {
        operations.push(`/${fontName} ${fontSize} Tf`);
        activeFont = fontName;
      }

      operations.push(`${escapePdfLiteral(text)} Tj`);
    });

    operations.push('ET');
    return operations.join(' ');
  }

  function setFillColor(gray) {
    return `${gray} g`;
  }

  function newPage() {
    if (currentOps.length) {
      pages.push({
        content: currentOps.join('\n'),
        annotations: currentAnnotations,
      });
    }

    currentOps = [];
    currentAnnotations = [];
    cursorY = topY;
  }

  function addLinkAnnotation(href, x, baselineY, width, fontSize) {
    if (!href || width <= 0 || fontSize <= 0) {
      return;
    }

    const annotationBottom = baselineY - 2;
    const annotationHeight = fontSize + 4;
    const underlineY = baselineY - 1.35;

    currentOps.push('q');
    currentOps.push('0.16 0.16 0.15 RG');
    currentOps.push('0.5 w');
    currentOps.push(
      `${Math.round(x * 100) / 100} ${Math.round(underlineY * 100) / 100} m`,
    );
    currentOps.push(
      `${Math.round((x + width) * 100) / 100} ${Math.round(
        underlineY * 100,
      ) / 100} l`,
    );
    currentOps.push('S');
    currentOps.push('Q');

    currentAnnotations.push({
      href,
      rect: [
        Math.round(x * 100) / 100,
        Math.round(annotationBottom * 100) / 100,
        Math.round((x + width) * 100) / 100,
        Math.round((annotationBottom + annotationHeight) * 100) / 100,
      ],
    });
  }

  function renderPdfTextLine(line, x, y, fontSize) {
    const sortedLinks = [...(line.links || [])]
      .filter((link) => link.href && link.text)
      .sort((a, b) => a.start - b.start);

    if (!sortedLinks.length) {
      currentOps.push(textOp(line.text, x, y, 'F1', fontSize));
      return;
    }

    let cursorIndex = 0;
    let cursorX = x;
    const runs = [];
    const annotations = [];

    sortedLinks.forEach((link) => {
      const linkStart = Math.max(cursorIndex, link.start);
      const normalText = line.text.slice(cursorIndex, linkStart);

      if (normalText) {
        runs.push({ text: normalText, fontName: 'F1' });
        cursorX += approximatePdfTextWidth(normalText, fontSize);
      }

      const linkText = line.text.slice(linkStart, linkStart + link.text.length);

      if (linkText) {
        const linkWidth = approximatePdfTextWidth(linkText, fontSize, 'F2');
        runs.push({ text: linkText, fontName: 'F2' });
        annotations.push({ href: link.href, x: cursorX, width: linkWidth });
        cursorX += linkWidth;
      }

      cursorIndex = linkStart + link.text.length;
    });

    const remainingText = line.text.slice(cursorIndex);

    if (remainingText) {
      runs.push({ text: remainingText, fontName: 'F1' });
    }

    currentOps.push(textRunsOp(runs, x, y, fontSize));
    annotations.forEach((annotation) => {
      addLinkAnnotation(
        annotation.href,
        annotation.x,
        y,
        annotation.width,
        fontSize,
      );
    });
  }

  function ensureSpace(height) {
    if (cursorY - height < bottomY) {
      newPage();
    }
  }

  function addLine(text, options = {}) {
    const {
      fontName = 'F1',
      fontSize = 11,
      indent = 0,
      extraBefore = 0,
      extraAfter = 0,
    } = options;

    cursorY -= extraBefore;

    if (cursorY < bottomY) {
      newPage();
    }

    currentOps.push(textOp(text, marginX + indent, cursorY, fontName, fontSize));
    cursorY -= lineHeight + extraAfter;
  }

  addLine('AI Chat Conversation', {
    fontName: 'F2',
    fontSize: 18,
    extraAfter: 8,
  });
  addLine(`Export timestamp: ${new Date().toLocaleString()}`, {
    fontSize: 10,
  });
  addLine(`Selected model: ${modelLabel}`, {
    fontSize: 10,
    extraAfter: 12,
  });

  getPersistableMessages(messages).forEach((message) => {
    const isUser = message.role === 'user';
    const maxTextWidth = isUser ? 330 : contentWidth;
    const lines = getPdfMessageLines(
      message.content,
      maxTextWidth,
      bodyFontSize,
    );
    const textBlockHeight = lines.reduce(
      (height, line) => height + lineHeight + (line.extraAfter || 0),
      0,
    );

    if (isUser) {
      const longestLineWidth = Math.max(
        ...lines.map((line) => approximatePdfTextWidth(line.text, bodyFontSize)),
        32,
      );
      const bubblePaddingX = 14;
      const bubblePaddingY = 9;
      const bubbleWidth = Math.min(
        longestLineWidth + bubblePaddingX * 2,
        contentWidth * 0.72,
      );
      const bubbleHeight = textBlockHeight + bubblePaddingY * 2 - 3;
      const bubbleX = marginX + contentWidth - bubbleWidth;
      const bubbleY = cursorY - bubbleHeight;

      ensureSpace(bubbleHeight + 20);
      currentOps.push('q');
      currentOps.push(setFillColor('0.94'));
      currentOps.push(...roundedRectOps(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 13));
      currentOps.push('f');
      currentOps.push('Q');

      let lineOffset = 0;
      lines.forEach((line) => {
        if (!line.text) {
          lineOffset += lineHeight + (line.extraAfter || 0);
          return;
        }

        renderPdfTextLine(
          line,
          bubbleX + bubblePaddingX,
          cursorY - bubblePaddingY - bodyFontSize - lineOffset,
          bodyFontSize,
        );
        lineOffset += lineHeight + (line.extraAfter || 0);
      });

      cursorY -= bubbleHeight + 20;
      return;
    }

    lines.forEach((line) => {
      ensureSpace(lineHeight + (line.extraAfter || 0));

      if (!line.text) {
        cursorY -= lineHeight + (line.extraAfter || 0);
        return;
      }

      const textX = marginX + (line.indent || 0);
      const textY = cursorY - bodyFontSize;

      if (line.bullet) {
        currentOps.push('q');
        currentOps.push(setFillColor('0.2'));
        currentOps.push(...circleOps(marginX + 4, textY + 4, 1.7));
        currentOps.push('f');
        currentOps.push('Q');
      }

      renderPdfTextLine(line, textX, textY, bodyFontSize);
      cursorY -= lineHeight + (line.extraAfter || 0);
    });
    ensureSpace(18);
    cursorY -= 18;
  });

  newPage();

  const annotationCount = pages.reduce(
    (count, page) => count + page.annotations.length,
    0,
  );
  const fontRegularObject = 3 + pages.length * 2 + annotationCount;
  const fontBoldObject = fontRegularObject + 1;
  const pageObjectNumbers = [];
  let nextAnnotationObjectNumber = 3 + pages.length * 2;

  pages.forEach((page, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const annotationObjectNumbers = page.annotations.map((annotation) => {
      const annotationObjectNumber = nextAnnotationObjectNumber;
      nextAnnotationObjectNumber += 1;
      objects[annotationObjectNumber] =
        `<< /Type /Annot /Subtype /Link /Rect [${annotation.rect.join(
          ' ',
        )}] /Border [0 0 0] /A << /S /URI /URI ${escapePdfLiteral(
          annotation.href,
        )} >> >>`;
      return annotationObjectNumber;
    });
    pageObjectNumbers.push(pageObjectNumber);

    objects[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ${
        annotationObjectNumbers.length
          ? `/Annots [${annotationObjectNumbers
              .map((objectNumber) => `${objectNumber} 0 R`)
              .join(' ')}] `
          : ''
      }/Resources << /Font << /F1 ${fontRegularObject} 0 R /F2 ${fontBoldObject} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber] =
      `<< /Length ${page.content.length} >>\nstream\n${page.content}\nendstream`;
  });

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] =
    `<< /Type /Pages /Kids [${pageObjectNumbers
      .map((objectNumber) => `${objectNumber} 0 R`)
      .join(' ')}] /Count ${pages.length} >>`;
  objects[fontRegularObject] =
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[fontBoldObject] =
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let index = 1; index < objects.length; index += 1) {
    if (!objects[index]) {
      continue;
    }

    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;

  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index] || 0).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

async function downloadPdf({ messages, modelLabel }) {
  const pdf = createPdfDocument({ messages, modelLabel });
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const fileName = 'ai-chat-conversation.pdf';
  const isMobileLike =
    window.matchMedia?.('(hover: none) and (pointer: coarse)').matches ||
    window.matchMedia?.('(max-width: 640px)').matches;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  if (isMobileLike) {
    window.open(url, '_blank', 'noopener');
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getPersistableMessages(messages) {
  return messages.filter(
    (message) => message.content.trim() && !isThinkingMessage(message),
  );
}

function readStoredMessages() {
  try {
    const storedValue = window.sessionStorage.getItem(CHAT_HISTORY_KEY);

    if (!storedValue) {
      return [];
    }

    const payload = JSON.parse(storedValue);
    const updatedAt = Number(payload?.updatedAt);
    const messages = Array.isArray(payload?.messages) ? payload.messages : [];

    if (!updatedAt || Date.now() - updatedAt > CHAT_HISTORY_TTL_MS) {
      window.sessionStorage.removeItem(CHAT_HISTORY_KEY);
      return [];
    }

    return messages.filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.trim(),
    );
  } catch {
    return [];
  }
}

function writeStoredMessages(messages) {
  try {
    const persistableMessages = getPersistableMessages(messages);

    if (!persistableMessages.length) {
      window.sessionStorage.removeItem(CHAT_HISTORY_KEY);
      return;
    }

    window.sessionStorage.setItem(
      CHAT_HISTORY_KEY,
      JSON.stringify({
        updatedAt: Date.now(),
        messages: persistableMessages,
      }),
    );
  } catch {
    // If storage is unavailable, continue without local chat persistence.
  }
}

function refreshStoredHistoryTimestamp(messages) {
  try {
    const persistableMessages = getPersistableMessages(messages);

    if (!persistableMessages.length) {
      return;
    }

    window.sessionStorage.setItem(
      CHAT_HISTORY_KEY,
      JSON.stringify({
        updatedAt: Date.now(),
        messages: persistableMessages,
      }),
    );
  } catch {
    // If storage is unavailable, continue without local chat persistence.
  }
}

async function writeTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy copy path for mobile Safari/local contexts.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.left = '-1000px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    textarea.remove();
  }
}

function AiChatPage() {
  const [messages, setMessages] = useState(() =>
    typeof window === 'undefined' ? [] : readStoredMessages(),
  );
  const [inputValue, setInputValue] = useState('');
  const [modelOptions, setModelOptions] = useState([]);
  const [selectedModelKey, setSelectedModelKey] = useState('primary');
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [optionsPanel, setOptionsPanel] = useState('main');
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState('');
  const [isMobileChatLayout, setIsMobileChatLayout] = useState(false);
  const [showMobileStickyHeader, setShowMobileStickyHeader] = useState(false);
  const [hasLoadedStoredMessages] = useState(true);
  const abortControllerRef = useRef(null);
  const chatScrollerRef = useRef(null);
  const headerRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const warmupStartedRef = useRef(false);
  const activeAssistantMessageIdRef = useRef(null);
  const pendingStreamTextRef = useRef('');
  const flushTimerRef = useRef(null);
  const activeDebugLogRef = useRef(null);
  const firstStateUpdateScheduledRef = useRef(false);
  const firstVisibleUpdateLoggedRef = useRef(false);
  const firstVisibleTextFlushedRef = useRef(false);
  const activeRequestStartedAtRef = useRef(0);

  const selectedModelLabel = useMemo(() => {
    const rawLabel =
      modelOptions.find((model) => model.key === selectedModelKey)?.label ||
      'gpt-5.6-sol';

    return formatModelLabel(rawLabel);
  }, [modelOptions, selectedModelKey]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)');

    function handleMediaChange() {
      setIsMobileChatLayout(query.matches);
    }

    handleMediaChange();
    query.addEventListener?.('change', handleMediaChange);

    return () => {
      query.removeEventListener?.('change', handleMediaChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/ai-chat-models')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load model options');
        }
        return response.json();
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setModelOptions(data.models || []);
        setSelectedModelKey(data.defaultModelKey || 'primary');
      })
      .catch(() => {
        if (isMounted) {
          setModelOptions([{ key: 'primary', label: 'gpt-5.6-sol' }]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredMessages) {
      return;
    }

    writeStoredMessages(messages);
  }, [hasLoadedStoredMessages, messages]);

  useEffect(() => {
    function handleUserActivity() {
      refreshStoredHistoryTimestamp(messages);
    }

    window.addEventListener('pointerdown', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      window.removeEventListener('pointerdown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [messages]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const storedMessages = readStoredMessages();

      if (!storedMessages.length && messages.length && !isStreaming) {
        setMessages([]);
      }
    }, 30 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isStreaming, messages.length]);

  useEffect(() => {
    if (!selectedModelKey || warmupStartedRef.current) {
      return;
    }

    const lastAcceptedAt = readLastAcceptedAt();
    const shouldWarmup =
      !lastAcceptedAt || Date.now() - lastAcceptedAt > WARMUP_INTERVAL_MS;

    if (!shouldWarmup) {
      return;
    }

    warmupStartedRef.current = true;

    fetch('/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getMetricsExclusionHeaders(),
      },
      body: JSON.stringify({
        type: 'warmup',
        modelKey: selectedModelKey,
        resetSession: true,
      }),
    })
      .then(async (response) => {
        if (response.ok && response.body) {
          const reader = response.body.getReader();

          while (true) {
            const { done } = await reader.read();

            if (done) {
              break;
            }
          }

          markAcceptedRequest();
        }
      })
      .catch(() => {
        // Warmup is invisible to the user; failures should not block chat use.
      });
  }, [selectedModelKey]);

  useBrowserLayoutEffect(() => {
    if (!isAutoScrollEnabled) {
      return;
    }

    if (isMobileChatLayout) {
      if (messages.length || isStreaming) {
        window.scrollTo({ top: document.documentElement.scrollHeight });
      } else {
        window.scrollTo({ top: 0 });
      }
      return;
    }

    if (!chatScrollerRef.current) {
      return;
    }

    chatScrollerRef.current.scrollTop = chatScrollerRef.current.scrollHeight;
  }, [messages, isStreaming, isAutoScrollEnabled, isMobileChatLayout]);

  useBrowserLayoutEffect(() => {
    if (!isMobileChatLayout || messages.length || isStreaming) {
      return;
    }

    window.scrollTo({ top: 0 });
  }, [messages.length, isMobileChatLayout, isStreaming]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isOptionsMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!optionsMenuRef.current?.contains(event.target)) {
        setIsOptionsMenuOpen(false);
        setOptionsPanel('main');
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOptionsMenuOpen]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== 'Escape') {
        return;
      }

      setIsOptionsMenuOpen(false);
      setOptionsPanel('main');
      setIsNewChatDialogOpen(false);
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isMobileChatLayout) {
      setShowMobileStickyHeader(false);
      return undefined;
    }

    function handleWindowScroll() {
      const scrollElement = document.scrollingElement || document.documentElement;
      const distanceFromBottom =
        scrollElement.scrollHeight - window.scrollY - window.innerHeight;
      const isNearBottom = distanceFromBottom < 48;

      setIsAutoScrollEnabled(isNearBottom);
      setShowScrollButton(!isNearBottom);
    }

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    handleWindowScroll();

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [isMobileChatLayout]);

  useEffect(() => {
    if (!isMobileChatLayout || !headerRef.current) {
      setShowMobileStickyHeader(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMobileStickyHeader(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '-47px 0px 0px 0px',
        threshold: 0,
      },
    );

    observer.observe(headerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isMobileChatLayout]);

  function handleScroll() {
    if (isMobileChatLayout) {
      return;
    }

    const scroller = chatScrollerRef.current;

    if (!scroller) {
      return;
    }

    const distanceFromBottom =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    const isNearBottom = distanceFromBottom < 48;

    setIsAutoScrollEnabled(isNearBottom);
    setShowScrollButton(!isNearBottom);
  }

  function scrollToBottom() {
    if (isMobileChatLayout) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
      setIsAutoScrollEnabled(true);
      setShowScrollButton(false);
      return;
    }

    const scroller = chatScrollerRef.current;

    if (!scroller) {
      return;
    }

    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
    setIsAutoScrollEnabled(true);
    setShowScrollButton(false);
  }

  function stopStreaming() {
    const assistantMessageId = activeAssistantMessageIdRef.current;
    const hasVisiblePendingText = Boolean(pendingStreamTextRef.current.trim());

    activeDebugLogRef.current?.('client.abort');
    if (activeRequestStartedAtRef.current) {
      sendChatMetric('response_stopped', {
        modelKey: selectedModelKey,
        value: Date.now() - activeRequestStartedAtRef.current,
      });
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    clearStreamFlushTimer();
    flushPendingStreamText();

    if (assistantMessageId && !hasVisiblePendingText) {
      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) =>
            message.id !== assistantMessageId || message.content.trim(),
        ),
      );
    }

    setIsStreaming(false);
  }

  function flushPendingStreamText() {
    const assistantMessageId = activeAssistantMessageIdRef.current;
    const pendingText = pendingStreamTextRef.current;

    if (!assistantMessageId || !pendingText) {
      return;
    }

    pendingStreamTextRef.current = '';

    if (!firstStateUpdateScheduledRef.current) {
      firstStateUpdateScheduledRef.current = true;
      activeDebugLogRef.current?.('client.first_state_update_scheduled', {
        approximate_chunk_characters: pendingText.length,
      });
    }

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === assistantMessageId
          ? {
              ...message,
              content: `${message.content}${
                message.content ? pendingText : pendingText.replace(/^\s+/, '')
              }`,
            }
          : message,
      ),
    );

    if (!firstVisibleUpdateLoggedRef.current) {
      const debugLog = activeDebugLogRef.current;

      requestAnimationFrame(() => {
        if (!firstVisibleUpdateLoggedRef.current) {
          firstVisibleUpdateLoggedRef.current = true;
          debugLog?.('client.first_visible_text_update');
        }
      });
    }
  }

  function scheduleStreamTextFlush() {
    if (flushTimerRef.current) {
      return;
    }

    flushTimerRef.current = window.setTimeout(() => {
      flushTimerRef.current = null;
      flushPendingStreamText();
    }, STREAM_FLUSH_INTERVAL_MS);
  }

  function clearStreamFlushTimer() {
    if (!flushTimerRef.current) {
      return;
    }

    window.clearTimeout(flushTimerRef.current);
    flushTimerRef.current = null;
  }

  async function copyMessage(message) {
    if (!message.content.trim()) {
      return;
    }

    try {
      const didCopy = await writeTextToClipboard(message.content);

      if (!didCopy) {
        return;
      }

      setCopiedMessageId(message.id);
      window.setTimeout(() => {
        setCopiedMessageId((currentId) =>
          currentId === message.id ? '' : currentId,
        );
      }, 1200);
    } catch {
      // Clipboard failures should not alter the conversation UI.
    }
  }

  async function sendMessage(rawInput) {
    const trimmedInput = rawInput.trim();

    if (!trimmedInput || isStreaming || isLimitReached) {
      return;
    }

    const priorMessages = messages.slice(-10);
    const userMessage = createMessage('user', trimmedInput);
    const assistantMessage = createMessage('assistant', '');
    const controller = new AbortController();
    const debugLog = createClientDebugLogger();
    let hasLoggedFirstReadableChunk = false;
    let readableChunkLogCount = 0;
    let cumulativeChunkCharacters = 0;
    let responseTimeoutId = 0;
    let didTimeout = false;

    debugLog?.('client.send_clicked');

    abortControllerRef.current = controller;
    activeAssistantMessageIdRef.current = assistantMessage.id;
    pendingStreamTextRef.current = '';
    activeDebugLogRef.current = debugLog;
    firstStateUpdateScheduledRef.current = false;
    firstVisibleUpdateLoggedRef.current = false;
    firstVisibleTextFlushedRef.current = false;
    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);
    setInputValue('');
    setErrorMessage('');
    setIsOptionsMenuOpen(false);
    setOptionsPanel('main');
    setIsStreaming(true);
    setIsAutoScrollEnabled(true);
    activeRequestStartedAtRef.current = Date.now();

    try {
      responseTimeoutId = window.setTimeout(() => {
        didTimeout = true;
        controller.abort(new Error('Chat request timed out'));
      }, CHAT_RESPONSE_TIMEOUT_MS);
      debugLog?.('client.fetch_start');
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getMetricsExclusionHeaders(),
        },
        body: JSON.stringify({
          type: 'chat',
          modelKey: selectedModelKey,
          message: trimmedInput,
          history: priorMessages,
        }),
        signal: controller.signal,
      });

      debugLog?.('client.response_headers_received', {
        status: response.status,
      });
      window.clearTimeout(responseTimeoutId);
      responseTimeoutId = 0;

      if (response.status === 429) {
        const payload = await response.json().catch(() => ({}));

        if (payload.error === 'conversation_limit') {
          setIsLimitReached(true);
          setErrorMessage(CONVERSATION_LIMIT_MESSAGE);
          setMessages((currentMessages) =>
            currentMessages.filter((message) => message.id !== assistantMessage.id),
          );
          return;
        }
      }

      if (!response.ok || !response.body) {
        throw new Error('Chat request failed');
      }

      markAcceptedRequest();

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }
        window.clearTimeout(responseTimeoutId);
        responseTimeoutId = 0;

        const decodedChunk = decoder.decode(value, { stream: true });
        cumulativeChunkCharacters += decodedChunk.length;

        if (!hasLoggedFirstReadableChunk) {
          hasLoggedFirstReadableChunk = true;
          debugLog?.('client.first_readable_chunk_received', {
            approximate_chunk_characters: decodedChunk.length,
            cumulative_characters: cumulativeChunkCharacters,
          });
        }

        if (readableChunkLogCount < 10) {
          readableChunkLogCount += 1;
          debugLog?.('client.chunk_received', {
            chunk_index: readableChunkLogCount,
            approximate_chunk_characters: decodedChunk.length,
            cumulative_characters: cumulativeChunkCharacters,
          });
        }

        buffer += decodedChunk;
        buffer = parseSseBuffer(buffer, (eventName, payload) => {
          if (eventName === 'delta' && payload.text) {
            pendingStreamTextRef.current += payload.text;

            if (
              !firstVisibleTextFlushedRef.current &&
              pendingStreamTextRef.current.trim()
            ) {
              firstVisibleTextFlushedRef.current = true;
              clearStreamFlushTimer();
              flushPendingStreamText();
            } else if (!firstVisibleTextFlushedRef.current) {
              clearStreamFlushTimer();
            } else {
              scheduleStreamTextFlush();
            }
          }

          if (eventName === 'error') {
            throw new Error('Stream failed');
          }
        });
      }

      clearStreamFlushTimer();
      flushPendingStreamText();
      debugLog?.('client.stream_complete');
    } catch (error) {
      if (didTimeout || error?.name !== 'AbortError') {
        debugLog?.('client.error', {
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        setErrorMessage(GENERIC_ERROR_MESSAGE);
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id && !message.content
              ? { ...message, content: GENERIC_ERROR_MESSAGE }
              : message,
          ),
        );
      } else {
        setMessages((currentMessages) =>
          currentMessages.filter(
            (message) =>
              message.id !== assistantMessage.id || message.content.trim(),
          ),
        );
      }
    } finally {
      if (responseTimeoutId) {
        window.clearTimeout(responseTimeoutId);
      }
      clearStreamFlushTimer();
      flushPendingStreamText();
      abortControllerRef.current = null;
      activeAssistantMessageIdRef.current = null;
      pendingStreamTextRef.current = '';
      activeDebugLogRef.current = null;
      firstVisibleTextFlushedRef.current = false;
      activeRequestStartedAtRef.current = 0;
      setIsStreaming(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendMessage(inputValue);
  }

  async function resetServerSession() {
    try {
      await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getMetricsExclusionHeaders(),
        },
        body: JSON.stringify({ type: 'reset' }),
      });
    } catch {
      // A failed reset should not block clearing local chat state.
    }
  }

  async function startNewChat() {
    if (!messages.length || isStreaming) {
      return;
    }

    abortControllerRef.current?.abort();
    clearStreamFlushTimer();
    window.sessionStorage.removeItem(CHAT_HISTORY_KEY);
    setMessages([]);
    setInputValue('');
    setErrorMessage('');
    setIsLimitReached(false);
    setShowScrollButton(false);
    setIsAutoScrollEnabled(true);
    setIsOptionsMenuOpen(false);
    setOptionsPanel('main');
    setIsNewChatDialogOpen(false);
    await resetServerSession();
  }

  function requestNewChat() {
    if (!messages.length || isStreaming) {
      return;
    }

    setIsOptionsMenuOpen(false);
    setOptionsPanel('main');
    setIsNewChatDialogOpen(true);
  }

  async function downloadConversationPdf() {
    if (!messages.length) {
      return;
    }

    try {
      await downloadPdf({ messages, modelLabel: selectedModelLabel });
      trackAnalyticsEvent('chat_pdf_export');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        throw error;
      }
    } finally {
      setIsOptionsMenuOpen(false);
      setOptionsPanel('main');
    }
  }

  return (
    <main className={styles.page}>
      <Navigation variant="projects" />

      {isMobileChatLayout ? (
        <div
          className={`${styles.mobileStickyHeader} ${
            showMobileStickyHeader ? styles.mobileStickyHeaderVisible : ''
          }`}
          aria-hidden={!showMobileStickyHeader}
        >
          <div className={styles.mobileStickyHeaderInner}>
            <span>Ask about Josh</span>

            <div className={styles.mobileStickyHeaderControls}>
              {messages.length ? (
                <button
                  className={styles.newChatButton}
                  type="button"
                  aria-label="New chat"
                  disabled={isStreaming}
                  onClick={requestNewChat}
                >
                  <MessageSquarePlus
                    className={styles.mobileNewChatIcon}
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              ) : null}

              <button
                className={styles.downloadButton}
                type="button"
                disabled={!messages.length}
                onClick={downloadConversationPdf}
                aria-label="Download conversation"
              >
                <Download size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.content}>
        <header className={styles.header} ref={headerRef}>
          <div className={styles.headerText}>
            <h1>Ask about Josh</h1>
            <p>
              A focused guide to Josh’s background, product work, research, and
              technical projects.
            </p>
          </div>

          <div className={styles.headerControls}>
            {messages.length ? (
              <button
                className={styles.newChatButton}
                type="button"
                aria-label="New chat"
                disabled={isStreaming}
                onClick={requestNewChat}
              >
                <Plus className={styles.desktopNewChatIcon} size={13} aria-hidden="true" />
                <MessageSquarePlus
                  className={styles.mobileNewChatIcon}
                  size={18}
                  aria-hidden="true"
                />
                <span>New chat</span>
              </button>
            ) : null}

            <button
              className={styles.downloadButton}
              type="button"
              disabled={!messages.length}
              onClick={downloadConversationPdf}
              aria-label="Download conversation"
            >
              <Download size={15} aria-hidden="true" />
              <span>Download conversation</span>
            </button>
          </div>
        </header>

        <section className={styles.chatShell} aria-label="AI chat">
          <div
            className={styles.messages}
            data-ai-chat-messages="true"
            ref={chatScrollerRef}
            onScroll={handleScroll}
          >
            {messages.length ? (
              messages.map((message) => (
                <article
                  className={`${styles.message} ${
                    message.role === 'user'
                      ? styles.userMessage
                      : styles.assistantMessage
                  }`}
                  key={message.id}
                >
                  {renderMessageContent(message, {
                    isStreaming:
                      isStreaming &&
                      message.role === 'assistant' &&
                      message.id === activeAssistantMessageIdRef.current,
                  })}

                  {!isThinkingMessage(message) ? (
                    <div className={styles.messageActions}>
                      <button
                        type="button"
                        className={styles.copyButton}
                        aria-label={
                          message.role === 'user'
                            ? 'Copy message'
                            : 'Copy response'
                        }
                        data-tooltip={
                          copiedMessageId === message.id ? 'Copied' : ''
                        }
                        data-copied={copiedMessageId === message.id ? 'true' : 'false'}
                        onClick={() => copyMessage(message)}
                      >
                        <Copy size={15} aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>
                  <span className={styles.desktopEmptyPrompt}>
                    Try out an example question, or ask a custom question of your
                    own.
                  </span>
                  <span className={styles.mobileEmptyPrompt}>
                    Try an example question, or ask a question of your own.
                  </span>
                </p>

                <div className={styles.emptyExamples}>
                  {EXAMPLE_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      disabled={isStreaming || isLimitReached}
                      onClick={() => sendMessage(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {showScrollButton ? (
            <button
              className={styles.scrollButton}
              type="button"
              aria-label="Scroll to latest message"
              onClick={scrollToBottom}
            >
              <ArrowDown size={18} aria-hidden="true" />
            </button>
          ) : null}

          {errorMessage ? (
            <p className={styles.inlineMessage} role="status">
              {errorMessage}
            </p>
          ) : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputShell}>
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ask a question"
                disabled={isStreaming || isLimitReached}
                rows={1}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />

              <div className={styles.inputControls}>
                <button
                  className={styles.sendButton}
                  type={isStreaming ? 'button' : 'submit'}
                  onClick={isStreaming ? stopStreaming : undefined}
                  disabled={isLimitReached || (!isStreaming && !inputValue.trim())}
                  aria-label={isStreaming ? 'Stop response' : 'Send message'}
                >
                  {isStreaming ? (
                    <Square size={14} aria-hidden="true" />
                  ) : (
                    <ArrowUp size={19} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.quickControls} ref={optionsMenuRef}>
              <div className={styles.quickControlGroup}>
                <button
                  className={styles.quickControlButton}
                  type="button"
                  disabled={isStreaming || isLimitReached}
                  onClick={() => {
                    setIsOptionsMenuOpen((isOpen) =>
                      optionsPanel === 'examples' ? !isOpen : true,
                    );
                    setOptionsPanel('examples');
                  }}
                  aria-haspopup="menu"
                  aria-expanded={isOptionsMenuOpen && optionsPanel === 'examples'}
                >
                  Example questions
                </button>

                {isOptionsMenuOpen && optionsPanel === 'examples' ? (
                  <div
                    className={`${styles.optionsMenu} ${styles.optionsMenuWide} ${styles.quickMenu}`}
                    role="menu"
                  >
                    {EXAMPLE_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        role="menuitem"
                        disabled={isStreaming || isLimitReached}
                        onClick={() => sendMessage(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className={styles.quickControlGroup}>
                <button
                  className={styles.quickControlButton}
                  type="button"
                  onClick={() => {
                    setIsOptionsMenuOpen((isOpen) =>
                      optionsPanel === 'model' ? !isOpen : true,
                    );
                    setOptionsPanel('model');
                  }}
                  aria-haspopup="menu"
                  aria-expanded={isOptionsMenuOpen && optionsPanel === 'model'}
                >
                  <span>{selectedModelLabel}</span>
                  <ChevronDown size={13} aria-hidden="true" />
                </button>

                {isOptionsMenuOpen && optionsPanel === 'model' ? (
                  <div className={`${styles.optionsMenu} ${styles.quickMenu}`} role="menu">
                    {modelOptions.map((model) => (
                      <button
                        key={model.key}
                        type="button"
                        role="menuitemradio"
                        aria-checked={model.key === selectedModelKey}
                        onClick={() => {
                          if (model.key !== selectedModelKey) {
                            sendChatMetric('model_selected', {
                              modelKey: model.key,
                            });
                          }
                          setSelectedModelKey(model.key);
                          setIsOptionsMenuOpen(false);
                          setOptionsPanel('main');
                        }}
                      >
                        {formatModelLabel(model.label)}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </form>

          {isNewChatDialogOpen ? (
            <div
              className={styles.dialogBackdrop}
              role="presentation"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) {
                  setIsNewChatDialogOpen(false);
                }
              }}
            >
              <div
                className={styles.dialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-chat-title"
                aria-describedby="new-chat-description"
              >
                <h2 id="new-chat-title">Start a new chat?</h2>
                <p id="new-chat-description">
                  This will clear the current conversation from this page.
                </p>
                <div className={styles.dialogActions}>
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setIsNewChatDialogOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={startNewChat}>
                    Start new chat
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default AiChatPage;
