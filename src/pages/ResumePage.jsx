import { useEffect, useState } from 'react';
import {
  getNIHGrantSearchUrl,
  NIH_GRANT_SEARCH_FALLBACK_URL,
  refreshNIHGrantSearchUrl,
  subscribeToNIHGrantSearchUrl,
} from '../nihGrantSearch.js';
import styles from './ResumePage.module.css';

function NIHGrantLink({ children }) {
  const [grantUrl, setGrantUrl] = useState(NIH_GRANT_SEARCH_FALLBACK_URL);

  useEffect(() => {
    setGrantUrl(getNIHGrantSearchUrl());
    const unsubscribe = subscribeToNIHGrantSearchUrl(setGrantUrl);
    void refreshNIHGrantSearchUrl().then(setGrantUrl);

    return unsubscribe;
  }, []);

  return (
    <a href={grantUrl} rel="noreferrer" target="_blank">
      {children}
    </a>
  );
}

const workExperience = [
  {
    organization: 'Deloitte Consulting',
    role: 'Manager, Product Management',
    dates: '09/2021 – Present',
    bullets: [
      'Owned product roadmap and drove product requirements for a portfolio of 30+ data analytics products, prioritizing features and release timelines based on user needs and capacity',
      'Oversaw delivery across concurrent workstreams, managing project managers and product owners to align priorities, timelines, and dependencies',
      <>
        Drove execution for key initiatives by leading cross-functional teams
        (engineering, data science, design), defining scope and timelines, and
        ensuring on-time delivery
      </>,
      'Leveraged AI-assisted coding (OpenAI Codex; ChatGPT) to prototype solutions, resolve technical blockers, and accelerate development timelines',
      <>
        Led delivery of an AI-enabled analytics product that used semantic
        search and LLM-based classification to evaluate scientific documents
        against user-defined statements (Azure, PostgreSQL, React)
      </>,
      <>
        Delivered an{' '}
        <a
          href="https://irp.nih.gov/system/files/media/file/2025-05/nih_artificial_intelligence_symposium_2025-05-16_program_booklet_v1.pdf#page=61"
          rel="noreferrer"
          target="_blank"
        >
          ML-based classification tool
        </a>{' '}
        that recommends scientific codes for grant applications, achieving over
        85% accuracy, recall, and precision and reducing manual curation effort
      </>,
      <>
        Led development of a data anomaly detection product, defining
        requirements and guiding system design to monitor data quality and
        surface KPIs through dashboard (Tableau, Power BI)
      </>,
    ],
  },
  {
    organization: 'Lexical Intelligence',
    role: 'Scientific Portfolio Analyst',
    dates: '08/2020 – 09/2021',
    bullets: [
      'Conducted user research to define requirements and scope for web-based analytics products',
      'Served as project manager for select initiatives, coordinating analysts and ensuring timely delivery',
      <>
        Contributed to a publicly published{' '}
        <a
          href="https://dpcpsi.nih.gov/sites/g/files/mnhszr346/files/OD-OPA-FY2021-2025-SP-Public-508_11_1_2021.pdf#page=15"
          rel="noreferrer"
          target="_blank"
        >
          strategic plan
        </a>{' '}
        for the National Institutes of Health (NIH) Office of Portfolio
        Analysis, authoring a section on measuring data and resource sharing
      </>,
      'Wrote custom Python code to clean, analyze, visualize, and statistically summarize large datasets',
      'Delivered analytical products (slide decks, datasets) to support portfolio analysis and decision-making',
    ],
  },
  {
    organization: 'Wake Forest Graduate School',
    role: 'Graduate Research Assistant (PhD)',
    dates: '08/2014 – 07/2020',
    bullets: [
      'Designed and conducted cognitive and computational neuroscience experiments',
      [
        'Wrote ',
        <NIHGrantLink key="nih-grant-link">
          federally-funded research grant proposal
        </NIHGrantLink>,
        ' – defined scope, methods, KPIs, timeline, and budget',
      ],
      'Designed and developed real-time research software enabling multimodal data acquisition, interactive visual interfaces, and automated experimental workflows (MATLAB)',
      'Gathered, analyzed, and modeled behavioral and neural data (MATLAB)',
      'Applied advanced statistical methods – bootstrap, permutation test, linear regression, AUROC',
      [
        'Wrote ',
        <a
          key="scholar-link"
          href="https://scholar.google.com/citations?user=_dN3kXQAAAAJ&hl=en&oi=ao"
          rel="noreferrer"
          target="_blank"
        >
          five first-author publications
        </a>,
        ', including two in ',
        <cite key="journal">Nature Communications</cite>,
        ' (',
        <a
          key="pdf-1"
          href="https://www.nature.com/articles/s41467-018-05319-w.pdf"
          rel="noreferrer"
          target="_blank"
        >
          pdf-1
        </a>,
        ', ',
        <a
          key="pdf-2"
          href="https://www.nature.com/articles/s41467-022-32209-z.pdf"
          rel="noreferrer"
          target="_blank"
        >
          pdf-2
        </a>,
        ')',
      ],
    ],
  },
];

const independentProjects = [
  {
    id: 'Personal Website & AI-Chat Assistant',
    organization: (
      <>
        Personal Website & AI-Chat Assistant –{' '}
        <a href="https://www.seidemanphd.com/" rel="noreferrer" target="_blank">
          seidemanphd.com
        </a>
      </>
    ),
    dates: '05/2026 – Present',
    bullets: [
      'Defined product requirements and designed the site for a personal portfolio with an integrated AI chat assistant; used Claude and ChatGPT to evaluate architectural options and iterate on design',
      'Directed AI-assisted development (Codex) to implement, debug, and iterate on a React/Vite system',
      'Built a grounded AI chat assistant (OpenAI API, streamed responses, server-side knowledge base), authoring the prompt and guardrail logic to keep responses grounded and on-topic',
    ],
  },
  {
    organization:
      'Instagram Bot – Web Automation System with AI-Enabled Content Generation',
    dates: '11/2024 – 05/2026',
    bullets: [
      <>
        Designed and built an end-to-end web automation system (Python,
        Selenium) to orchestrate daily content generation, posting, and
        engagement workflows without manual intervention
      </>,
      'Integrated OpenAI and Gemini APIs for multimodal content generation and for image-based classification to identify relevant accounts and enable targeted engagement',
      'Leveraged AI-assisted development (ChatGPT) to rapidly prototype and implement system components',
      <>
        Deployed and operated the system on Google Cloud Platform (GCP) with
        scheduled execution, enabling continuous, unattended operation
      </>,
      'Grew account to 2,000+ followers with fully automated content generation and engagement workflows',
    ],
  },
];

const skills = [
  {
    label: 'Product & Delivery',
    value:
      'Product roadmap ownership, requirements and KPI definition, backlog prioritization, stakeholder management, project delivery and execution (Agile), people management, cross-functional coordination (engineering, design, data science)',
  },
  {
    label: 'Programming & Data',
    value:
      'Python, SQL, MATLAB; data processing, exploratory data analysis, data modeling, experimental design, hypothesis testing, statistical analysis, data visualization',
  },
  {
    label: 'AI / ML',
    value:
      'LLMs (OpenAI, Anthropic, Gemini), prompt engineering, classification (using classical ML and LLM-based models), model evaluation (precision, recall, accuracy), computer vision (API-based)',
  },
  {
    label: 'Cloud & Systems',
    value:
      'Google Cloud Platform (GCP), Amazon Web Services (AWS), Microsoft Azure, PostgreSQL; LLM API integration (OpenAI, Gemini), system design (high-level), cloud deployment',
  },
  {
    label: 'BI Tools',
    value:
      'Tableau, Power BI (product ownership and delivery), dashboard requirements, KPI design',
  },
];

const articles = [
  {
    text: 'Seideman JA, Stanford TR, & Salinas E. (2022). A conflict between spatial selection and evidence accumulation in area LIP.',
    journal: 'Nature communications, 13:4463.',
    href: 'https://www.nature.com/articles/s41467-022-32209-z.pdf',
  },
  {
    text: 'Seideman JA, Stanford TR, & Salinas E. (2021). The spatial signal in area LIP is not an obligatory correlate of perceptual evidence during informed saccadic choices.',
    journal: 'bioRxiv, 2021-02.',
    href: 'https://www.biorxiv.org/content/10.1101/2021.02.16.431470v2',
  },
  {
    text: 'Seideman JA. (2020). The roles of frontal and parietal neurons in informing perceptual choices made under urgent temporal uncertainty (',
    linkedText: 'Doctoral dissertation',
    suffix: ', Wake Forest University). ProQuest, 28088659.',
    href: 'https://search.proquest.com/openview/4de6ae4c9483ee12f8b21e1ba6fbf8ac/1?pq-origsite=gscholar&cbl=18750&diss=y',
  },
  {
    text: 'Stonebarger GA, Urbanski HF, Woltjer RL, Vaughan KL, Ingram DK, Schultz PL, Calderazzo SM,',
    continuation:
      'Seideman JA, Mattison JA, Rosene DL, Kohama SG. (2020). Amyloidosis increase is not attenuated by long-term calorie restriction or related to neuron density in the prefrontal cortex of extremely aged rhesus macaques.',
    journal: 'GeroScience, 42, 1733-1749.',
    href: 'https://link.springer.com/article/10.1007/s11357-020-00259-0',
  },
  {
    text: 'Seideman JA, Salinas E, Stanford TR. (2019). Perceptual modulation of parietal activity during urgent saccadic choices.',
    journal: 'bioRxiv, 2019-12.',
    href: 'https://www.biorxiv.org/content/biorxiv/early/2019/12/13/2019.12.12.874313.full.pdf',
  },
  {
    text: 'Seideman JA. (2019). A dynamic, imperturbable link between midbrain activity and saccade velocity.',
    journal: 'Journal of Neurophysiology, 123(2), 451-453.',
    href: 'https://journals.physiology.org/doi/pdf/10.1152/jn.00328.2019?casa_token=RFDq0XcGl_EAAAAA:BFK-tuilx4xtElkx14tZ3GN5lZA-fCb-FdEIJ4cLYin_eEY2eoHH-0sh8oh3D5LZ7cUc5JVFVulQXh8',
  },
  {
    text: 'Salinas E, Seideman JA, Stanford TR. (2018). When the simplest voluntary decisions appear patently suboptimal.',
    journal: 'Behavioral and Brain Sciences, 41:e240.',
    href: 'https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/when-the-simplest-voluntary-decisions-appear-patently-suboptimal/2B651734C80651BF9A82590079AB4071',
  },
  {
    text: 'Seideman JA, Stanford TR, Salinas E. (2018). Saccade metrics reflect decision-making dynamics during urgent choices.',
    journal: 'Nature communications, 9:2907.',
    href: 'https://www.nature.com/articles/s41467-018-05319-w.pdf',
  },
];

const presentations = [
  'Seideman J, Do W, Tembo M, Opsahl-Ong L, Meyer A, Saraiya D, Footer K, Desai A, Lee L, Nguyen L, Croghan J, Rosenthal A, Tartakovsky M. Supervised Machine Learning for Scientific Coding Assistance. NIH Artificial Intelligence Symposium Abstracts 2025, Online.',
  'Mollerus P, Seideman J, Saraiya D, Meyer A, Footer K, Chang R, Nguyen L, Croghan J, Rosenthal A, Klinkenberg L, Meyers J. Scientific Review NLP Conflict of Interest Identification. NIH Artificial Intelligence Symposium Abstracts 2025, Online.',
  'Salinas E, Seideman J, Stanford T. Spatial differentiation in area LIP dissociated from evidence accumulation. COSYNE Abstracts 2021, Online.',
  'Seideman J, Salinas E, Stanford T. Rapid perceptual modulation of PPC activity predicts concomitant changes in urgent-decision accuracy. COSYNE Abstracts 2019, Lisbon, PT.',
  'Oor EE, Seideman JA, Stanford TR, Salinas E. Target-feature and outcome histories prime perceptual speed and efficiency in an urgent visual search task. Prog. No. 061.22. Society for Neuroscience, 2018.',
  'Seideman J, Stanford T, Salinas E. Saccade kinematics communicate covert decision-related computations during urgent choices. COSYNE Abstracts 2018, Denver, CO, USA.',
  'Seideman J, Salinas E, Stanford TR. Sensory cue processing time modulates LIP neuronal activity in parallel with urgent choice accuracy. Prog. No. 060.25. Society for Neuroscience, 2017.',
  'Seideman J, Scerra VE, Salinas E, Stanford TR. Saccade metrics reflect decision-making dynamics during urgent choices. Prog. No. 717.05. San Diego, CA: Society for Neuroscience, 2016.',
  'Putrino D, Wong YT, Weiss A, Seideman J, Pesaran B. Using virtual reality environments to train high- dimensional control of a virtual upper limb prosthetic. Prog. No. 80.16. Society for Neuroscience, 2013.',
  'Wylie A, Seideman J, Yu D, Blackwell C, Mishkin M, Turchi J. Dopaminergic and cholinergic mediation of within session concurrent discrimination learning. Prog. No. 580.04. Society for Neuroscience, 2013.',
];

const pageThreePresentations = presentations.slice(0, 7);
const splitPresentationStart =
  'Seideman J, Scerra VE, Salinas E, Stanford TR. Saccade metrics reflect decision-making dynamics during';
const splitPresentationRemainder =
  'urgent choices. Prog. No. 717.05. San Diego, CA: Society for Neuroscience, 2016.';
const pageFourPresentations = presentations.slice(8);

function BoldName({ children }) {
  const parts = children.split(/(Seideman,?\s+J(?:A)?)/g);

  return parts.map((part, index) =>
    /^Seideman,?\s+J(?:A)?$/.test(part) ? (
      <strong key={`${part}-${index}`}>{part}</strong>
    ) : (
      part
    ),
  );
}

function Entry({ bullets, dates, id, organization, role }) {
  return (
    <article className={styles.entry}>
      <div className={styles.entryHeading}>
        <h3>{organization}</h3>
        <p className={styles.date}>{dates}</p>
      </div>
      {role ? <p className={styles.role}>{role}</p> : null}
      <ul className={styles.bulletList}>
        {bullets.map((bullet, index) => (
          <li key={`${id || organization}-${index}`}>{bullet}</li>
        ))}
      </ul>
    </article>
  );
}

function Section({ aside = null, children, title }) {
  return (
    <section className={styles.resumeSection}>
      <div className={styles.sectionHeading}>
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ResumePage() {
  return (
    <div className={styles.viewer}>
      <article className={`${styles.pageShell} ${styles.resumeDocument}`}>
        <header className={styles.resumeHeader}>
          <h1>Joshua Seideman, Ph.D.</h1>
          <p className={styles.resumeSubtitle}>Product Manager</p>
          <p className={styles.contactLine}>
            <a href="mailto:josh.seideman@me.com">josh.seideman@me.com</a>
            {'\u00a0\u00a0|\u00a0\u00a0'}
            <a href="https://www.seidemanphd.com/" rel="noreferrer" target="_blank">
              seidemanphd.com
            </a>
            {'\u00a0\u00a0|\u00a0\u00a0'}
            <a
              href="https://www.linkedin.com/in/joshua-a-seideman/"
              rel="noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
          </p>
          <p className={styles.resumeSummary}>
            <span className={styles.summaryLine}>
              Product Manager with 5+ years of experience driving
              roadmaps, prioritization, and delivery across a
            </span>
            <span className={styles.summaryLine}>
              portfolio of data analytics products, including AI-powered
              solutions with LLM integration and semantic
            </span>
            <span className={styles.summaryLine}>
              search. Manages project managers and product owners across
              concurrent initiatives. Combines AI-assisted
            </span>
            <span className={styles.summaryLine}>
              development with hands-on coding to accelerate prototyping. PhD
              in neuroscience. PMP-certified.
            </span>
          </p>
        </header>

        <Section title="Work Experience">
          {workExperience.map((entry) => (
            <Entry key={entry.id || entry.organization} {...entry} />
          ))}
        </Section>
      </article>

      <article className={`${styles.pageShell} ${styles.resumeDocument}`}>
        <Section title="Independent Projects">
          {independentProjects.map((entry) => (
            <Entry key={entry.id || entry.organization} {...entry} />
          ))}
        </Section>

        <Section title="Skills">
          <dl className={styles.skillsList}>
            {skills.map((skill) => (
              <div key={skill.label}>
                <dt>{skill.label}:</dt>{' '}
                <dd>{skill.value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Certifications">
          <ul className={styles.compactList}>
            <li>Project Management Professional (PMP)</li>
            <li>Microsoft Power BI Data Analyst Associate (PL–300)</li>
            <li>Microsoft Azure AI Engineer Associate (AI–102)</li>
          </ul>
        </Section>

        <Section title="Education">
          <div className={styles.educationList}>
            <div className={styles.entryHeading}>
              <p>
                PhD, Neuroscience – Wake Forest University
              </p>
              <p className={styles.date}>08/2014 – 07/2020</p>
            </div>
            <div className={styles.entryHeading}>
              <p>
                BA, Psychology. BA, Biology – Boston University
              </p>
              <p className={styles.date}>09/2006 – 05/2010</p>
            </div>
          </div>
        </Section>
      </article>

      <article className={`${styles.pageShell} ${styles.resumeDocument}`}>
        <Section title="Published Articles">
          <div className={styles.citationList}>
            {articles.map((article) => (
              <p key={article.text}>
                <span className={article.continuation ? styles.citationLine : undefined}>
                  <BoldName>{article.text}</BoldName>
                </span>
                {article.continuation ? (
                  <>
                    <span className={styles.citationLine}>
                      <BoldName>{article.continuation}</BoldName>{' '}
                      <a href={article.href} rel="noreferrer" target="_blank">
                        <cite>{article.journal}</cite>
                      </a>
                    </span>
                  </>
                ) : null}
                {!article.continuation && article.linkedText ? (
                  <>
                    <a href={article.href} rel="noreferrer" target="_blank">
                      {article.linkedText}
                    </a>
                    {article.suffix}
                  </>
                ) : !article.continuation ? (
                  <>
                    {' '}
                    <a href={article.href} rel="noreferrer" target="_blank">
                      <cite>{article.journal}</cite>
                    </a>
                  </>
                ) : null}
              </p>
            ))}
          </div>
        </Section>

        <Section title="Published Abstracts / Presentations">
          <div className={styles.citationList}>
            {pageThreePresentations.map((presentation) => (
              <p key={presentation}>
                <BoldName>{presentation}</BoldName>
              </p>
            ))}
            <p>
              <BoldName>{splitPresentationStart}</BoldName>
            </p>
          </div>
        </Section>
      </article>

      <article className={`${styles.pageShell} ${styles.resumeDocument}`}>
        <div className={styles.citationList}>
          <p>{splitPresentationRemainder}</p>
          {pageFourPresentations.map((presentation) => (
            <p key={presentation}>
              <BoldName>{presentation}</BoldName>
            </p>
          ))}
        </div>

        <Section title="Awards and Honors">
          <div className={styles.awardsList}>
            <div className={styles.entryHeading}>
              <p>Outstanding Performance Award, Deloitte Consulting</p>
              <p className={styles.date}>2023, 2026</p>
            </div>
            <div className={styles.entryHeading}>
              <p>
                National Institute of Allergy and Infectious Diseases (NIAID)
                CIO Award
              </p>
              <p className={styles.date}>2023</p>
            </div>
            <div className={styles.entryHeading}>
              <p>
                NIH National Research Service Award – Predoctoral Fellowship
                (F31 Grant)
              </p>
              <p className={styles.date}>2018 – 2020</p>
            </div>
          </div>
        </Section>
      </article>
    </div>
  );
}

export default ResumePage;
