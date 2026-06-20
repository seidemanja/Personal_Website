import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import styles from './SelectedProjectsPage.module.css';

const projects = [
  {
    description:
      'Conducted a multi-year research program investigating perceptual decision making. Designed experiments, developed real-time research software, analyzed behavioral and neural data, and published findings in leading scientific journals.',
    imageSrc: '/images/CS_Task_Saccade.png',
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
      'Built an end-to-end system that generates AI-powered content, publishes to Instagram, and engages with relevant accounts without manual intervention. Grew the account to 2,000+ followers.',
    imageSrc: '/images/puppy_pic_cropped.png',
    technologies: ['Python', 'Selenium', 'OpenAI API', 'Gemini API', 'GCP'],
    title: 'Instagram Content Creation and Engagement Automation',
    to: '/projects/instagram-automation',
  },
  {
    description:
      'Built an end-to-end system that automates giveaway discovery and engagement workflows on Twitter. Won 700+ digital assets through automated participation.',
    imageFrameClassName: styles.imageInsetDark,
    imageSrc: '/images/NFT_Giveaway_Post_Dark.PNG',
    technologies: ['Python', 'AWS EC2', 'Twitter API'],
    title: 'Automated Twitter Giveaway Entry',
    to: '/projects/twitter-automation',
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
                <div
                  className={`${styles.imagePlaceholder} ${
                    project.imageFrameClassName ?? ''
                  }`}
                  aria-hidden="true"
                >
                  {project.imageSrc ? (
                    <img
                      className={styles.cardImage}
                      src={project.imageSrc}
                      alt=""
                    />
                  ) : (
                    project.imageLabel
                  )}
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
