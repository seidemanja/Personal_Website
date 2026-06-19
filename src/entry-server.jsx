import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import App from './App.jsx';

function renderPage(location) {
  return renderToString(
    <React.StrictMode>
      <StaticRouter location={location}>
        <App />
      </StaticRouter>
    </React.StrictMode>,
  );
}

export function renderHomePage() {
  return renderPage('/');
}

export function renderResumePage() {
  return renderPage('/resume');
}

export function renderProjectsPage() {
  return renderPage('/projects');
}

export function renderInstagramProjectPage() {
  return renderPage('/projects/instagram-automation');
}

export function renderNeuroscienceProjectPage() {
  return renderPage('/projects/neuroscience-research');
}
