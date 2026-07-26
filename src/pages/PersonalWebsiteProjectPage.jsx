import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import styles from './PersonalWebsiteProjectPage.module.css';

const metrics = [
  {
    title: 'AI Coding',
    description: 'Built with Codex',
  },
  {
    title: 'Responsive',
    description: 'Desktop & mobile',
  },
  {
    title: 'AI Chat',
    description: 'Grounded assistant',
  },
  {
    title: 'Safeguards',
    description: 'Privacy controls',
  },
];

const scopeOfWork = [
  {
    title: 'Frontend Design & Development',
    description:
      'Designed the site structure, navigation, and responsive layout for desktop and mobile, then iteratively implemented it in React. Reviewed layouts across screen sizes to keep spacing, typography, and navigation consistent.',
  },
  {
    title: 'Grounded AI Assistant',
    description:
      'Authored the grounding document and prompt guardrails defining what the assistant can answer and in what tone. Implemented server-side LLM integration with streamed responses, model selection, and client-side PDF export of conversations.',
  },
  {
    title: 'Privacy & Abuse Controls',
    description:
      'Defined privacy constraints so the API key and grounding document stay server-side and conversations are not stored in a database. Built anonymous-session controls with a 30-message cap and minimum request gap.',
  },
];

const pipelineSteps = [
  {
    index: '01',
    title: 'Visitor asks a question',
    items: ['Typed into the chat', 'Example questions to start from'],
    caption: 'Starts the request',
  },
  {
    index: '02',
    title: 'Prompt guardrails',
    items: ['Stays within scope', 'Won’t reveal system prompts or source material'],
    caption: 'Set in system prompt',
  },
  {
    index: '03',
    title: 'Grounded context',
    items: ['Private Markdown knowledge base', 'Never sent to the browser'],
    caption: 'Source of truth',
  },
  {
    index: '04',
    title: 'Model call',
    items: ['OpenAI API', 'Server-side model allowlist'],
    caption: 'Generates the answer',
  },
  {
    index: '05',
    title: 'Answer streams back',
    items: ['Renders as generated', 'Can be stopped mid-answer'],
    caption: 'Delivered to the user',
  },
];

const technologies = [
  'React',
  'Vite',
  'JavaScript',
  'CSS Modules',
  'Node.js',
  'OpenAI API',
  'Server-Sent Events',
  'Service Workers',
];

const galleryItems = [
  {
    title: 'Homepage',
    description: 'the portfolio entry point',
    imageSrc: '/images/homepagenew.png',
    to: '/',
  },
  {
    title: 'AI Chat',
    description: 'the grounded assistant',
    imageSrc: '/images/askaboutjoshnew.png',
    to: '/ai-chat',
  },
];

function PersonalWebsiteProjectPage() {
  return (
    <main className={`${styles.page} pd-page`}>
      <Navigation variant="projects" />

      <div className={`${styles.content} pd-content`}>
        <nav className={`${styles.breadcrumbs} pd-breadcrumbs`} aria-label="Breadcrumb">
          <Link to="/projects">Selected Projects</Link>
          <span aria-hidden="true">›</span>
          <span>Personal Website &amp; Grounded AI Assistant</span>
        </nav>

        <section className={styles.hero} aria-labelledby="project-title">
          <div className={`${styles.heroCopy} pd-hero-copy`}>
            <h1 className="pd-project-title" id="project-title">
              Personal Website &amp; Grounded AI Assistant
            </h1>
            <p className={`${styles.years} pd-years`}>
              05/2026 – Present <span aria-hidden="true">•</span>{' '}
              <a
                href="https://github.com/seidemanja/Personal_Website"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </p>
            <p className={`${styles.intro} pd-intro`}>
              A responsive personal portfolio site paired with a grounded AI
              assistant that answers visitor questions about Josh’s background,
              projects, research, publications, and technical experience. Built
              by defining the requirements and the assistant’s grounding and
              prompt logic, using ChatGPT and Claude to weigh architectural
              options and iterate on design, and leveraging AI-assisted coding
              to implement the server-side LLM integration and frontend.
            </p>
          </div>
        </section>

        <section className={`${styles.metrics} pd-metrics`} aria-label="Project highlights">
          {metrics.map(({ description, title }) => (
            <article className={`${styles.metricCard} pd-metric-card`} key={title}>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="scope-title">
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="scope-title">Scope of Work</h2>
          </header>

          <div className={styles.scopeList}>
            {scopeOfWork.map(({ description, title }) => (
              <article className={styles.scopeItem} key={title}>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="assistant-title">
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="assistant-title">How the Assistant Works</h2>
            <p>What happens between a visitor’s question and a grounded answer.</p>
          </header>

          <div className={styles.pipeline} aria-label="Assistant request flow">
            {pipelineSteps.map((step, index) => (
              <div className={styles.pipelineGroup} key={step.title}>
                <article className={styles.pipelineStep}>
                  <p className={styles.pipelineIndex}>{step.index}</p>
                  <h3>{step.title}</h3>
                  <ul>
                    {step.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className={styles.pipelineCaption}>{step.caption}</p>
                </article>
                {index < pipelineSteps.length - 1 ? (
                  <span className={styles.pipelineArrow} aria-hidden="true">
                    <span className={styles.horizontalArrow}>→</span>
                    <span className={styles.verticalArrow}>↓</span>
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="technologies-title">
          <div className={`${styles.technologyRow} pd-technology-row`}>
            <p className={`${styles.technologyLabel} pd-technology-label`} id="technologies-title">
              Technologies
            </p>
            <ul className={`${styles.technologyList} pd-technology-list`}>
              {technologies.map((technology) => (
                <li className={`${styles.technologyPill} pd-technology-pill`} key={technology}>
                  {technology}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="screens-title">
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="screens-title">Homepage &amp; AI Chat</h2>
          </header>

          <div className={styles.galleryGrid}>
            {galleryItems.map((item) => (
              <Link className={styles.galleryCard} key={item.title} to={item.to}>
                <div className={styles.galleryImageFrame}>
                  <img src={item.imageSrc} alt="" loading="eager" decoding="sync" />
                </div>
                <p>
                  <strong>{item.title}</strong> — {item.description}
                </p>
                <span className={styles.galleryLinkIcon} aria-hidden="true">
                  <ExternalLink />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default PersonalWebsiteProjectPage;
