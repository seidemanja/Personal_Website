import { pdfjs } from 'react-pdf';
import { RESUME_PDF_URL } from './resumeConstants.js';

let resumeDocumentPromise;
let resolvedResumeDocument = null;
let measuredResumeViewerWidth = null;
let hasRegisteredResizeListener = false;
let resizeDebounceId;

const MAX_PAGE_WIDTH = 1840;

function calculateResumeViewerWidth() {
  const viewportWidth = window.innerWidth;
  let horizontalGap = 36;
  let maxContentWidth = 1700;

  if (viewportWidth <= 980) {
    horizontalGap = 28;
  }

  if (viewportWidth <= 720) {
    horizontalGap = 32;
    maxContentWidth = 1320;
  }

  if (viewportWidth <= 420) {
    horizontalGap = 18;
  }

  return Math.max(
    0,
    Math.floor(
      Math.min(
        viewportWidth - horizontalGap,
        maxContentWidth,
        MAX_PAGE_WIDTH,
      ),
    ),
  );
}

export function getLoadedResumePdf() {
  return resolvedResumeDocument;
}

export function getMeasuredResumeViewerWidth() {
  return measuredResumeViewerWidth;
}

export function measureResumeViewerWidth() {
  if (typeof window === 'undefined') {
    return null;
  }

  measuredResumeViewerWidth = calculateResumeViewerWidth();

  if (!hasRegisteredResizeListener) {
    hasRegisteredResizeListener = true;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeDebounceId);
      resizeDebounceId = window.setTimeout(() => {
        measuredResumeViewerWidth = calculateResumeViewerWidth();
      }, 100);
    });
  }

  return measuredResumeViewerWidth;
}

export function preloadResumePdf() {
  if (!resumeDocumentPromise) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
    const loadingTask = pdfjs.getDocument(RESUME_PDF_URL);

    resumeDocumentPromise = loadingTask.promise
      .then((pdfDocument) => {
        resolvedResumeDocument = pdfDocument;
        return pdfDocument;
      })
      .catch((error) => {
        resumeDocumentPromise = undefined;
        resolvedResumeDocument = null;
        throw error;
      });
  }

  return resumeDocumentPromise;
}
