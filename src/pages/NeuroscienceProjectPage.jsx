import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import {
  getNIHGrantSearchUrl,
  NIH_GRANT_SEARCH_FALLBACK_URL,
  refreshNIHGrantSearchUrl,
  subscribeToNIHGrantSearchUrl,
} from '../nihGrantSearch.js';
import styles from './NeuroscienceProjectPage.module.css';

const scopeOfWork = [
  {
    title: 'Experimental Design',
    description: (
      <>
        Designed and conducted cognitive and computational neuroscience
        experiments. Wrote a federally{' '}
        <a href="#funding-title">funded research grant</a> proposal defining
        scope, methods, timeline, and budget.
      </>
    ),
  },
  {
    title: 'Software Development',
    description:
      'Designed and developed real-time research software enabling multimodal data acquisition, interactive visual interfaces, and automated experimental workflows.',
    mobileDescription:
      'Designed and developed real-time research software enabling data acquisition, interactive visual interfaces, and automated experimental workflows.',
  },
  {
    title: 'Data Collection, Analysis, & Modeling',
    description:
      'Collected, analyzed, and modeled behavioral and neural data. Applied statistical methods and computational models to evaluate hypotheses and interpret experimental results.',
  },
  {
    title: 'Scientific Communication',
    description:
      'Presented findings at international conferences and published results in peer-reviewed journals.',
    mobileDescription:
      'Presented findings at international conferences and published results in peer-reviewed journals.',
  },
];

const publications = [
  {
    title:
      'Saccade Metrics Reflect Decision-Making Dynamics During Urgent Choices',
    journal: 'Nature Communications, 2018',
    description:
      'Demonstrated that decision-related processes influence eye movement kinematics, including peak velocity. Using computational modeling, we identified a plausible neural mechanism by which this could occur.',
    href: '/pdfs/Saccade_metrics_paper.pdf',
  },
  {
    title:
      'A Conflict Between Spatial Selection and Evidence Accumulation in Area LIP',
    journal: 'Nature Communications, 2022',
    description:
      'Found that neuronal activity in the lateral intraparietal area does not reliably reflect accumulated sensory evidence during informed choices. The results suggest it instead tracks the deployment of spatial attention.',
    href: '/pdfs/LIP_paper_s41467-022-32209-z.pdf',
  },
];

function NeuroscienceProjectPage() {
  const [grantUrl, setGrantUrl] = useState(NIH_GRANT_SEARCH_FALLBACK_URL);

  useEffect(() => {
    setGrantUrl(getNIHGrantSearchUrl());
    const unsubscribe = subscribeToNIHGrantSearchUrl(setGrantUrl);
    void refreshNIHGrantSearchUrl().then(setGrantUrl);

    return unsubscribe;
  }, []);

  return (
    <main className={styles.page}>
      <Navigation variant="projects" />

      <div className={styles.content}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/projects">Selected Projects</Link>
          <span aria-hidden="true">›</span>
          <span>PhD Research in Neuroscience</span>
        </nav>

        <section className={styles.hero} aria-labelledby="project-title">
          <div className={styles.heroCopy}>
            <h1 id="project-title">PhD Research in Neuroscience</h1>
            <div className={styles.metaRow}>
              <p className={`${styles.years} ${styles.defaultMetaPiece}`}>
                2014–2020
              </p>
              <span
                className={`${styles.metaDivider} ${styles.defaultMetaPiece}`}
                aria-hidden="true"
              >
                •
              </span>
              <p className={`${styles.affiliation} ${styles.defaultMetaPiece}`}>
                <span>Wake Forest University School of Medicine</span>
                <span className={styles.metaDivider} aria-hidden="true">•</span>
                <a
                  className={styles.externalTextLink}
                  href="https://www.urgentchoicelab.org/home"
                  rel="noreferrer"
                  target="_blank"
                >
                  Salinas-Stanford Lab
                </a>
              </p>
              <div className={styles.portraitMeta}>
                <p>
                  2014–2020 <span className={styles.metaDivider}>•</span> Wake
                  Forest School of Medicine
                </p>
                <a
                  className={styles.externalTextLink}
                  href="https://www.urgentchoicelab.org/home"
                  rel="noreferrer"
                  target="_blank"
                >
                  Salinas-Stanford Lab
                </a>
              </div>
            </div>
            <p className={styles.intro}>
              Conducted a multi-year research program investigating the neural
              mechanisms underlying perceptual decision making. Designed
              experiments, developed real-time research software, analyzed
              behavioral and neural data, secured NIH funding, and{' '}
              <a href="#publications-title">
                <span className={styles.defaultInline}>published findings</span>
                <span className={styles.portraitInline}>published</span>
              </a>{' '}
              in leading scientific journals.
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
            {scopeOfWork.map(({ description, mobileDescription, title }) => (
              <article className={styles.scopeItem} key={title}>
                <div className={styles.scopeCopy}>
                  <h3>{title}</h3>
                  <p>
                    {mobileDescription ? (
                      <>
                        <span className={styles.desktopCopy}>
                          {description}
                        </span>
                        <span className={styles.mobileCopy}>
                          {mobileDescription}
                        </span>
                      </>
                    ) : (
                      description
                    )}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.publicationsSection}`}
          aria-labelledby="publications-title"
        >
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
            <h2 id="funding-title">Research Awards</h2>
          </header>

          <a
            className={styles.fundingCard}
            href={grantUrl}
            rel="noreferrer"
            target="_blank"
          >
            <div>
              <h3>NIH Predoctoral Research Grant (F31)</h3>
              <p className={styles.fundingRole}>
                Principal Investigator · 2018–2020
              </p>
              <p>
                Competitively awarded federal research grant supporting my
                doctoral research.
              </p>
            </div>
            <span className={styles.cardLinkIcon} aria-hidden="true">
              <ExternalLink />
            </span>
          </a>

          <p className={styles.researchInfo}>
            For more information about the research topics, experimental
            paradigms, and broader research program, visit the{' '}
            <a
              className={styles.externalTextLink}
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
