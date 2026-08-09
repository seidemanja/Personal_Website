import { useEffect } from 'react';
import { trackAnalyticsEvent } from '../analytics.js';

const PROJECT_PATH_PREFIX = '/projects/';
const EXTERNAL_HOSTS = new Map([
  ['github.com', 'github'],
  ['www.github.com', 'github'],
  ['linkedin.com', 'linkedin'],
  ['www.linkedin.com', 'linkedin'],
  ['scholar.google.com', 'google_scholar'],
  ['opensea.io', 'opensea'],
  ['www.opensea.io', 'opensea'],
]);

function getProjectName(pathname) {
  if (!pathname.startsWith(PROJECT_PATH_PREFIX)) {
    return '';
  }

  return pathname.slice(PROJECT_PATH_PREFIX.length).split('/')[0];
}

export default function useSiteAnalytics(pathname) {
  useEffect(() => {
    const project = getProjectName(pathname);

    if (project) {
      trackAnalyticsEvent('project_page_view', { project });
    }
  }, [pathname]);

  useEffect(() => {
    function handleDocumentClick(event) {
      try {
        const link = event.target.closest?.('a[href]');

        if (!link) {
          return;
        }

        const href = link.getAttribute('href') || '';

        if (link.hasAttribute('download') && href.includes('/pdfs/Joshua_Seideman_Resume_')) {
          trackAnalyticsEvent('resume_pdf_download');
          return;
        }

        const destination = EXTERNAL_HOSTS.get(new URL(link.href).hostname);

        if (destination) {
          trackAnalyticsEvent('external_link_click', { destination });
        }
      } catch {
        // Analytics observers must never affect link behavior.
      }
    }

    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, []);
}
