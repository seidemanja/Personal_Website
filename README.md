# Joshua Seideman — Personal Website

Personal portfolio website for Joshua Seideman, PhD.

Live site: [add deployed URL here]

The site presents Josh's professional background, resume, selected projects, research work, publications, and an AI chat assistant grounded in a private Markdown knowledge document covering his work and research.

<!-- Optional: add 1-2 screenshots here, e.g. -->
<!-- ![Homepage screenshot](./readme-assets/homepage.png) -->

## Features

- Responsive personal homepage
- Resume page
- Selected projects overview
- Project detail pages for:
  - Instagram content creation and engagement automation
  - Automated Twitter giveaway entry
  - PhD research in neuroscience
- Server-side AI Chat page for questions about Josh's work, projects, research, publications, and technical background
- PDF export for visible AI chat conversations
- PWA/service-worker image caching for smoother local and production refresh behavior

## Tech stack

- JavaScript
- React / JSX
- CSS Modules
- HTML
- Markdown
- Node.js server-side API handlers
- Vite
- React Router
- OpenAI API for the AI Chat feature

## Local development

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev -- --host 0.0.0.0
```

Desktop local URL:

```text
http://localhost:5173/
```

Mobile testing URL:

Use the `Network:` URL printed by Vite, for example:

```text
http://<your-local-ip>:5173/
```

The AI Chat API is available during local development through the Vite middleware.

## Production build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview -- --host 0.0.0.0
```

Vite preview serves the static production build. For local AI Chat API testing, use `npm run dev`.

## AI Chat configuration

The AI Chat feature uses server-side OpenAI API calls. Required environment variables:

```text
OPENAI_API_KEY
OPENAI_MODEL
OPENAI_FALLBACK_MODEL
GROUNDING_DOC_VERSION
```

The API key must remain server-side and should never be committed to GitHub.

The grounding document is stored server-side under `server/knowledge/` and is intentionally excluded from the public/static asset directory.

## About

Built by Joshua Seideman, PhD.

- [LinkedIn](https://www.linkedin.com/in/joshua-a-seideman/)
- [Email](mailto:josh.seideman@me.com)

## License

All rights reserved.
