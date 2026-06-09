import { useEffect } from 'react';
import Navigation from '../components/Navigation.jsx';
import styles from './SelectedProjectsPage.module.css';

const INSTAGRAM_POST_URL =
  'https://www.instagram.com/p/DWb8ne5jr17/?utm_source=ig_embed&utm_campaign=loading';

const projects = [
  {
    description:
      'Designed and built a real-time research software platform for multimodal data acquisition and experimental control. Designed and conducted experiments investigating how the brain uses sensory evidence to inform perceptual decisions under time pressure.',
    imageLabel: 'Image 1',
    technologies: [
      'MATLAB',
      'Eye Tracking',
      'Electrophysiology',
      'Statistical Analysis',
      'Modeling',
    ],
    title: 'Neural Basis of Decision Making',
  },
  {
    description:
      'Built an end-to-end system that generates AI-powered content, posts to Instagram, and engages with relevant accounts - no manual intervention. Grew to 2,000+ followers.',
    instagramEmbed: true,
    technologies: ['Python', 'Selenium', 'OpenAI API', 'Gemini API', 'GCP'],
    title: 'Automated Instagram Engagement System with AI-Powered Content Generation',
  },
  {
    description:
      'Built and deployed a fully automated system that searches for relevant content on Twitter and programmatically engages \u2014 running unattended on AWS. Won 700+ digital asset giveaways.',
    imageLabel: 'Image 3',
    technologies: ['Python', 'AWS EC2', 'Twitter API'],
    title: 'Automated Twitter Engagement System',
  },
];

function InstagramPostEmbed() {
  useEffect(() => {
    const processEmbed = () => {
      window.instgrm?.Embeds.process();
    };
    const existingScript = document.getElementById('instagram-embed-script');

    if (existingScript) {
      processEmbed();
      existingScript.addEventListener('load', processEmbed, { once: true });
      return () => existingScript.removeEventListener('load', processEmbed);
    }

    const script = document.createElement('script');
    script.async = true;
    script.id = 'instagram-embed-script';
    script.src = 'https://www.instagram.com/embed.js';
    script.addEventListener('load', processEmbed, { once: true });
    document.body.appendChild(script);

    return () => script.removeEventListener('load', processEmbed);
  }, []);

  return (
    <div className={styles.instagramEmbed}>
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={INSTAGRAM_POST_URL}
        data-instgrm-version="14"
      >
        <a href={INSTAGRAM_POST_URL} rel="noreferrer" target="_blank">
          View this post on Instagram
        </a>
      </blockquote>
    </div>
  );
}

function SelectedProjectsPage() {
  return (
    <main className={styles.page} id="selected-projects">
      <Navigation variant="projects" />

      <section className={styles.content} aria-labelledby="projects-title">
        <header className={styles.header}>
          <h1 className={styles.title} id="projects-title">
            Selected Projects
          </h1>
          <p className={styles.subtitle}>
            Independent work spanning AI systems, automation, and scientific
            research.
          </p>
        </header>

        <div className={styles.projectList}>
          {projects.map((project) => (
            <article
              className={styles.card}
              key={project.title}
            >
              {project.instagramEmbed ? (
                <InstagramPostEmbed />
              ) : (
                <div className={styles.imagePlaceholder} aria-hidden="true">
                  {project.imageLabel}
                </div>
              )}

              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{project.title}</h2>
                <p className={styles.description}>{project.description}</p>

                <ul
                  className={styles.technologies}
                  aria-label={`${project.title} technologies`}
                >
                  {project.technologies.map((technology) => (
                    <li className={styles.technology} key={technology}>
                      {technology}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default SelectedProjectsPage;
