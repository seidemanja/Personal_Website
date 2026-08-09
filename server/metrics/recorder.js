import crypto from 'node:crypto';

const DEFAULT_PRODUCTION_HOSTS = ['seidemanphd.com', 'www.seidemanphd.com'];
const DEFAULT_UMAMI_COLLECT_URL = 'https://gateway.umami.is/api/send';
const EVENT_NAMES = new Set([
  'error',
  'first_token',
  'message_sent',
  'model_selected',
  'rate_limit_hit',
  'response_completed',
  'response_stopped',
  'session_cap_reached',
  'session_started',
]);

function getHeader(request, name) {
  const value = request?.headers?.[name] ?? request?.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : String(value || '');
}

function getRequestHost(request) {
  return getHeader(request, 'x-forwarded-host') || getHeader(request, 'host');
}

function normalizeHost(host) {
  return host.trim().toLowerCase().replace(/:\d+$/, '');
}

function getProductionHosts() {
  const configuredHosts = String(process.env.ANALYTICS_PRODUCTION_HOSTS || '')
    .split(',')
    .map(normalizeHost)
    .filter(Boolean);

  return new Set(configuredHosts.length ? configuredHosts : DEFAULT_PRODUCTION_HOSTS);
}

function getRequestIp(request) {
  const forwardedFor = getHeader(request, 'x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return (
    getHeader(request, 'x-real-ip') ||
    request?.socket?.remoteAddress ||
    request?.connection?.remoteAddress ||
    ''
  );
}

function isExcludedIp(request) {
  const excludedHashes = new Set(
    String(process.env.EXCLUDED_IP_HASHES || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value) => /^[a-f0-9]{64}$/.test(value)),
  );

  if (!excludedHashes.size) {
    return false;
  }

  const ip = getRequestIp(request);

  if (!ip) {
    return false;
  }

  const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
  return excludedHashes.has(ipHash);
}

function shouldSkipMetrics(request) {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  if (getHeader(request, 'x-exclude-metrics') === '1') {
    return true;
  }

  if (!getProductionHosts().has(normalizeHost(getRequestHost(request)))) {
    return true;
  }

  return isExcludedIp(request);
}

function getSessionHash(sessionId) {
  if (!sessionId) {
    return '';
  }

  return crypto.createHash('sha256').update(sessionId).digest('hex').slice(0, 6);
}

function sanitizeMetric(event, session, { model, value } = {}) {
  if (!EVENT_NAMES.has(event) || !/^[a-f0-9]{6}$/.test(session)) {
    return null;
  }

  const data = { session };

  if (typeof model === 'string' && /^[A-Za-z0-9._-]{1,64}$/.test(model)) {
    data.model = model;
  }

  if (Number.isFinite(value) && value >= 0) {
    data.value = Math.round(value);
  }

  return data;
}

async function sendToUmami(event, data) {
  const websiteId =
    process.env.UMAMI_WEBSITE_ID || process.env.VITE_UMAMI_WEBSITE_ID;

  if (!websiteId) {
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    await fetch(process.env.UMAMI_COLLECT_URL || DEFAULT_UMAMI_COLLECT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'seidemanphd-chat-metrics/1.0',
      },
      body: JSON.stringify({
        type: 'event',
        payload: {
          website: websiteId,
          hostname: 'www.seidemanphd.com',
          url: '/ai-chat',
          title: 'AI Chat',
          name: event,
          data,
        },
      }),
      signal: controller.signal,
    });
  } catch {
    // Metrics failures are intentionally isolated from the chat request.
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createMetricsRecorder(request, sessionId) {
  const isDisabled = shouldSkipMetrics(request);
  const session = isDisabled ? '' : getSessionHash(sessionId);
  const pending = [];

  return {
    record(event, details) {
      if (isDisabled) {
        return;
      }

      try {
        const data = sanitizeMetric(event, session, details);

        if (data) {
          pending.push({ data, event });
        }
      } catch {
        // Metrics failures are intentionally isolated from the chat request.
      }
    },
    async flush() {
      try {
        await Promise.allSettled(
          pending.map(({ data, event }) => sendToUmami(event, data)),
        );
      } catch {
        // Metrics failures are intentionally isolated from the chat request.
      }
    },
  };
}
