export const NIH_GRANT_SEARCH_FALLBACK_URL =
  'https://reporter.nih.gov/search/WklpgzqrcUajkI5QHAvF0A/projects';

const CACHE_KEY = 'nih-grant-search-results-v1';
const CACHE_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const UPDATE_EVENT = 'nih-grant-search-url-updated';
let grantSearchRefreshPromise = null;

function isReporterSearchUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'reporter.nih.gov' &&
      /^\/search\/[A-Za-z0-9_-]+\/projects\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function readCachedGrantSearch() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cachedValue = window.localStorage.getItem(CACHE_KEY);
    const cachedSearch = cachedValue ? JSON.parse(cachedValue) : null;

    if (
      !isReporterSearchUrl(cachedSearch?.grantSearchUrl) ||
      typeof cachedSearch?.refreshedAt !== 'number'
    ) {
      return null;
    }

    return cachedSearch;
  } catch {
    return null;
  }
}

export function getNIHGrantSearchUrl() {
  return readCachedGrantSearch()?.grantSearchUrl ?? NIH_GRANT_SEARCH_FALLBACK_URL;
}

export function subscribeToNIHGrantSearchUrl(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleUpdate = (event) => callback(event.detail);
  window.addEventListener(UPDATE_EVENT, handleUpdate);

  return () => window.removeEventListener(UPDATE_EVENT, handleUpdate);
}

export async function refreshNIHGrantSearchUrl({ force = false } = {}) {
  if (typeof window === 'undefined') {
    return NIH_GRANT_SEARCH_FALLBACK_URL;
  }

  const cachedSearch = readCachedGrantSearch();
  const isFresh =
    cachedSearch &&
    Date.now() - cachedSearch.refreshedAt < CACHE_MAX_AGE_MS;

  if (!force && isFresh) {
    return cachedSearch.grantSearchUrl;
  }

  if (grantSearchRefreshPromise) {
    return grantSearchRefreshPromise;
  }

  grantSearchRefreshPromise = (async () => {
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

      if (!isReporterSearchUrl(grant.grantSearchUrl)) {
        throw new Error('Grant lookup returned an invalid search URL');
      }

      const cacheValue = {
        grantSearchUrl: grant.grantSearchUrl,
        refreshedAt: Date.now(),
      };

      window.localStorage.setItem(CACHE_KEY, JSON.stringify(cacheValue));
      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, {
          detail: grant.grantSearchUrl,
        }),
      );

      return grant.grantSearchUrl;
    } catch {
      return cachedSearch?.grantSearchUrl ?? NIH_GRANT_SEARCH_FALLBACK_URL;
    } finally {
      grantSearchRefreshPromise = null;
    }
  })();

  return grantSearchRefreshPromise;
}
