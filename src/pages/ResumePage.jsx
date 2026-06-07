import { useEffect, useMemo, useRef, useState } from 'react';
import { Page } from 'react-pdf';
import DocumentContext from 'react-pdf/dist/DocumentContext.js';
import LinkService from 'react-pdf/dist/LinkService.js';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  getLoadedResumePdf,
  getMeasuredResumeViewerWidth,
  preloadResumePdf,
} from '../resumePdfAsset.js';
import styles from './ResumePage.module.css';

const MAX_PAGE_WIDTH = 1840;

function FirstResumePdfPage({ documentContext, pageWidth, pdf }) {
  const [isCanvasRendered, setIsCanvasRendered] = useState(false);
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);

  return (
    <article className={styles.pageShell}>
      {pdf && documentContext && pageWidth ? (
        <DocumentContext.Provider value={documentContext}>
          <Page
            canvasBackground="#ffffff"
            className={styles.pdfPage}
            devicePixelRatio={devicePixelRatio}
            loading={null}
            onRenderSuccess={() => setIsCanvasRendered(true)}
            pageNumber={1}
            pdf={pdf}
            renderAnnotationLayer={isCanvasRendered}
            renderTextLayer={isCanvasRendered}
            width={pageWidth}
          />
        </DocumentContext.Provider>
      ) : null}

      {!isCanvasRendered ? (
        <div
          className={styles.canvasPlaceholder}
          aria-label="Loading resume"
          role="status"
        />
      ) : null}
    </article>
  );
}

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
      className={styles.pageShell}
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
  const [availableWidth, setAvailableWidth] = useState(
    () => getMeasuredResumeViewerWidth() ?? 0,
  );
  const [pdfDocument, setPdfDocument] = useState(() => getLoadedResumePdf());
  const [status, setStatus] = useState(() =>
    getLoadedResumePdf() ? 'ready' : 'loading',
  );

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
      const nextWidth = Math.floor(node.getBoundingClientRect().width);

      if (nextWidth > 0) {
        setAvailableWidth((currentWidth) =>
          currentWidth === nextWidth ? currentWidth : nextWidth,
        );
      }
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
    availableWidth > 0 ? Math.min(availableWidth, MAX_PAGE_WIDTH) : null;
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

      {status !== 'error' ? (
        <FirstResumePdfPage
          documentContext={documentContext}
          pageWidth={pageWidth}
          pdf={pdfDocument}
        />
      ) : null}

      {pdfDocument && documentContext && pageWidth ? (
        <DocumentContext.Provider value={documentContext}>
          {Array.from(
            { length: Math.max(pdfDocument.numPages - 1, 0) },
            (_, index) => (
              <ResumePdfPage
                key={index + 2}
                pageNumber={index + 2}
                pageWidth={pageWidth}
                pdf={pdfDocument}
              />
            ),
          )}
        </DocumentContext.Provider>
      ) : null}
    </div>
  );
}

export default ResumePage;
