import { Download } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import Navigation from '../components/Navigation.jsx';
import { RESUME_PDF_URL } from '../resumeConstants.js';
import styles from './ResumePage.module.css';

const RESUME_NATURAL_WIDTH = 836;
const RESUME_NATURAL_HEIGHT = 4368;
const RESUME_SIDE_MARGIN = 80;
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

function getResumeScale() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return 1;
  }

  const viewportWidth = Math.min(
    window.visualViewport?.width || Number.POSITIVE_INFINITY,
    document.documentElement.clientWidth || Number.POSITIVE_INFINITY,
    window.innerWidth || Number.POSITIVE_INFINITY,
  );

  if (!Number.isFinite(viewportWidth)) {
    return 1;
  }

  return Math.min(1, Math.max(0.1, (viewportWidth - RESUME_SIDE_MARGIN) / RESUME_NATURAL_WIDTH));
}

function ResumeLayout({ children = null, isVisible = true }) {
  const [resumeScale, setResumeScale] = useState(getResumeScale);

  useIsomorphicLayoutEffect(() => {
    const updateResumeScale = () => {
      setResumeScale(getResumeScale());
    };

    updateResumeScale();
    const animationFrameId = window.requestAnimationFrame(updateResumeScale);

    window.addEventListener('resize', updateResumeScale);
    window.visualViewport?.addEventListener('resize', updateResumeScale);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateResumeScale);
      window.visualViewport?.removeEventListener('resize', updateResumeScale);
    };
  }, []);

  return (
    <main
      aria-hidden={!isVisible}
      className={`${styles.page} ${isVisible ? '' : styles.hidden}`}
      id="resume"
      style={isVisible ? undefined : { display: 'none' }}
    >
      <Navigation variant="resume" />

      <section
        className={styles.content}
        style={{
          '--resume-scale': resumeScale,
          '--resume-scaled-width': `${RESUME_NATURAL_WIDTH * resumeScale}px`,
          '--resume-scaled-height': `${RESUME_NATURAL_HEIGHT * resumeScale}px`,
        }}
        aria-labelledby="resume-title"
      >
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

        <div className={styles.desktopResumeContent}>
          {children}
        </div>
      </section>
    </main>
  );
}

export default ResumeLayout;
