const ANALYTICS_EXCLUSION_KEY = 'exclude_analytics';
const PRODUCTION_HOSTS = new Set(['seidemanphd.com', 'www.seidemanphd.com']);
const PROJECT_NAMES = new Set([
  'instagram-automation',
  'neuroscience-research',
  'personal-website-ai-assistant',
  'product-management-data-ai',
  'twitter-automation',
]);
const EXTERNAL_DESTINATIONS = new Set([
  'github',
  'google_scholar',
  'linkedin',
  'opensea',
]);
const CHAT_METRIC_EVENTS = new Set(['model_selected', 'response_stopped']);

let analyticsLoadStarted = false;
let analyticsReady = false;
let pendingEvents = [];

function hasWindow() {
  return typeof window !== 'undefined';
}

function isProductionAnalyticsContext() {
  return (
    hasWindow() &&
    import.meta.env.PROD &&
    PRODUCTION_HOSTS.has(window.location.hostname)
  );
}

export function applyAnalyticsExclusionFromUrl() {
  if (!hasWindow()) {
    return;
  }

  try {
    const url = new URL(window.location.href);
    const exclusionValue = url.searchParams.get('exclude-me');

    if (exclusionValue !== '1' && exclusionValue !== '0') {
      return;
    }

    if (exclusionValue === '1') {
      window.localStorage.setItem(ANALYTICS_EXCLUSION_KEY, '1');
    } else {
      window.localStorage.removeItem(ANALYTICS_EXCLUSION_KEY);
    }

    url.searchParams.delete('exclude-me');
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  } catch {
    // Analytics preferences must never interfere with page initialization.
  }
}

export function isAnalyticsExcluded() {
  if (!hasWindow()) {
    return true;
  }

  try {
    return window.localStorage.getItem(ANALYTICS_EXCLUSION_KEY) === '1';
  } catch {
    return false;
  }
}

function sanitizeEventData(eventName, data) {
  if (eventName === 'project_page_view') {
    return PROJECT_NAMES.has(data?.project) ? { project: data.project } : null;
  }

  if (eventName === 'external_link_click') {
    return EXTERNAL_DESTINATIONS.has(data?.destination)
      ? { destination: data.destination }
      : null;
  }

  if (eventName === 'resume_pdf_download' || eventName === 'chat_pdf_export') {
    return undefined;
  }

  return null;
}

function flushPendingEvents() {
  if (!analyticsReady || !window.umami?.track || isAnalyticsExcluded()) {
    pendingEvents = [];
    return;
  }

  const events = pendingEvents;
  pendingEvents = [];

  events.forEach(({ data, eventName }) => {
    try {
      window.umami.track(eventName, data);
    } catch {
      // Third-party analytics failures are intentionally ignored.
    }
  });
}

export function initializeAnalytics() {
  if (
    analyticsLoadStarted ||
    !isProductionAnalyticsContext() ||
    isAnalyticsExcluded()
  ) {
    return;
  }

  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

  if (!websiteId) {
    return;
  }

  analyticsLoadStarted = true;

  try {
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = 'https://cloud.umami.is/script.js';
    script.dataset.websiteId = websiteId;
    script.dataset.domains = 'seidemanphd.com,www.seidemanphd.com';
    script.addEventListener('load', () => {
      analyticsReady = true;
      flushPendingEvents();
    });
    script.addEventListener('error', () => {
      pendingEvents = [];
    });
    document.head.appendChild(script);
  } catch {
    pendingEvents = [];
  }
}

export function scheduleAnalyticsInitialization() {
  if (!isProductionAnalyticsContext() || isAnalyticsExcluded()) {
    return;
  }

  try {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initializeAnalytics, { timeout: 1500 });
    } else {
      window.setTimeout(initializeAnalytics, 0);
    }
  } catch {
    // Analytics initialization is optional and must remain invisible to users.
  }
}

export function trackAnalyticsEvent(eventName, data) {
  if (!isProductionAnalyticsContext() || isAnalyticsExcluded()) {
    return;
  }

  const sanitizedData = sanitizeEventData(eventName, data);

  if (sanitizedData === null) {
    return;
  }

  try {
    const event = { eventName, data: sanitizedData };

    if (!analyticsReady || !window.umami?.track) {
      if (pendingEvents.length < 20) {
        pendingEvents.push(event);
      }
      return;
    }

    window.setTimeout(() => {
      try {
        window.umami?.track(eventName, sanitizedData);
      } catch {
        // Event tracking must never alter the interaction that triggered it.
      }
    }, 0);
  } catch {
    // Event tracking must never alter the interaction that triggered it.
  }
}

export function getMetricsExclusionHeaders() {
  return isAnalyticsExcluded() ? { 'X-Exclude-Metrics': '1' } : {};
}

export function sendChatMetric(event, { modelKey, value } = {}) {
  if (
    !isProductionAnalyticsContext() ||
    isAnalyticsExcluded() ||
    !CHAT_METRIC_EVENTS.has(event)
  ) {
    return;
  }

  const payload = { event };

  if (typeof modelKey === 'string' && modelKey.length <= 32) {
    payload.modelKey = modelKey;
  }

  if (Number.isFinite(value) && value >= 0) {
    payload.value = Math.round(value);
  }

  try {
    void fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getMetricsExclusionHeaders(),
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Chat metrics are lower priority than every user-facing chat action.
  }
}
