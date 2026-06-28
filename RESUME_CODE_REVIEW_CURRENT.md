# Current Resume Page Code Review Package

Created June 7, 2026 from the current working tree.

## Included Behavior

- PDF.js canvas rendering through React-PDF
- Custom selectable PDF.js text layer
- PDF annotation/link layer
- White loading shell and page shadows
- Lazy canvas rendering for later pages
- In-memory PDF caching
- Homepage idle preload
- Resume-link hover/focus/touch preload
- Persistent mounted resume page after first navigation
- Download button and responsive layout
- SSR/prerender configuration

## Run

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/resume
```

## Relevant Files

- `src/pages/ResumePage.jsx`
- `src/pages/ResumePage.module.css`
- `src/pages/ResumeLayout.jsx`
- `src/resumePdfAsset.js`
- `src/resumeConstants.js`
- `src/components/Navigation.jsx`
- `src/pages/HomePage.jsx`
- `src/App.jsx`
- `src/routes.js`
- `src/main.jsx`
- `src/entry-server.jsx`
- `src/styles/global.css`
- `vite.config.js`
- `scripts/prerender.mjs`
- `package.json`
- `package-lock.json`
- `public/pdfs/Joshua_Seideman_Resume_05232026.pdf`

This package reflects uncommitted working-tree changes and is newer than previous review ZIP files.
