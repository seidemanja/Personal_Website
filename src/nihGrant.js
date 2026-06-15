export const NIH_GRANT_FALLBACK_URL =
  'https://reporter.nih.gov/project-details/9541718';

const CACHE_KEY = 'nih-grant-project-detail';
const CACHE_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const UPDATE_EVENT = 'nih-grant-url-updated';
let grantRefreshPromise = null;

function isReporterProjectUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'reporter.nih.gov' &&
      url.pathname.startsWith('/project-details/')
    );
  } catch {
    return false;
  }
}

function readCachedGrant() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cachedValue = window.localStorage.getItem(CACHE_KEY);
    const cachedGrant = cachedValue ? JSON.parse(cachedValue) : null;

    if (
      !isReporterProjectUrl(cachedGrant?.projectDetailUrl) ||
      typeof cachedGrant?.refreshedAt !== 'number'
    ) {
      return null;
    }

    return cachedGrant;
  } catch {
    return null;
  }
}

export function getNIHGrantUrl() {
  return readCachedGrant()?.projectDetailUrl ?? NIH_GRANT_FALLBACK_URL;
}

export function subscribeToNIHGrantUrl(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleUpdate = (event) => callback(event.detail);
  window.addEventListener(UPDATE_EVENT, handleUpdate);

  return () => window.removeEventListener(UPDATE_EVENT, handleUpdate);
}

export async function refreshNIHGrantUrl({ force = false } = {}) {
  if (typeof window === 'undefined') {
    return NIH_GRANT_FALLBACK_URL;
  }

  const cachedGrant = readCachedGrant();
  const isFresh =
    cachedGrant &&
    Date.now() - cachedGrant.refreshedAt < CACHE_MAX_AGE_MS;

  if (!force && isFresh) {
    return cachedGrant.projectDetailUrl;
  }

  if (grantRefreshPromise) {
    return grantRefreshPromise;
  }

  grantRefreshPromise = (async () => {
    try {
      const response = await fetch('/api/nih-grant', {
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Grant lookup returned ${response.status}`);
      }

      const grant = await response.json();

      if (!isReporterProjectUrl(grant.projectDetailUrl)) {
        throw new Error('Grant lookup returned an invalid URL');
      }

      const cacheValue = {
        projectDetailUrl: grant.projectDetailUrl,
        refreshedAt: Date.now(),
      };

      window.localStorage.setItem(CACHE_KEY, JSON.stringify(cacheValue));
      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, {
          detail: grant.projectDetailUrl,
        }),
      );

      return grant.projectDetailUrl;
    } catch {
      return cachedGrant?.projectDetailUrl ?? NIH_GRANT_FALLBACK_URL;
    } finally {
      grantRefreshPromise = null;
    }
  })();

  return grantRefreshPromise;
}
