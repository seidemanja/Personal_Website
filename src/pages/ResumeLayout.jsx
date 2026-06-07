import { Download } from 'lucide-react';
import Navigation from '../components/Navigation.jsx';
import { RESUME_PDF_URL } from '../resumeConstants.js';
import styles from './ResumePage.module.css';

export function ResumePageSkeleton() {
  return (
    <div className={styles.viewer}>
      <article className={styles.pageShell}>
        <div
          className={styles.canvasPlaceholder}
          aria-label="Loading resume"
          role="status"
        />
      </article>
    </div>
  );
}

function ResumeLayout({ children = null, isVisible = true }) {
  return (
    <main
      aria-hidden={!isVisible}
      className={`${styles.page} ${isVisible ? '' : styles.hidden}`}
      id="resume"
    >
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
