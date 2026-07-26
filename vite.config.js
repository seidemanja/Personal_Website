import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import aiChatHandler from './api/ai-chat.js';
import aiChatModelsHandler from './api/ai-chat-models.js';
import nihGrantHandler from './api/nih-grant.js';

function prerenderRoutesInDevelopment() {
  let developmentServer;

  return {
    name: 'prerender-routes-in-development',
    apply: 'serve',
    configureServer(server) {
      developmentServer = server;

      server.middlewares.use('/api/ai-chat-models', async (request, response) => {
        await aiChatModelsHandler(request, response);
      });

      server.middlewares.use('/api/ai-chat', async (request, response) => {
        await aiChatHandler(request, response);
      });

      server.middlewares.use('/api/nih-grant', async (request, response) => {
        const apiResponse = {
          setHeader(name, value) {
            response.setHeader(name, value);
          },
          status(statusCode) {
            response.statusCode = statusCode;
            return this;
          },
          json(body) {
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(body));
          },
        };

        await nihGrantHandler(request, apiResponse);
      });
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, context) {
        const pathname = new URL(
          context.originalUrl || '/',
          'http://localhost',
        ).pathname;

        if (
          ![
            '/',
            '/ai-chat',
            '/projects',
            '/projects/instagram-automation',
            '/projects/neuroscience-research',
            '/projects/personal-website-ai-assistant',
            '/projects/twitter-automation',
            '/resume',
          ].includes(pathname) ||
          !developmentServer
        ) {
          return html;
        }

        const {
          renderAiChatPage,
          renderHomePage,
          renderInstagramProjectPage,
          renderNeuroscienceProjectPage,
          renderPersonalWebsiteProjectPage,
          renderProjectsPage,
          renderResumePage,
          renderTwitterProjectPage,
        } = await developmentServer.ssrLoadModule('/src/entry-server.jsx');
        const isResume = pathname === '/resume';
        const isAiChat = pathname === '/ai-chat';
        const isProjects = pathname === '/projects';
        const isInstagramProject =
          pathname === '/projects/instagram-automation';
        const isNeuroscienceProject =
          pathname === '/projects/neuroscience-research';
        const isPersonalWebsiteProject =
          pathname === '/projects/personal-website-ai-assistant';
        const isTwitterProject =
          pathname === '/projects/twitter-automation';
        const renderedPage = isResume
          ? renderResumePage()
          : isAiChat
            ? renderAiChatPage()
          : isInstagramProject
            ? renderInstagramProjectPage()
          : isNeuroscienceProject
            ? renderNeuroscienceProjectPage()
          : isPersonalWebsiteProject
            ? renderPersonalWebsiteProjectPage()
          : isTwitterProject
            ? renderTwitterProjectPage()
          : isProjects
            ? renderProjectsPage()
            : renderHomePage();
        const pageStylesheet = isResume
          ? '/src/pages/ResumePage.module.css?direct'
          : isAiChat
            ? '/src/pages/AiChatPage.module.css?direct'
          : isInstagramProject
            ? '/src/pages/InstagramProjectPage.module.css?direct'
          : isNeuroscienceProject
            ? '/src/pages/NeuroscienceProjectPage.module.css?direct'
          : isPersonalWebsiteProject
            ? '/src/pages/PersonalWebsiteProjectPage.module.css?direct'
          : isTwitterProject
            ? '/src/pages/InstagramProjectPage.module.css?direct'
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  Object.entries(env).forEach(([key, value]) => {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          navigateFallback: null,
          globPatterns: ['**/*.{png,PNG,jpg,jpeg,svg,gif,webp}'],
          globIgnores: ['**/*.html'],
          runtimeCaching: [
            {
              urlPattern: /\/images\//,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
      }),
      prerenderRoutesInDevelopment(),
    ],
  };
});
