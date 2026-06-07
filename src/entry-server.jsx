import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import HomePage from './pages/HomePage.jsx';
import ResumeLayout, {
  ResumePageSkeleton,
} from './pages/ResumeLayout.jsx';
import SelectedProjectsPage from './pages/SelectedProjectsPage.jsx';

function renderPage(location, page) {
  return renderToString(
    <React.StrictMode>
      <StaticRouter location={location}>{page}</StaticRouter>
    </React.StrictMode>,
  );
}

export function renderHomePage() {
  return renderPage('/', <HomePage />);
}

export function renderResumePage() {
  return renderPage(
    '/resume',
    <ResumeLayout>
      <ResumePageSkeleton />
    </ResumeLayout>,
  );
}

export function renderProjectsPage() {
  return renderPage('/projects', <SelectedProjectsPage />);
}
