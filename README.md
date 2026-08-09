# Joshua Seideman, PhD — Personal Website

[www.seidemanphd.com](https://www.seidemanphd.com)

Personal portfolio and project case studies. Product manager working in data and AI, with a background in neuroscience research.

The site pairs a resume and selected-work portfolio with a grounded AI assistant that lets visitors explore the same material conversationally.

I designed and built the site using AI-assisted development (OpenAI Codex).

## Site Contents

| Area | Purpose |
| --- | --- |
| [Home](https://www.seidemanphd.com/) | Professional identity, contact points, and primary navigation |
| [Resume](https://www.seidemanphd.com/resume) | Product leadership, scientific experience, education, publications, and technical skills |
| [Selected Work](https://www.seidemanphd.com/projects) | A curated portfolio spanning professional, research, and independent projects |
| [AI Chat](https://www.seidemanphd.com/ai-chat) | A grounded conversational interface for questions about the background and work presented on the site |

Selected Work includes detailed project pages covering:

- Product management for data and AI products
- PhD research in neuroscience
- The design and development of this website and its grounded AI assistant
- Automated Instagram content creation and engagement
- Automated Twitter giveaway discovery and entry

Each page is structured around the aspects most relevant to the work, including outcomes, decision-making, problem framing, product strategy, experimental design, system architecture, delivery methods, metrics, publications, and representative outputs.

## Product and Engineering Approach

### Content-first responsive design

Layouts are intentionally composed for wide desktop, narrow desktop, and mobile contexts. The responsive design uses purpose-selected image variants, breakpoint-specific content treatments, and mobile interaction patterns rather than relying only on proportional scaling.

### Prerendered React application

The site is built as a React application with route-level static prerendering. The production build renders each public route to HTML, inlines critical CSS, and then hydrates the application in the browser. This preserves client-side interactions while improving first render stability and ensuring that core content exists before JavaScript executes.

### Grounded AI assistant

The AI Chat experience is constrained to a server-side knowledge document covering the professional experience, projects, publications, and research presented throughout the site. The implementation:

- Keeps the OpenAI API key and grounding source out of the browser bundle
- Uses an explicit system prompt to define scope, tone, and disclosure boundaries
- Streams responses from a server-side API for low perceived latency
- Offers a server-controlled model allowlist rather than accepting arbitrary model names
- Limits conversation history and input size before forwarding requests
- Applies session-based request pacing and conversation limits
- Stores browser chat history in session storage and supports client-side PDF export

### Stable external references

The NIH RePORTER grant link is resolved through a server-side endpoint instead of relying on a permanently hard-coded search URL. The endpoint refreshes the search against the NIH API and returns the current results page for grant `F31EY029154`, with cache and stale-while-revalidate behavior to balance freshness and reliability.

### Performance and interaction stability

The build includes image-focused service-worker caching, critical CSS injection, and route snapshots used to reduce visible layout changes during repeat navigation and refreshes. Interactive controls use semantic labels, and reduced-motion preferences are respected where motion is present.

## Technical Architecture

| Layer | Implementation |
| --- | --- |
| UI | React 18, React Router, CSS Modules, Lucide icons |
| Build | Vite with a custom SSR/prerender pass |
| Client delivery | Prerendered HTML hydrated in the browser |
| Server APIs | Node.js serverless handlers |
| AI | OpenAI Responses API with server-side grounding and streamed SSE responses |
| External data | NIH RePORTER API for grant-search resolution |
| Caching | Workbox image caching plus HTTP caching for selected server responses |
| Hosting | Vercel configuration for static routes, serverless functions, rewrites, and asset headers |

## Repository Structure

```text
api/                 Serverless endpoints for AI chat, analytics, and NIH data
public/              Images, downloadable documents, and other static assets
scripts/             Production prerender pipeline
server/ai/           Grounding, prompting, model selection, streaming, and rate limits
server/knowledge/    Server-side grounding source for the AI assistant
server/metrics/      Privacy controls and anonymous event delivery
src/components/      Shared interface components
src/pages/           Route-level pages and CSS Modules
src/entry-server.jsx Server-rendering entry point
```

## Development and Deployment

The repository uses a small command surface:

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` creates the client bundle, builds the server-rendering entry point, prerenders the public routes, injects critical styles, and removes the temporary SSR bundle.

The AI assistant requires the following server-side environment variables:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Authenticates server-side OpenAI requests |
| `OPENAI_MODEL` | Configures the primary allowed model |
| `OPENAI_FALLBACK_MODEL` | Configures the alternate allowed model |
| `GROUNDING_DOC_VERSION` | Versions the static prompt context for cache management |

Optional stream diagnostics can be enabled with `CHAT_STREAM_DEBUG` on the server and `VITE_CHAT_STREAM_DEBUG` in the client build.

### Analytics configuration

Cookieless page analytics and fixed-schema interaction events use the free Umami Cloud service. Analytics is production-only, is never awaited by user-facing interactions, and fails silently if the tracker or collection endpoint is unavailable. Custom chat metrics never include question text, response text, message length, IP addresses, user agents, or referrers. Reporting is viewed directly in the private Umami dashboard; the site does not expose an analytics report page or require Umami API access.

| Variable | Purpose |
| --- | --- |
| `VITE_UMAMI_WEBSITE_ID` | Loads the browser tracker for the configured Umami website |
| `UMAMI_WEBSITE_ID` | Identifies the website for anonymous server-side chat events |
| `EXCLUDED_IP_HASHES` | Comma-separated SHA-256 hashes excluded from server-side chat metrics |
| `ANALYTICS_PRODUCTION_HOSTS` | Optional production hostname allowlist |
| `UMAMI_COLLECT_URL` | Optional override for the Umami collection endpoint |

Visiting any site page with `?exclude-me=1` stores a browser-local analytics exclusion and immediately removes the query parameter from the address. Use `?exclude-me=0` to clear it. The exclusion also propagates to server-side chat metrics.

To add a public IP to `EXCLUDED_IP_HASHES` without storing the address itself:

```bash
printf '%s' 'YOUR_PUBLIC_IP' | shasum -a 256
```

## Author

Joshua Seideman, PhD

## License

All rights reserved. Site content, writing, visual assets, and source code may not be reused without permission.
