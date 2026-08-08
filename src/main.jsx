import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';

const rootElement = document.getElementById('root');
const projectDetailSnapshotPaths = new Set([
  '/ai-chat',
  '/resume',
  '/projects',
  '/projects/instagram-automation',
  '/projects/neuroscience-research',
  '/projects/personal-website-ai-assistant',
  '/projects/product-management-data-ai',
  '/projects/twitter-automation',
]);
function saveProjectDetailSnapshot() {
  const normalizedPathname =
    window.location.pathname.replace(/\/+$/, '') || '/';

  if (!rootElement || !projectDetailSnapshotPaths.has(normalizedPathname)) {
    return;
  }

  try {
    sessionStorage.setItem(
      `project-detail-snapshot:${normalizedPathname}`,
      JSON.stringify({
        html: rootElement.innerHTML,
        version: 'project-detail-refresh-v32',
      }),
    );
  } catch {
    // If session storage is unavailable or full, fall back to normal rendering.
  }
}

const app = (
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}

window.addEventListener('pagehide', saveProjectDetailSnapshot);
