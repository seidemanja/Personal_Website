import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import styles from './DeloitteProductManagementPage.module.css';

const metrics = [
  {
    title: '30+',
    description: 'Products owned',
  },
  {
    title: 'AI',
    description: 'Products delivered',
  },
  {
    title: 'PMP',
    description: 'Certified',
  },
];

const leadershipEntries = [
  {
    title: 'Owning the Vision and Roadmap',
    description:
      'I own the product vision and roadmap for a portfolio of analytics and AI products. Every roadmap item traces back to a validated problem.',
  },
  {
    title: 'Serving as PM, PO, and Project Manager',
    description:
      'On key initiatives, I served as product manager, product owner, and project manager, defining scope and requirements and running delivery with engineering, data science, and design.',
  },
];

const selectedWorkUrl =
  'https://irp.nih.gov/system/files/media/file/2025-05/nih_artificial_intelligence_symposium_2025-05-16_program_booklet_v1.pdf#page=61';

function DeloitteProductManagementPage() {
  return (
    <main className={`${styles.page} pd-page`}>
      <Navigation variant="projects" />

      <div className={`${styles.content} pd-content`}>
        <nav className={`${styles.breadcrumbs} pd-breadcrumbs`} aria-label="Breadcrumb">
          <Link to="/projects">Selected Projects</Link>
          <span aria-hidden="true">›</span>
          <span>Product Management for Data &amp; AI Products</span>
        </nav>

        <section className={styles.hero} aria-labelledby="project-title">
          <div className={`${styles.heroCopy} pd-hero-copy`}>
            <h1 className="pd-project-title" id="project-title">
              Product Management for Data &amp; AI Products
            </h1>
            <p className={`${styles.years} pd-years`}>
              09/2021 – Present <span aria-hidden="true">•</span>{' '}
              <a
                className={`${styles.externalTextLink} pd-external-text-link`}
                href="https://www.deloitte.com/us/en.html"
                rel="noreferrer"
                target="_blank"
              >
                Deloitte Consulting
              </a>
            </p>
            <p className={`${styles.intro} pd-intro`}>
              I own the roadmap for a portfolio of 30+ data analytics products,
              including AI-powered products with LLM integration and semantic
              search. I manage product owners and project managers across
              concurrent initiatives. Certified Project Management Professional
              <span className={styles.desktopCopy}> (PMP)</span>.
            </p>
          </div>
        </section>

        <section
          className={`${styles.metrics} pd-metrics pd-metrics-three pd-product-metrics-three`}
          aria-label="Project highlights"
        >
          {metrics.map(({ description, title }) => (
            <article className={`${styles.metricCard} pd-metric-card`} key={title}>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="problem-first-title">
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="problem-first-title">Problem-First Product Development</h2>
          </header>

          <p className={`${styles.sectionIntro} pd-section-intro`}>
            My doctorate trained me to define a question precisely, to establish
            in advance what evidence would help answer it, and to design a study
            capable of producing that evidence. I approach products the same
            way: problem definition and success metrics come before development
            begins, so that once a product ships we can measure early, from data,
            how well it is solving the problem it was built for.
          </p>
        </section>

        <section
          className={`${styles.section} pd-section`}
          aria-labelledby="ai-assisted-development-title"
        >
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="ai-assisted-development-title">
              AI-Assisted Prototyping and Development
            </h2>
          </header>

          <p className={`${styles.sectionIntro} pd-section-intro`}>
            I use AI-assisted coding (ChatGPT, OpenAI Codex) alongside hands-on
            development to prototype solutions, resolve technical blockers, and
            accelerate timelines.
          </p>
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="leadership-title">
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="leadership-title">Leadership and Delivery</h2>
          </header>

          <div className={`${styles.entryList} pd-entry-list`}>
            {leadershipEntries.map(({ description, title }) => (
              <article className={`${styles.entry} pd-entry`} key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="selected-work-title">
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="selected-work-title">Selected Work</h2>
          </header>

          <a
            className={`${styles.workCard} pd-work-card`}
            href={selectedWorkUrl}
            rel="noreferrer"
            target="_blank"
          >
            <div>
              <h3>Supervised Machine Learning for Scientific Coding Assistance</h3>
              <p className={`${styles.workMeta} pd-work-meta`}>
                NIH Artificial Intelligence Symposium, 2025
              </p>
              <p>
                Delivered an ML-based classification tool that recommends
                scientific codes for grant applications, achieving over 85%
                accuracy, recall, and precision on infectious disease codes and
                reducing manual curation effort for staff.
              </p>
            </div>
            <span className={`${styles.cardLinkIcon} pd-card-link-icon`} aria-hidden="true">
              <ExternalLink />
            </span>
          </a>
        </section>

        <p className={`${styles.closing} pd-closing`}>
          Client work is described at a high level, and specific engagement
          details are intentionally omitted.
        </p>
      </div>
    </main>
  );
}

export default DeloitteProductManagementPage;
