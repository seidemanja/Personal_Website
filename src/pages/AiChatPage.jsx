import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  MoreHorizontal,
  Square,
} from 'lucide-react';
import Navigation from '../components/Navigation.jsx';
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
const CHAT_STREAM_DEBUG = import.meta.env.VITE_CHAT_STREAM_DEBUG === 'true';
const EXAMPLE_QUESTIONS = [
  'Give me a brief summary of Josh’s product experience.',
  'What would be easy to miss about Josh from a quick resume scan?',
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
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/•/g, '-')
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '?');
}

function escapePdfLiteral(text) {
  return `(${sanitizePdfText(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')})`;
}

function approximatePdfTextWidth(text, fontSize) {
  return sanitizePdfText(text).length * fontSize * 0.48;
}

function wrapPdfText(text, maxWidth, fontSize) {
  const words = sanitizePdfText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (approximatePdfTextWidth(nextLine, fontSize) > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      return;
    }

    currentLine = nextLine;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [''];
}

function getPdfMessageLines(content, maxWidth, fontSize) {
  const normalizedContent = String(content || '')
    .trim()
    .replace(/\r\n?/g, '\n');

  if (!normalizedContent) {
    return [''];
  }

  return normalizedContent
    .split('\n')
    .flatMap((rawLine) => {
      const line = sanitizePdfText(rawLine).trimEnd();

      if (!line.trim()) {
        return [''];
      }

      const bulletMatch = line.match(/^(\s*)([-*•])\s+(.*)$/);

      if (!bulletMatch) {
        return wrapPdfText(line.trim(), maxWidth, fontSize);
      }

      const [, leadingWhitespace, bullet, bulletText] = bulletMatch;
      const bulletPrefix = `${leadingWhitespace}${bullet} `;
      const continuationPrefix = `${leadingWhitespace}  `;
      const firstLineMaxWidth =
        maxWidth - approximatePdfTextWidth(bulletPrefix, fontSize);
      const continuationMaxWidth =
        maxWidth - approximatePdfTextWidth(continuationPrefix, fontSize);
      const words = sanitizePdfText(bulletText).split(/\s+/).filter(Boolean);
      const wrappedBulletLines = [];
      let currentLine = '';
      let currentMaxWidth = firstLineMaxWidth;

      words.forEach((word) => {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;

        if (
          approximatePdfTextWidth(nextLine, fontSize) > currentMaxWidth &&
          currentLine
        ) {
          wrappedBulletLines.push(currentLine);
          currentLine = word;
          currentMaxWidth = continuationMaxWidth;
          return;
        }

        currentLine = nextLine;
      });

      if (currentLine) {
        wrappedBulletLines.push(currentLine);
      }

      return wrappedBulletLines.map((wrappedLine, index) =>
        index === 0
          ? `${bulletPrefix}${wrappedLine}`
          : `${continuationPrefix}${wrappedLine}`,
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
  let cursorY = topY;

  function textOp(text, x, y, fontName = 'F1', fontSize = 11) {
    return `BT /${fontName} ${fontSize} Tf ${x} ${y} Td ${escapePdfLiteral(
      text,
    )} Tj ET`;
  }

  function setFillColor(gray) {
    return `${gray} g`;
  }

  function newPage() {
    if (currentOps.length) {
      pages.push(currentOps.join('\n'));
    }

    currentOps = [];
    cursorY = topY;
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
    const textBlockHeight = lines.length * lineHeight;

    if (isUser) {
      const longestLineWidth = Math.max(
        ...lines.map((line) => approximatePdfTextWidth(line, bodyFontSize)),
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

      lines.forEach((line, index) => {
        currentOps.push(
          textOp(
            line,
            bubbleX + bubblePaddingX,
            cursorY - bubblePaddingY - bodyFontSize - index * lineHeight,
            'F1',
            bodyFontSize,
          ),
        );
      });

      cursorY -= bubbleHeight + 20;
      return;
    }

    ensureSpace(textBlockHeight + 18);
    lines.forEach((line, index) => {
      if (!line) {
        return;
      }

      currentOps.push(
        textOp(line, marginX, cursorY - bodyFontSize - index * lineHeight, 'F1', bodyFontSize),
      );
    });
    cursorY -= textBlockHeight + 18;
  });

  newPage();

  const fontRegularObject = 3 + pages.length * 2;
  const fontBoldObject = fontRegularObject + 1;
  const pageObjectNumbers = [];

  pages.forEach((content, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    pageObjectNumbers.push(pageObjectNumber);

    objects[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularObject} 0 R /F2 ${fontBoldObject} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    objects[contentObjectNumber] =
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
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
  const file = new File([blob], fileName, { type: 'application/pdf' });
  const isMobileLike =
    window.matchMedia?.('(hover: none) and (pointer: coarse)').matches ||
    window.matchMedia?.('(max-width: 640px)').matches;

  if (isMobileLike && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'AI Chat Conversation',
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

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

function AiChatPage() {
  const [messages, setMessages] = useState([]);
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
  const [hasLoadedStoredMessages, setHasLoadedStoredMessages] = useState(false);
  const abortControllerRef = useRef(null);
  const chatScrollerRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const warmupStartedRef = useRef(false);
  const activeAssistantMessageIdRef = useRef(null);
  const pendingStreamTextRef = useRef('');
  const flushTimerRef = useRef(null);
  const activeDebugLogRef = useRef(null);
  const firstStateUpdateScheduledRef = useRef(false);
  const firstVisibleUpdateLoggedRef = useRef(false);
  const firstVisibleTextFlushedRef = useRef(false);

  const selectedModelLabel = useMemo(() => {
    const rawLabel =
      modelOptions.find((model) => model.key === selectedModelKey)?.label ||
      'gpt-4.1';

    return formatModelLabel(rawLabel);
  }, [modelOptions, selectedModelKey]);

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
          setModelOptions([{ key: 'primary', label: 'gpt-4.1' }]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const storedMessages = readStoredMessages();

    if (storedMessages.length) {
      setMessages(storedMessages);
    }

    setHasLoadedStoredMessages(true);
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
    if (!isAutoScrollEnabled || !chatScrollerRef.current) {
      return;
    }

    chatScrollerRef.current.scrollTop = chatScrollerRef.current.scrollHeight;
  }, [messages, isStreaming, isAutoScrollEnabled]);

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

  function handleScroll() {
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
      await navigator.clipboard.writeText(message.content);
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

    try {
      debugLog?.('client.fetch_start');
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      if (error?.name !== 'AbortError') {
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
      clearStreamFlushTimer();
      flushPendingStreamText();
      abortControllerRef.current = null;
      activeAssistantMessageIdRef.current = null;
      pendingStreamTextRef.current = '';
      activeDebugLogRef.current = null;
      firstVisibleTextFlushedRef.current = false;
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

  async function downloadConversationPdf() {
    if (!messages.length) {
      return;
    }

    try {
      await downloadPdf({ messages, modelLabel: selectedModelLabel });
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

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1>Ask about Josh</h1>
            <p>
              A focused guide to Josh’s background, product work, research, and
              technical projects.
            </p>
          </div>

          <button
            className={styles.downloadButton}
            type="button"
            disabled={!messages.length}
            onClick={downloadConversationPdf}
          >
            <Download size={15} aria-hidden="true" />
            <span>Download conversation</span>
          </button>
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
                  <p
                    className={
                      isThinkingMessage(message) ? styles.thinkingText : undefined
                    }
                  >
                    {isThinkingMessage(message) ? 'Thinking' : message.content}
                  </p>

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
                          copiedMessageId === message.id
                            ? 'Copied'
                            : message.role === 'user'
                              ? 'Copy message'
                              : 'Copy response'
                        }
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
                  Try out an example question, or ask a custom question of your
                  own.
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
                <div className={styles.optionsSelector} ref={optionsMenuRef}>
                  <button
                    type="button"
                    className={styles.optionsButton}
                    aria-label="Chat options"
                    data-tooltip="Chat options"
                    onClick={() => {
                      setIsOptionsMenuOpen((isOpen) => !isOpen);
                      setOptionsPanel('main');
                    }}
                    aria-haspopup="menu"
                    aria-expanded={isOptionsMenuOpen}
                  >
                    <MoreHorizontal size={19} aria-hidden="true" />
                  </button>

                  {isOptionsMenuOpen ? (
                    <div
                      className={`${styles.optionsMenu} ${
                        optionsPanel === 'examples' ? styles.optionsMenuWide : ''
                      }`}
                      role="menu"
                    >
                      {optionsPanel === 'main' ? (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            disabled={isStreaming || isLimitReached}
                            onClick={() => setOptionsPanel('examples')}
                          >
                            Example Qs
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            disabled={!messages.length}
                            onClick={downloadConversationPdf}
                          >
                            <span className={styles.desktopDownloadLabel}>
                              Download chat
                            </span>
                            <span className={styles.mobileDownloadLabel}>
                              View / save PDF
                            </span>
                          </button>
                          {messages.length ? (
                            <button
                              type="button"
                              role="menuitem"
                              disabled={isStreaming}
                              onClick={() => {
                                setIsOptionsMenuOpen(false);
                                setOptionsPanel('main');
                                setIsNewChatDialogOpen(true);
                              }}
                            >
                              New chat
                            </button>
                          ) : null}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => setOptionsPanel('model')}
                          >
                            {selectedModelLabel}
                          </button>
                        </>
                      ) : null}

                      {optionsPanel === 'examples' ? (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => setOptionsPanel('main')}
                          >
                            ‹ Back
                          </button>
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
                        </>
                      ) : null}

                      {optionsPanel === 'model' ? (
                        <>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => setOptionsPanel('main')}
                          >
                            ‹ Back
                          </button>
                          {modelOptions.map((model) => (
                            <button
                              key={model.key}
                              type="button"
                              role="menuitemradio"
                              aria-checked={model.key === selectedModelKey}
                              onClick={() => {
                                setSelectedModelKey(model.key);
                                setIsOptionsMenuOpen(false);
                                setOptionsPanel('main');
                              }}
                            >
                              {formatModelLabel(model.label)}
                            </button>
                          ))}
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>

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
