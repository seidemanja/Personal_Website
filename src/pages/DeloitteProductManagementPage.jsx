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

const stages = [
  'Framing the Problem',
  'Testing the Solution',
  'Scoping the Build',
  'Launching and Measuring',
];

const launchEntries = [
  {
    title: 'Framing the Problem',
    description:
      'Met with customers to understand their day-to-day work, especially what was time-consuming or repetitive, and to learn about recurring problems they found intractable. These discussions established whether a problem was costing meaningful time and money or was simply an annoyance already worked around at little cost.',
  },
  {
    title: 'Testing the Solution',
    description:
      'Once my team and I had a candidate solution, often after an analysis of alternatives, wireframes and prototypes went in front of customers before engineering committed. Sessions focused on whether customers could complete the task without being told how, where their instincts diverged from the design, and which requirements were still undefined.',
  },
  {
    title: 'Scoping the Build',
    description:
      'Scoped first releases to deliver value quickly, and to add value incrementally through a series of subsequent releases. Scope was set by risk, testing the assumption most likely to undermine the product first, against success metrics defined before the build began.',
  },
  {
    title: 'Launching and Measuring',
    description:
      'Releases were staged: internal, then a pilot group, then broader rollout. Each stage was measured against the metric set before launch, and the result decided whether to iterate, expand to more users, or stop.',
  },
];

const leadershipEntries = [
  {
    title: 'Communicating the Product Vision',
    description:
      "Owned the product vision, making sure customers and the delivery team could each state what a product was for and what would change when it worked. Worked alongside the product owner to keep the customer's voice in front of the team throughout development.",
  },
  {
    title: 'Owning the Roadmap',
    description:
      'Owned the product roadmap and drove requirements across a portfolio of data analytics and AI products, prioritizing features and release timelines against user needs, dependencies, and team capacity. Each decision stayed traceable to the problem the feature was meant to solve.',
  },
  {
    title: 'Working Through Product Owners and Project Managers',
    description:
      'Managed product owners and project managers across concurrent initiatives, setting direction and priorities while they owned backlog detail, schedule, and dependencies. On key initiatives, served as product manager, product owner, and project manager, defining scope and requirements and running delivery with engineering, data science, and design.',
  },
  {
    title: 'Risk and Transparency',
    description:
      'Fostered an environment where team members raised risks early and throughout projects. Ensured each risk had an impact, owner, mitigation, and trigger. Kept customers informed of timelines, assumptions, and risks to align expectations.',
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
                className={styles.externalTextLink}
                href="https://www.deloitte.com/us/en.html"
                rel="noreferrer"
                target="_blank"
              >
                Deloitte Consulting
              </a>
            </p>
            <p className={`${styles.intro} pd-intro`}>
              Owned the roadmap and requirements for a portfolio of 30+ data
              analytics products, including AI-powered products with LLM
              integration and semantic search. Managed product owners and
              project managers across concurrent initiatives, and led
              cross-functional teams of engineers, data scientists, and
              designers from problem definition through launch. Certified
              Project Management Professional (PMP).
            </p>
          </div>
        </section>

        <section
          className={`${styles.metrics} pd-metrics pd-metrics-three`}
          aria-label="Project highlights"
        >
          {metrics.map(({ description, title }) => (
            <article className={`${styles.metricCard} pd-metric-card`} key={title}>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="launch-title">
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="launch-title">Zero-to-Launch Product Management</h2>
          </header>

          <p className={styles.sectionIntro}>
            Requests often arrive already framed as solutions. I took a step
            back to understand and validate the problems behind them, then
            tested potential solutions with customers using prototypes, scoped
            first releases that delivered value quickly, and launched in stages
            against metrics established in advance.
          </p>

          <aside className={styles.callout}>
            <p className={styles.calloutEyebrow}>Scientific Approach</p>
            <p>
              My doctorate trained me to define a question precisely, to
              establish in advance what evidence would help answer it, and to
              design a study capable of producing that evidence. I approach
              products the same way: problem definition and success metrics come
              before development begins, so that once a product ships we can
              measure early, from data, how well it is solving the problem it
              was built for.
            </p>
          </aside>

          <div className={styles.stages} aria-label="Product development flow">
            {stages.map((stage, index) => (
              <div className={styles.stageGroup} key={stage}>
                <div className={styles.stage}>{stage}</div>
                {index < stages.length - 1 ? (
                  <span className={styles.stageArrow} aria-hidden="true">
                    <span className={styles.horizontalArrow}>→</span>
                    <span className={styles.verticalArrow}>↓</span>
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className={styles.entryList}>
            {launchEntries.map(({ description, title }) => (
              <article className={styles.entry} key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>

          <aside className={`${styles.callout} ${styles.endCallout}`}>
            <p className={styles.calloutEyebrow}>AI-Assisted Development</p>
            <p>
              I use AI-assisted coding (ChatGPT, OpenAI Codex) alongside
              hands-on development to prototype solutions, resolve technical
              blockers, and accelerate timelines.
            </p>
          </aside>
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="leadership-title">
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="leadership-title">Leadership and Delivery</h2>
          </header>

          <div className={styles.entryList}>
            {leadershipEntries.map(({ description, title }) => (
              <article className={styles.entry} key={title}>
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
            className={styles.workCard}
            href={selectedWorkUrl}
            rel="noreferrer"
            target="_blank"
          >
            <div>
              <h3>Supervised Machine Learning for Scientific Coding Assistance</h3>
              <p className={styles.workMeta}>
                NIH Artificial Intelligence Symposium, 2025
              </p>
              <p>
                Delivered an ML-based classification tool for scientific grants
                to support funding decisions, significantly reducing manual
                categorization time.
              </p>
            </div>
            <span className={styles.cardLinkIcon} aria-hidden="true">
              <ExternalLink />
            </span>
          </a>
        </section>

        <p className={styles.closing}>
          Client work is described at a high level, and specific engagement
          details are intentionally omitted.
        </p>
      </div>
    </main>
  );
}

export default DeloitteProductManagementPage;
