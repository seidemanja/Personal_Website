import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import {
  getNIHGrantUrl,
  NIH_GRANT_FALLBACK_URL,
  refreshNIHGrantUrl,
  subscribeToNIHGrantUrl,
} from '../nihGrant.js';
import styles from './NeuroscienceProjectPage.module.css';

const scopeOfWork = [
  {
    title: 'Experimental Design',
    description:
      'Designed and conducted cognitive and computational neuroscience experiments. Wrote a federally funded research grant proposal defining scope, methods, timeline, and budget.',
  },
  {
    title: 'Software Development',
    description:
      'Designed and developed real-time research software enabling multimodal data acquisition, interactive visual interfaces, and automated experimental workflows.',
  },
  {
    title: 'Data Collection, Analysis, & Modeling',
    description:
      'Collected, analyzed, and modeled behavioral and neural data. Applied statistical methods and computational models to evaluate hypotheses and interpret experimental results.',
  },
  {
    title: 'Scientific Communication',
    description:
      'Presented findings at national and international conferences and published results in peer-reviewed journals.',
  },
];

const publications = [
  {
    title:
      'Saccade Metrics Reflect Decision-Making Dynamics During Urgent Choices',
    journal: 'Nature Communications, 2018',
    description:
      'Showed that saccade metrics, including peak velocity, are tightly linked to decision-making dynamics during urgent perceptual choices. Saccade kinematics provide a readout of decision confidence consistent with race-to-threshold models.',
    href: '/pdfs/Saccade_metrics_paper.pdf',
  },
  {
    title:
      'A Conflict Between Spatial Selection and Evidence Accumulation in Area LIP',
    journal: 'Nature Communications, 2022',
    description:
      'Found that spatial selection signals in area LIP can be dissociated from evidence accumulation, revealing a conflict between where attention is directed and how evidence is accumulated during decision-making.',
    href: '/pdfs/LIP_paper_s41467-022-32209-z.pdf',
  },
];

function NeuroscienceProjectPage() {
  const [grantUrl, setGrantUrl] = useState(NIH_GRANT_FALLBACK_URL);

  useEffect(() => {
    setGrantUrl(getNIHGrantUrl());
    const unsubscribe = subscribeToNIHGrantUrl(setGrantUrl);
    void refreshNIHGrantUrl().then(setGrantUrl);

    return unsubscribe;
  }, []);

  return (
    <main className={styles.page}>
      <Navigation variant="projects" />

      <div className={styles.content}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/projects">Selected Projects</Link>
          <span aria-hidden="true">›</span>
          <span>Decision Making in the Brain</span>
        </nav>

        <section className={styles.hero} aria-labelledby="project-title">
          <div className={styles.heroCopy}>
            <h1 id="project-title">Decision Making in the Brain</h1>
            <div className={styles.metaRow}>
              <p className={styles.years}>2015–2020</p>
              <span className={styles.metaDivider} aria-hidden="true">•</span>
              <p className={styles.affiliation}>
                <span>Wake Forest University School of Medicine</span>
                <span className={styles.metaDivider} aria-hidden="true">•</span>
                <a
                  href="https://www.urgentchoicelab.org/home"
                  rel="noreferrer"
                  target="_blank"
                >
                  Salinas-Stanford Lab
                </a>
              </p>
            </div>
            <p className={styles.intro}>
              Investigated the neural and behavioral mechanisms underlying
              perceptual decision-making through a series of behavioral and
              neurophysiological experiments. The work examined how sensory
              information influences rapid decisions and how those processes
              are reflected in both behavior and neural activity.
            </p>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.scopeSection}`}
          aria-labelledby="scope-title"
        >
          <header className={styles.sectionHeader}>
            <h2 id="scope-title">Scope of Work</h2>
          </header>

          <div className={styles.scopeList}>
            {scopeOfWork.map(({ description, title }) => (
              <article className={styles.scopeItem} key={title}>
                <div className={styles.scopeCopy}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="publications-title">
          <header className={styles.sectionHeader}>
            <h2 id="publications-title">Selected Publications</h2>
          </header>

          <div className={styles.publicationList}>
            {publications.map((publication) => (
              <a
                className={styles.publicationCard}
                href={publication.href}
                key={publication.title}
                rel="noreferrer"
                target="_blank"
              >
                <div>
                  <h3>{publication.title}</h3>
                  <p className={styles.journal}>{publication.journal}</p>
                  <p>{publication.description}</p>
                </div>
                <span className={styles.cardLinkIcon} aria-hidden="true">
                  <ExternalLink />
                </span>
              </a>
            ))}
          </div>

          <a
            className={styles.scholarLink}
            href="https://scholar.google.com/citations?user=_dN3kXQAAAAJ&hl=en&oi=ao"
            rel="noreferrer"
            target="_blank"
          >
            <img
              alt=""
              aria-hidden="true"
              src="/images/Google_Scholar_logo.svg"
            />
            <span>View all publications on Google Scholar</span>
          </a>
        </section>

        <section
          className={`${styles.section} ${styles.fundingSection}`}
          aria-labelledby="funding-title"
        >
          <header className={styles.sectionHeader}>
            <h2 id="funding-title">Research Funding</h2>
          </header>

          <a
            className={styles.fundingCard}
            href={grantUrl}
            rel="noreferrer"
            target="_blank"
          >
            <div>
              <h3>NIH Predoctoral Grant Award (F31)</h3>
              <p>
                Competitive federal research funding awarded to support this
                research program.
              </p>
            </div>
            <span className={styles.cardLinkIcon} aria-hidden="true">
              <ExternalLink />
            </span>
          </a>

          <p className={styles.researchInfo}>
            For additional information about the research topics, experimental
            paradigms, and broader research program, visit the{' '}
            <a
              href="https://www.urgentchoicelab.org/home"
              rel="noreferrer"
              target="_blank"
            >
              Salinas-Stanford Lab
            </a>{' '}
            website.
          </p>
        </section>
      </div>
    </main>
  );
}

export default NeuroscienceProjectPage;
