import { checkAndTrackRequest, getSessionCookieValue, prepareSession } from '../server/ai/rateLimit.js';
import { resolveModel } from '../server/ai/modelConfig.js';
import { streamOpenAIResponse } from '../server/ai/openaiResponses.js';

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
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendJson(response, 405, { error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(response, 500, {
      error: 'OpenAI API key is not configured',
    });
  }

  let body;

  try {
    body = await readJsonRequest(request);
  } catch {
    return sendJson(response, 400, { error: 'Invalid JSON body' });
  }

  const isWarmup = body?.type === 'warmup';
  const resetSession = Boolean(body?.resetSession);
  const { id: sessionId, isNew } = prepareSession(request, { resetSession });
  const rateLimit = checkAndTrackRequest(sessionId, { isWarmup });
  const sessionCookie = getSessionCookieValue(sessionId);

  if (!rateLimit.ok) {
    return sendJson(
      response,
      rateLimit.status,
      {
        error: rateLimit.code,
      },
      {
        'Set-Cookie': sessionCookie,
      },
    );
  }

  const model = resolveModel(body?.modelKey);
  const abortController = new AbortController();

  response.on?.('close', () => {
    if (!response.writableEnded) {
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
    });
  } catch (error) {
    if (response.headersSent) {
      response.write('event: error\n');
      response.write('data: {}\n\n');
      response.end();
      return;
    }

    console.error('ai-chat request failed', {
      modelKey: model.key,
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return sendJson(response, 502, {
      error: 'request_failed',
    });
  }
}
