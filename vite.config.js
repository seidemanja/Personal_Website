import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function prerenderRoutesInDevelopment() {
  let developmentServer;

  return {
    name: 'prerender-routes-in-development',
    apply: 'serve',
    configureServer(server) {
      developmentServer = server;
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, context) {
        const pathname = new URL(
          context.originalUrl || '/',
          'http://localhost',
        ).pathname;

        if (!['/', '/projects', '/resume'].includes(pathname) || !developmentServer) {
          return html;
        }

        const { renderHomePage, renderProjectsPage, renderResumePage } =
          await developmentServer.ssrLoadModule('/src/entry-server.jsx');
        const isResume = pathname === '/resume';
        const isProjects = pathname === '/projects';
        const renderedPage = isResume
          ? renderResumePage()
          : isProjects
            ? renderProjectsPage()
            : renderHomePage();
        const pageStylesheet = isResume
          ? '/src/pages/ResumePage.module.css?direct'
          : isProjects
            ? '/src/pages/SelectedProjectsPage.module.css?direct'
            : '/src/pages/HomePage.module.css?direct';

        return {
          html: html.replace(
            '<div id="root"></div>',
            `<div id="root">${renderedPage}</div>`,
          ),
          tags: [
            {
              tag: 'link',
              attrs: {
                rel: 'stylesheet',
                href: '/src/styles/global.css?direct',
              },
              injectTo: 'head-prepend',
            },
            {
              tag: 'link',
              attrs: {
                rel: 'stylesheet',
                href: '/src/components/Navigation.module.css?direct',
              },
              injectTo: 'head-prepend',
            },
            {
              tag: 'link',
              attrs: {
                rel: 'stylesheet',
                href: pageStylesheet,
              },
              injectTo: 'head-prepend',
            },
          ],
        };
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), prerenderRoutesInDevelopment()],
});
