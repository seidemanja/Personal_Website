import {
  getSessionCookieValue,
  prepareSession,
} from '../server/ai/rateLimit.js';
import { resolveModel } from '../server/ai/modelConfig.js';
import { createMetricsRecorder } from '../server/metrics/recorder.js';

const CLIENT_EVENT_NAMES = new Set(['model_selected', 'response_stopped']);

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

  return chunks.length
    ? JSON.parse(Buffer.concat(chunks).toString('utf8'))
    : {};
}

export default async function handler(request, response) {
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

  if (!CLIENT_EVENT_NAMES.has(body?.event)) {
    return sendJson(response, 400, { error: 'Invalid event' });
  }

  const { id: sessionId } = prepareSession(request);
  const recorder = createMetricsRecorder(request, sessionId);
  const model = resolveModel(body?.modelKey);
  const value = Number.isFinite(body?.value) ? body.value : undefined;

  recorder.record(body.event, { model: model.model, value });
  sendJson(
    response,
    202,
    { ok: true },
    { 'Set-Cookie': getSessionCookieValue(sessionId) },
  );
  await recorder.flush();
}
