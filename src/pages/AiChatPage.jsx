import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, Download } from 'lucide-react';
import Navigation from '../components/Navigation.jsx';
import styles from './AiChatPage.module.css';

const WARMUP_INTERVAL_MS = 10 * 60 * 1000;
const LAST_ACCEPTED_KEY = 'josh-ai-chat-last-accepted-at';
const CONVERSATION_LIMIT_MESSAGE =
  'This chat has reached its conversation limit. You can refresh the page to start a new session.';
const GENERIC_ERROR_MESSAGE =
  'Something went wrong — please try again in a moment.';

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

function buildExportMarkdown({ messages, modelLabel }) {
  const timestamp = new Date().toLocaleString();
  const transcript = messages
    .map((message) => {
      const label = message.role === 'user' ? 'User' : 'Assistant';
      return `## ${label}\n\n${message.content.trim()}`;
    })
    .join('\n\n');

  return `# AI Chat Conversation\n\nExport timestamp: ${timestamp}\n\nSelected model: ${modelLabel}\n\n${transcript}\n`;
}

function downloadMarkdown({ messages, modelLabel }) {
  const markdown = buildExportMarkdown({ messages, modelLabel });
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'ai-chat-conversation.md';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function AiChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [modelOptions, setModelOptions] = useState([]);
  const [selectedModelKey, setSelectedModelKey] = useState('primary');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const abortControllerRef = useRef(null);
  const chatScrollerRef = useRef(null);
  const warmupStartedRef = useRef(false);

  const selectedModelLabel = useMemo(() => {
    return (
      modelOptions.find((model) => model.key === selectedModelKey)?.label ||
      'Primary GPT model'
    );
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
          setModelOptions([{ key: 'primary', label: 'Primary GPT model' }]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  useEffect(() => {
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
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedInput = inputValue.trim();

    if (!trimmedInput || isStreaming || isLimitReached) {
      return;
    }

    const priorMessages = messages.slice(-10);
    const userMessage = createMessage('user', trimmedInput);
    const assistantMessage = createMessage('assistant', '');
    const controller = new AbortController();

    abortControllerRef.current = controller;
    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);
    setInputValue('');
    setErrorMessage('');
    setIsStreaming(true);
    setIsAutoScrollEnabled(true);

    try {
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

        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseBuffer(buffer, (eventName, payload) => {
          if (eventName === 'delta' && payload.text) {
            setMessages((currentMessages) =>
              currentMessages.map((message) =>
                message.id === assistantMessage.id
                  ? { ...message, content: `${message.content}${payload.text}` }
                  : message,
              ),
            );
          }

          if (eventName === 'error') {
            throw new Error('Stream failed');
          }
        });
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setErrorMessage(GENERIC_ERROR_MESSAGE);
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessage.id && !message.content
              ? { ...message, content: GENERIC_ERROR_MESSAGE }
              : message,
          ),
        );
      }
    } finally {
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }

  return (
    <main className={styles.page}>
      <Navigation variant="projects" />

      <div className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1>Ask about Josh</h1>
            <p>
              A lightweight assistant for questions about Josh’s work, projects,
              research, and technical background.
            </p>
          </div>

          <button
            className={styles.downloadButton}
            type="button"
            disabled={!messages.length}
            onClick={() =>
              downloadMarkdown({ messages, modelLabel: selectedModelLabel })
            }
          >
            <Download size={15} aria-hidden="true" />
            <span>Download conversation</span>
          </button>
        </header>

        <div className={styles.modelRow}>
          <div className={styles.modelSelector}>
            <button
              type="button"
              className={styles.modelButton}
              onClick={() => setIsModelMenuOpen((isOpen) => !isOpen)}
              aria-haspopup="menu"
              aria-expanded={isModelMenuOpen}
            >
              Model: {selectedModelLabel}
            </button>

            {isModelMenuOpen ? (
              <div className={styles.modelMenu} role="menu">
                {modelOptions.map((model) => (
                  <button
                    key={model.key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={model.key === selectedModelKey}
                    onClick={() => {
                      setSelectedModelKey(model.key);
                      setIsModelMenuOpen(false);
                    }}
                  >
                    {model.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <section className={styles.chatShell} aria-label="AI chat">
          <div
            className={styles.messages}
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
                  <h2>{message.role === 'user' ? 'You' : 'Assistant'}</h2>
                  <p>{message.content || ' '}</p>
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>
                Ask about Josh’s background, research, product work,
                publications, or independent projects.
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
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Ask a question, or paste context if you want a more tailored answer."
              disabled={isStreaming || isLimitReached}
              rows={3}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              type={isStreaming ? 'button' : 'submit'}
              onClick={isStreaming ? stopStreaming : undefined}
              disabled={isLimitReached || (!isStreaming && !inputValue.trim())}
            >
              {isStreaming ? 'Stop' : 'Send'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default AiChatPage;
