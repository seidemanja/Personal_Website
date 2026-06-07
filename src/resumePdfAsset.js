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
