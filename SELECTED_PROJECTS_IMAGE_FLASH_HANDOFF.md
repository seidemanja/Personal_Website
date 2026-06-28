# Selected Projects image flash handoff

This file is a focused handoff for debugging a persistent refresh flash on the
Selected Projects page.

## Problem being debugged

Route:

- `/projects`

Observed behavior:

- On wide desktop browser width, the selected-project card images sometimes flash/blink during refresh.
- The issue is intermittent: several refreshes may look correct, then one refresh flashes.
- The issue has been most visible on:
  - Instagram card image: `/images/puppy_pic_cropped.png`
  - PhD research card image: `/images/CS_Task_Saccade.png`
  - After the latest attempted fix, the Twitter card image also started flashing sometimes.
- The handoff below intentionally includes only the current version of the relevant code.

## Relevant current files

Primary files:

- `src/pages/SelectedProjectsPage.jsx`
- `src/pages/SelectedProjectsPage.module.css`
- `index.html`
- `src/main.jsx`

Related global CSS:

- `src/styles/global.css`
- `src/components/Navigation.jsx`

## Current selected-project data/rendering code

From `src/pages/SelectedProjectsPage.jsx`:

```jsx
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import styles from './SelectedProjectsPage.module.css';

const projects = [
  {
    imageClassName: 'sp-image-instagram',
    description:
      'Built an end-to-end system that generates AI-powered content, publishes to Instagram, and engages with relevant accounts without manual intervention. Grew account to 2,000+ followers.',
    desktopDescription:
      'Built an end-to-end system that generates AI-powered content, publishes to Instagram, and engages with relevant accounts without manual intervention. Grew the account to 2,000+ followers.',
    imageSrc: '/images/puppy_pic_cropped.png',
    narrowImageSrc: '/images/puppy_pic_cropped_narrow.png',
    technologies: ['Python', 'OpenAI', 'Gemini', 'Selenium', 'GCP'],
    title: 'Instagram Content Creation and Engagement Automation',
    to: '/projects/instagram-automation',
  },
  {
    imageClassName: 'sp-image-neuroscience',
    description:
      'Conducted a multi-year research program investigating perceptual decision making. Designed experiments, developed real-time research software, analyzed behavioral and neural data. Published findings in leading journals.',
    desktopDescription:
      'Conducted a multi-year research program investigating perceptual decision making. Designed experiments, developed real-time research software, analyzed behavioral and neural data, and published findings in leading scientific journals.',
    imageSrc: '/images/CS_Task_Saccade.png',
    narrowImageSrc: '/images/CS_Task_Saccade_narrow.png',
    technologies: [
      'Experimental Design',
      'MATLAB',
      'Data Analysis',
      'Computational Modeling',
    ],
    title: 'PhD Research in Neuroscience',
    to: '/projects/neuroscience-research',
  },
  {
    description:
      'Built an end-to-end system that automates giveaway discovery and engagement workflows on Twitter. Won 700+ digital assets through automated participation.',
    imageClassName: 'sp-image-twitter',
    imageFrameClassName: styles.imageInsetDark,
    imageSrc: '/images/NFT_Giveaway_Post_Dark.PNG',
    narrowImageSrc: '/images/NFT_Giveaway_Post_Dark_narrow.PNG',
    technologies: ['Python', 'Twitter API', 'AWS'],
    title: 'Automated Twitter Giveaway Entry',
    to: '/projects/twitter-automation',
  },
];

function SelectedProjectsPage() {
  return (
    <main className={`${styles.page} sp-page`} id="selected-projects">
      <Navigation variant="projects" />

      <section className={`${styles.content} sp-content`} aria-labelledby="projects-title">
        <header className={`${styles.header} sp-header`}>
          <h1 className={`${styles.title} sp-title`} id="projects-title">
            Selected Projects
          </h1>
          <p className={`${styles.subtitle} sp-subtitle`}>
            Selected projects spanning software development, automation,
            applied AI, and neuroscience research.
          </p>
        </header>

        <div className={`${styles.projectList} sp-list`}>
          {projects.map((project) => {
            const cardContent = (
                <>
                <div
                  className={`${styles.imagePlaceholder} sp-image-slot ${
                    project.imageFrameClassName ?? ''
                  } ${project.imageFrameClassName ? 'sp-image-dark' : ''} ${
                    project.imageClassName ?? ''
                  }`}
                  style={{
                    '--sp-desktop-image': `url(${project.imageSrc})`,
                    '--sp-narrow-image': `url(${project.narrowImageSrc ?? project.imageSrc})`,
                  }}
                  aria-hidden="true"
                >
                  {project.imageSrc ? (
                    <span className={`${styles.cardPicture} sp-card-picture`}>
                      <img
                        className={`${styles.cardImage} ${styles.desktopCardImage} sp-img sp-img-desktop`}
                        src={project.imageSrc}
                        alt=""
                        width="162"
                        height="162"
                        loading="eager"
                        decoding="sync"
                        fetchpriority="high"
                      />
                      {project.narrowImageSrc ? (
                        <img
                          className={`${styles.cardImage} ${styles.narrowCardImage} sp-img sp-img-narrow`}
                          src={project.narrowImageSrc}
                          alt=""
                          width="824"
                          height="294"
                          loading="eager"
                          decoding="sync"
                          fetchpriority="high"
                        />
                      ) : null}
                    </span>
                  ) : (
                    project.imageLabel
                  )}
                </div>

                <div className={`${styles.cardContent} sp-card-content`}>
                  <h2 className={`${styles.cardTitle} sp-card-title`}>{project.title}</h2>
                  <p className={`${styles.description} sp-description`}>
                    {project.desktopDescription ? (
                      <>
                        <span className={`${styles.desktopCopy} sp-desktop-copy`}>
                          {project.desktopDescription}
                        </span>
                        <span className={`${styles.mobileCopy} sp-mobile-copy`}>
                          {project.description}
                        </span>
                      </>
                    ) : (
                      project.description
                    )}
                  </p>

                  <ul
                    className={`${styles.technologies} sp-technologies`}
                    aria-label={`${project.title} technologies`}
                  >
                    {project.technologies.map((technology) => (
                      <li className={`${styles.technology} sp-technology`} key={technology}>
                        {technology}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className={styles.cardLinkIcon} aria-hidden="true">
                  <ChevronRight />
                </span>
              </>
            );

            return project.to ? (
              <Link className={`${styles.card} sp-card`} key={project.title} to={project.to}>
                {cardContent}
              </Link>
            ) : (
              <article className={`${styles.card} sp-card`} key={project.title}>
                {cardContent}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default SelectedProjectsPage;
```

## Current selected-project CSS relevant to images/layout

From `src/pages/SelectedProjectsPage.module.css`:

```css
.page {
  min-height: 100vh;
  overflow-x: clip;
  background: #fff;
}

.content {
  width: 779px;
  margin: 0 auto;
  padding: 42px 0 61px;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

.projectList {
  display: grid;
  grid-auto-rows: 1fr;
  gap: 1rem;
}

.card {
  min-height: 162px;
  height: 162px;
  position: relative;
  display: grid;
  grid-template-columns: 162px minmax(0, 1fr);
  overflow: hidden;
  color: inherit;
  border: 0;
  border-radius: 7.6px;
  background: #ffffff;
  box-shadow:
    3px 6px 14px rgba(0, 0, 0, 0.075),
    7px 12px 28px rgba(0, 0, 0, 0.045);
  text-decoration: none;
}

.card:hover {
  background: #f9f9f9;
  box-shadow:
    4px 8px 18px rgba(0, 0, 0, 0.1),
    9px 16px 34px rgba(0, 0, 0, 0.06);
  outline: none;
  transform: translateY(-1px);
}

.imagePlaceholder {
  box-sizing: border-box;
  aspect-ratio: 1 / 1;
  width: 162px;
  height: 162px;
  display: grid;
  place-items: center;
  color: #858580;
  border-right: 0.5px solid rgba(0, 0, 0, 0.1);
  background: #f2f2f2;
  font-size: 0.8rem;
  contain: layout paint;
}

.imageInsetDark {
  padding: 10px;
  background: #000;
}

.imageInset .cardImage,
.imageInsetDark .cardImage {
  border-radius: 3px;
}

.cardImage {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.cardPicture {
  width: 100%;
  height: 100%;
  display: block;
  overflow: hidden;
}

/* Latest attempted fix. This may be causing duplicate image-paint behavior. */
@media (min-width: 861px) {
  .cardPicture {
    background-image: var(--sp-desktop-image);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
}

.desktopCardImage {
  display: block;
}

.narrowCardImage {
  display: none;
}

.cardContent {
  min-width: 0;
  padding: 17px 23px 19px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.technologies {
  margin: auto 0 0;
  padding: 11px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  list-style: none;
}

@media (max-width: 860px) {
  .projectList {
    grid-auto-rows: auto;
  }

  .content {
    width: min(779px, calc(100% - 64px));
  }

  .card {
    min-height: 0;
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 21px;
  }

  .imagePlaceholder {
    width: calc(100% - 36px);
    max-width: 680px;
    height: auto;
    margin: 18px auto 0;
    aspect-ratio: 824 / 294;
    border-right: 0;
    border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
    background: #fff;
    background-image: var(--sp-narrow-image);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    overflow: hidden;
  }

  .desktopCardImage {
    display: none;
  }

  .narrowCardImage {
    display: block;
  }

  .imageInsetDark {
    aspect-ratio: 824 / 294;
    padding: 0;
    background: #000;
    background-image: none;
  }

  .imageInsetDark .cardPicture {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
  }

  .imageInsetDark .cardImage {
    width: 62%;
    height: 58%;
    object-fit: contain;
  }

  .cardContent {
    min-height: 0;
    padding: 0 23px 38px;
    overflow: hidden;
  }

  .technologies {
    margin: 0;
    padding-top: 20px;
  }
}
```

## Current inline critical CSS in `index.html` relevant to selected projects

The document has inline critical CSS before the bundled app loads. Relevant
pieces:

```css
.sp-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.sp-page {
  min-height: 100vh;
  overflow-x: clip;
  background: #fff;
}

.sp-content {
  width: 779px;
  margin: 0 auto;
  padding: 42px 0 61px;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

.sp-list {
  display: grid;
  grid-auto-rows: 1fr;
  gap: 1rem;
}

.sp-card {
  min-height: 162px;
  height: 162px;
  position: relative;
  display: grid;
  grid-template-columns: 162px minmax(0, 1fr);
  overflow: hidden;
  color: inherit;
  border: 0;
  border-radius: 7.6px;
  background: #fff;
  text-decoration: none;
  box-shadow:
    3px 6px 14px rgba(0, 0, 0, 0.075),
    7px 12px 28px rgba(0, 0, 0, 0.045);
}

.sp-image-slot {
  box-sizing: border-box;
  aspect-ratio: 1 / 1;
  width: 162px;
  height: 162px;
  display: grid;
  place-items: center;
  color: #858580;
  border-right: 0.5px solid rgba(0, 0, 0, 0.1);
  background: #f2f2f2;
  font-size: 0.8rem;
  contain: layout paint;
}

.sp-card-picture {
  width: 100%;
  height: 100%;
  display: block;
  overflow: hidden;
}

/* Latest attempted fix also duplicated inline. */
@media (min-width: 861px) {
  .sp-card-picture {
    background-image: var(--sp-desktop-image);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
}

.sp-image-dark {
  padding: 10px;
  background: #000;
}

.sp-img-narrow {
  display: none;
}

@media (max-width: 860px) {
  .sp-card {
    min-height: 0;
    height: auto;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 21px;
    overflow: hidden;
    color: inherit;
    border: 0;
    border-radius: 7.6px;
    background: #fff;
    text-decoration: none;
    box-shadow:
      3px 6px 14px rgba(0, 0, 0, 0.075),
      7px 12px 28px rgba(0, 0, 0, 0.045);
  }

  .sp-image-slot {
    box-sizing: border-box;
    width: calc(100% - 36px);
    max-width: 680px;
    height: auto;
    margin: 18px auto 0;
    aspect-ratio: 824 / 294;
    border-right: 0;
    border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
    background: #fff;
    background-image: var(--sp-narrow-image);
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    overflow: hidden;
    contain: layout paint;
  }

  .sp-img-desktop {
    display: none !important;
  }

  .sp-img-narrow {
    display: block !important;
  }

  .sp-image-dark {
    background: #000;
    background-image: none;
  }
}
```

## Current preloads in `index.html`

```html
<link
  rel="preload"
  href="/images/puppy_pic_cropped.png"
  as="image"
  media="(min-width: 861px)"
  fetchpriority="high"
/>
<link
  rel="preload"
  href="/images/puppy_pic_cropped_narrow.png"
  as="image"
  media="(max-width: 860px)"
  fetchpriority="high"
/>
<link
  rel="preload"
  href="/images/CS_Task_Saccade.png"
  as="image"
  media="(min-width: 861px)"
  fetchpriority="high"
/>
<link
  rel="preload"
  href="/images/CS_Task_Saccade_narrow.png"
  as="image"
  media="(max-width: 860px)"
  fetchpriority="high"
/>
<link
  rel="preload"
  href="/images/NFT_Giveaway_Post_Dark.PNG"
  as="image"
  media="(min-width: 861px)"
  fetchpriority="high"
/>
<link
  rel="preload"
  href="/images/NFT_Giveaway_Post_Dark_narrow.PNG"
  as="image"
  media="(max-width: 860px)"
  fetchpriority="high"
/>
```

## Current refresh snapshot code

This was added to stabilize refresh shifts on project detail pages. `/projects`
was added later to try to stabilize selected-project refresh behavior.

From `index.html`:

```html
<script>
  (() => {
    const projectDetailPaths = new Set([
      '/projects',
      '/projects/instagram-automation',
      '/projects/twitter-automation',
    ]);
    const path = window.location.pathname.replace(/\/+$/, '') || '/';

    if (!projectDetailPaths.has(path)) {
      return;
    }

    try {
      const snapshot = JSON.parse(
        sessionStorage.getItem(`project-detail-snapshot:${path}`) || 'null',
      );
      const root = document.getElementById('root');

      if (
        root
        && snapshot?.version === 'project-detail-refresh-v4'
        && typeof snapshot.html === 'string'
      ) {
        root.innerHTML = snapshot.html;
        root.dataset.restoredProjectSnapshot = 'true';
      }
    } catch {
      sessionStorage.removeItem(`project-detail-snapshot:${path}`);
    }
  })();
</script>
```

From `src/main.jsx`:

```jsx
const rootElement = document.getElementById('root');
const projectDetailSnapshotPaths = new Set([
  '/projects',
  '/projects/instagram-automation',
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
        version: 'project-detail-refresh-v4',
      }),
    );
  } catch {
    // If session storage is unavailable or full, fall back to normal rendering.
  }
}

window.addEventListener('pagehide', saveProjectDetailSnapshot);
```

## Plausible causes to investigate

These are not conclusions; they are the current hypotheses.

1. Duplicate image painting:
   - The latest attempted fix paints the same image twice:
     - as a CSS `background-image` on `.cardPicture`;
     - as an `<img>` child.
   - If one layer paints/decodes a frame before the other, a flash or apparent
     flicker can occur, especially if the browser swaps between background and
     image decode paths.

2. Snapshot restore contains already-loaded DOM but not decoded image state:
   - `root.innerHTML` restores `<img>` tags and inline styles, but decoded
     image bitmap state is not serialized.
   - React hydration/render may replace or reconcile the restored image nodes.
   - The snapshot could make the DOM appear immediately, then the browser still
     repaints images.

3. Critical CSS vs CSS-module timing:
   - The inline critical CSS currently duplicates a large amount of desktop
     selected-project layout.
   - Any mismatch between inline CSS and CSS module could cause a one-frame
     visual change.

4. Over-eager preload/fetchpriority:
   - All six selected-project images are `preload` + `fetchpriority=high`.
   - There are also eager/high-priority `<img>` tags for both desktop and narrow
     versions in every card, although one version is hidden by CSS.
   - On wide desktop, hidden narrow images may still be requested/decoded by the
     browser because the `<img>` exists and has `loading="eager"`.

5. Different file formats/sizes:
   - Instagram: PNG
   - PhD research: PNG
   - Twitter: PNG with `.PNG` extension and dark background
   - The Twitter visual originally appeared more stable because the image slot
     had a black background via `.imageInsetDark`, so a late image frame was less
     noticeable. After adding a duplicate background image fallback, it may now
     also flicker.

## Diagnostic checks Claude should consider

1. Reproduce with DevTools performance recording:
   - Watch paint events on refresh.
   - Confirm whether the flash happens before JS runs, during snapshot restore,
     during React render, or when CSS bundle applies.

2. Temporarily remove `/projects` from the snapshot route set:
   - If the flash disappears, the snapshot restore is part of the problem.

3. Temporarily remove desktop `.cardPicture` / `.sp-card-picture`
   `background-image` fallback:
   - If the Twitter card stops flashing again, duplicate painting is the problem.

4. Test one image source only:
   - Render only the visible desktop `<img>` on desktop and only the narrow
     `<img>` on narrow/mobile. Avoid rendering both at once.
   - Preferred React structure might use `<picture>` or CSS `image-set`, but do
     not distort ratios or break existing narrow layout.

5. Check whether hidden narrow `<img>` tags are causing decode churn:
   - Current DOM includes both desktop and narrow `<img>` for every card.
   - CSS hides one, but the browser may still load/decode it.

## Useful commands

```bash
cd "/Users/jseidema/Desktop/Personal Website/Code"
npm run build
git diff -- index.html src/main.jsx src/pages/SelectedProjectsPage.jsx src/pages/SelectedProjectsPage.module.css
```

## Current build status

The current code builds successfully:

```text
npm run build
✓ built successfully
```
