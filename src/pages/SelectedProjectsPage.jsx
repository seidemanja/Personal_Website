import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import styles from './SelectedProjectsPage.module.css';

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
    title: 'Decision Making in the Brain',
    to: '/projects/neuroscience-research',
  },
  {
    description:
      'Built an end-to-end system that generates AI-powered content, posts to Instagram, and engages with relevant accounts - no manual intervention. Grew to 2,000+ followers.',
    imageLabel: 'Image 2',
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
          {projects.map((project) => {
            const cardContent = (
              <>
                <div className={styles.imagePlaceholder} aria-hidden="true">
                  {project.imageLabel}
                </div>

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
                <span className={styles.cardLinkIcon} aria-hidden="true">
                  <ChevronRight />
                </span>
              </>
            );

            return project.to ? (
              <Link className={styles.card} key={project.title} to={project.to}>
                {cardContent}
              </Link>
            ) : (
              <article className={styles.card} key={project.title}>
                {cardContent}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default SelectedProjectsPage;
