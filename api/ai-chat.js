import { checkAndTrackRequest, getSessionCookieValue, prepareSession } from '../server/ai/rateLimit.js';
import { resolveModel } from '../server/ai/modelConfig.js';
import { streamOpenAIResponse } from '../server/ai/openaiResponses.js';
import { createMetricsRecorder } from '../server/metrics/recorder.js';
import {
  CHAT_MESSAGE_TOO_LONG_SERVER_MESSAGE,
  MAX_CHAT_MESSAGE_LENGTH,
} from '../shared/chatLimits.js';

function createServerDebugLogger() {
  if (process.env.CHAT_STREAM_DEBUG !== 'true') {
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

function sendJson(response, statusCode, body, headers = {}) {
  Object.entries(headers).forEach(([name, value]) => {
    response.setHeader(name, value);
  });
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
}

async function readJsonRequest(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((message) => message?.role === 'user' || message?.role === 'assistant')
    .map((message) => ({
      role: message.role,
      content: String(message.content || '').slice(0, 6000),
    }))
    .filter((message) => message.content.trim());
}

export default async function handler(request, response) {
  const debugLog = createServerDebugLogger();
  debugLog?.('server.request_start');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { error: 'Method not allowed' });
  }

  let body;

  try {
    body = await readJsonRequest(request);
  } catch {
    return sendJson(response, 400, { error: 'Invalid JSON body' });
  }

  if (body?.type === 'reset') {
    const { id: sessionId } = prepareSession(request, { resetSession: true });
    return sendJson(
      response,
      200,
      { ok: true },
      {
        'Set-Cookie': getSessionCookieValue(sessionId),
      },
    );
  }

  const isWarmup = body?.type === 'warmup';

  if (!isWarmup) {
    const submittedMessage =
      typeof body?.message === 'string'
        ? body.message
        : String(body?.message ?? '');

    if (submittedMessage.length > MAX_CHAT_MESSAGE_LENGTH) {
      return sendJson(response, 400, {
        error: 'message_too_long',
        message: CHAT_MESSAGE_TOO_LONG_SERVER_MESSAGE,
        maxLength: MAX_CHAT_MESSAGE_LENGTH,
        receivedLength: submittedMessage.length,
      });
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(response, 500, {
      error: 'OpenAI API key is not configured',
    });
  }

  const resetSession = Boolean(body?.resetSession);
  const { id: sessionId, isNew } = prepareSession(request, { resetSession });
  const metrics = createMetricsRecorder(request, sessionId);
  const rateLimit = checkAndTrackRequest(sessionId, { isWarmup });
  const sessionCookie = getSessionCookieValue(sessionId);

  if (!rateLimit.ok) {
    metrics.record(
      rateLimit.code === 'conversation_limit'
        ? 'session_cap_reached'
        : 'rate_limit_hit',
    );
    sendJson(
      response,
      rateLimit.status,
      {
        error: rateLimit.code,
      },
      {
        'Set-Cookie': sessionCookie,
      },
    );
    await metrics.flush();
    return;
  }

  const model = resolveModel(body?.modelKey);

  if (!isWarmup) {
    if (rateLimit.messageCount === 1) {
      metrics.record('session_started', { model: model.model });
    }
    metrics.record('message_sent', {
      model: model.model,
      value: rateLimit.messageCount,
    });
  }
  const abortController = new AbortController();

  response.on?.('close', () => {
    if (!response.writableEnded) {
      debugLog?.('server.abort');
      abortController.abort();
    }
  });

  response.setHeader('Set-Cookie', sessionCookie);
  response.setHeader('X-AI-Chat-Session', isNew ? 'new' : 'existing');
  response.setHeader('X-AI-Chat-Model', model.key);

  try {
    await streamOpenAIResponse({
      response,
      modelKey: model.key,
      message: body?.message,
      history: normalizeHistory(body?.history),
      isWarmup,
      signal: abortController.signal,
      debugLog,
      onMetric(event, value) {
        if (!isWarmup) {
          metrics.record(event, { model: model.model, value });
        }
      },
    });
  } catch (error) {
    debugLog?.('server.error', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error?.name === 'AbortError') {
      await metrics.flush();
      return;
    }

    metrics.record('error', { model: model.model, value: 502 });

    if (response.headersSent) {
      response.write('event: error\n');
      response.write('data: {}\n\n');
      response.end();
      await metrics.flush();
      return;
    }

    console.error('ai-chat request failed', {
      modelKey: model.key,
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    sendJson(response, 502, {
      error: 'request_failed',
    });
    await metrics.flush();
    return;
  }

  await metrics.flush();
}
