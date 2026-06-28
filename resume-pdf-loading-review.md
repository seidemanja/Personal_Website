# Resume PDF Loading Review

This file collects the code directly relevant to how the resume page currently loads and renders the PDF.

## 1. Route and lazy loading

Source: `src/App.jsx`

```jsx
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ResumeLayout from './pages/ResumeLayout.jsx';
import SelectedProjectsPage from './pages/SelectedProjectsPage.jsx';
import { loadResumePage } from './routes.js';

const ResumePage = lazy(loadResumePage);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/resume"
        element={
          <ResumeLayout>
            <Suspense fallback={null}>
              <ResumePage />
            </Suspense>
          </ResumeLayout>
        }
      />
      <Route path="/projects" element={<SelectedProjectsPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;
```

## 2. Resume layout shell

Source: `src/pages/ResumeLayout.jsx`

```jsx
import { Download } from 'lucide-react';
import Navigation from '../components/Navigation.jsx';
import { RESUME_PDF_URL } from '../resumeConstants.js';
import styles from './ResumePage.module.css';

function ResumeLayout({ children = null }) {
  return (
    <main className={styles.page} id="resume">
      <Navigation variant="resume" />

      <section className={styles.content} aria-labelledby="resume-title">
        <a
          className={styles.downloadButton}
          href={RESUME_PDF_URL}
          download
          aria-label="Download resume PDF"
          title="Download PDF"
        >
          <Download aria-hidden="true" strokeWidth={3} />
          <span className={styles.srOnly}>Download PDF</span>
        </a>

        <h1 className={styles.srOnly} id="resume-title">
          Resume
        </h1>

        {children}
      </section>
    </main>
  );
}

export default ResumeLayout;
```

## 3. PDF file constant

Source: `src/resumeConstants.js`

```js
export const RESUME_PDF_URL =
  '/pdfs/Joshua_Seideman_Resume_05232026.pdf';
```

## 4. PDF.js document preload helper

Source: `src/resumePdfAsset.js`

```js
import { pdfjs } from 'react-pdf';
import { RESUME_PDF_URL } from './resumeConstants.js';

let resumeDocumentPromise;

export function preloadResumePdf() {
  if (!resumeDocumentPromise) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
    const loadingTask = pdfjs.getDocument(RESUME_PDF_URL);

    resumeDocumentPromise = loadingTask.promise.catch((error) => {
      resumeDocumentPromise = undefined;
      throw error;
    });
  }

  return resumeDocumentPromise;
}
```

## 5. Resume PDF rendering component

Source: `src/pages/ResumePage.jsx`

```jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Page } from 'react-pdf';
import DocumentContext from 'react-pdf/dist/DocumentContext.js';
import LinkService from 'react-pdf/dist/LinkService.js';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { preloadResumePdf } from '../resumePdfAsset.js';
import styles from './ResumePage.module.css';

const MAX_PAGE_WIDTH = 1840;

function ResumePdfPage({ pageNumber, pageWidth, pdf }) {
  const shellRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(pageNumber === 1);
  const [isCanvasRendered, setIsCanvasRendered] = useState(false);

  useEffect(() => {
    const node = shellRef.current;

    if (!node || shouldRender) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1200px 0px' },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [shouldRender]);

  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);

  return (
    <article
      className={`${styles.pageShell} ${
        isCanvasRendered ? styles.pageShellReady : ''
      }`}
      ref={shellRef}
      style={{ width: `${pageWidth}px` }}
    >
      {shouldRender ? (
        <>
          <Page
            canvasBackground="#ffffff"
            className={styles.pdfPage}
            devicePixelRatio={devicePixelRatio}
            loading={null}
            onRenderSuccess={() => setIsCanvasRendered(true)}
            pageNumber={pageNumber}
            pdf={pdf}
            renderAnnotationLayer={isCanvasRendered}
            renderTextLayer={isCanvasRendered}
            width={pageWidth}
          />
          {!isCanvasRendered ? (
            <div className={styles.canvasPlaceholder} aria-hidden="true" />
          ) : null}
        </>
      ) : (
        <div className={styles.placeholderPage} aria-hidden="true" />
      )}
    </article>
  );
}

function ResumePage() {
  const viewerRef = useRef(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;

    preloadResumePdf()
      .then((pdf) => {
        if (active) {
          setPdfDocument(pdf);
          setStatus('ready');
        }
      })
      .catch((error) => {
        console.error('Failed to preload resume PDF', error);
        if (active) {
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const node = viewerRef.current;

    if (!node) {
      return undefined;
    }

    const updateWidth = () => {
      setAvailableWidth(Math.floor(node.getBoundingClientRect().width));
    };

    updateWidth();

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const pageWidth =
    availableWidth > 0 ? Math.min(availableWidth, MAX_PAGE_WIDTH) : MAX_PAGE_WIDTH;
  const documentContext = useMemo(() => {
    if (!pdfDocument) {
      return null;
    }

    const linkService = new LinkService();
    linkService.setDocument(pdfDocument);
    linkService.setExternalLinkRel('noreferrer noopener');
    linkService.setExternalLinkTarget('_blank');

    return {
      imageResourcesPath: '',
      linkService,
      pdf: pdfDocument,
      registerPage: () => {},
      renderMode: 'canvas',
      unregisterPage: () => {},
    };
  }, [pdfDocument]);

  return (
    <div className={styles.viewer} ref={viewerRef}>
      {status === 'error' ? (
        <p className={styles.status}>
          The resume could not be rendered here. Use the download button.
        </p>
      ) : null}

      {pdfDocument && documentContext ? (
        <DocumentContext.Provider value={documentContext}>
          {Array.from({ length: pdfDocument.numPages }, (_, index) => (
            <ResumePdfPage
              key={index + 1}
              pageNumber={index + 1}
              pageWidth={pageWidth}
              pdf={pdfDocument}
            />
          ))}
        </DocumentContext.Provider>
      ) : null}
    </div>
  );
}

export default ResumePage;
```

## 6. Resume page styles relevant to loading/rendering

Source: `src/pages/ResumePage.module.css`

```css
.page {
  min-height: 100vh;
  background: #fff;
  padding-top: 0;
}

.content {
  width: min(calc(100vw - 36px), 1700px);
  margin: 0 auto;
  padding: 34px 0 88px;
}

.downloadButton {
  width: 88px;
  height: 88px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  right: 24px;
  bottom: 28px;
  z-index: 30;
  color: #171717;
  border: 1px solid rgba(0, 0, 0, 0.22);
  border-radius: 999px;
  background: rgba(218, 218, 214, 0.97);
  backdrop-filter: blur(12px);
  line-height: 1;
  text-decoration: none;
  box-shadow:
    0 14px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.07);
  transition:
    border-color 140ms ease,
    background-color 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;
}

.downloadButton:hover,
.downloadButton:focus-visible {
  border-color: rgba(0, 0, 0, 0.32);
  background: rgba(207, 207, 203, 0.99);
  outline: none;
  transform: translateY(-1px);
  box-shadow:
    0 18px 34px rgba(0, 0, 0, 0.14),
    0 2px 8px rgba(0, 0, 0, 0.08);
}

.downloadButton svg {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pageShell {
  margin: 0 0 18px;
  aspect-ratio: 0.773 / 1;
  position: relative;
  overflow: hidden;
  background: transparent;
}

.pageShellReady {
  background: #fff;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.05);
}

.placeholderPage {
  width: 100%;
  aspect-ratio: 0.773 / 1;
  background: #fff;
}

.canvasPlaceholder {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: #fff;
  pointer-events: none;
}

.pageShell:last-child {
  margin-bottom: 0;
}

.pdfPage {
  background: #fff;
}

.pdfPage :global(canvas) {
  display: block;
}

.pdfPage :global(.react-pdf__Page__textContent) {
  inset: 0;
  overflow: hidden;
}

.pdfPage :global(.react-pdf__Page__annotations) {
  inset: 0;
}

.pdfPage
  :global(
    .annotationLayer
      :is(.linkAnnotation, .buttonWidgetAnnotation.pushButton)
      > a:hover
  ) {
  opacity: 1 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.status {
  margin: 100px 0;
  color: #50504b;
  font-size: 1rem;
  line-height: 1.4;
  text-align: center;
}

@media (max-width: 980px) {
  .content {
    width: min(calc(100vw - 28px), 1700px);
    padding-bottom: 72px;
  }
}

@media (max-width: 720px) {
  .page {
    padding-top: 0;
  }

  .content {
    width: min(calc(100vw - 32px), 1320px);
    padding-top: 24px;
    padding-bottom: 56px;
  }

  .downloadButton {
    width: 66px;
    height: 66px;
    right: 16px;
    bottom: 20px;
  }

  .pageShell {
    margin-bottom: 14px;
  }
}

@media (max-width: 420px) {
  .content {
    width: min(calc(100vw - 18px), 1320px);
  }
}
```
