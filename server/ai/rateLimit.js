import crypto from 'node:crypto';

const SESSION_COOKIE = 'josh_ai_chat_session';
const MAX_USER_MESSAGES = 30;
const MIN_REQUEST_GAP_MS = 500;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

const sessions = new Map();

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join('=') || '');
    return cookies;
  }, {});
}

function createSession() {
  const now = Date.now();
  const id = crypto.randomUUID();
  sessions.set(id, {
    createdAt: now,
    lastAcceptedAt: 0,
    messageCount: 0,
  });
  return { id, isNew: true };
}

function getExistingSession(request) {
  const cookies = parseCookies(request.headers.cookie);
  const sessionId = cookies[SESSION_COOKIE];

  if (!sessionId || !sessions.has(sessionId)) {
    return createSession();
  }

  return { id: sessionId, isNew: false };
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionCookieValue(sessionId) {
  return `${SESSION_COOKIE}=${encodeURIComponent(
    sessionId,
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}`;
}

export function prepareSession(request, { resetSession = false } = {}) {
  return resetSession ? createSession() : getExistingSession(request);
}

export function checkAndTrackRequest(sessionId, { isWarmup = false } = {}) {
  const now = Date.now();
  const session = sessions.get(sessionId);

  if (!session) {
    return {
      ok: false,
      status: 403,
      code: 'invalid_session',
    };
  }

  if (now - session.lastAcceptedAt < MIN_REQUEST_GAP_MS) {
    return {
      ok: false,
      status: 429,
      code: 'too_fast',
    };
  }

  if (!isWarmup && session.messageCount >= MAX_USER_MESSAGES) {
    return {
      ok: false,
      status: 429,
      code: 'conversation_limit',
    };
  }

  session.lastAcceptedAt = now;

  if (!isWarmup) {
    session.messageCount += 1;
  }

  return {
    ok: true,
    messageCount: session.messageCount,
  };
}

