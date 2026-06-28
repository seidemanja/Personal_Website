import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import styles from './SelectedProjectsPage.module.css';

const projects = [
  {
    imageClassName: 'sp-image-instagram',
    description:
      'Built an end-to-end system that generates AI-powered content, publishes to Instagram, and engages with relevant accounts without manual intervention. Grew account to 2,000+ followers.',
    desktopDescription:
      'Built an end-to-end system that generates AI-powered content, publishes to Instagram, and engages with relevant accounts without manual intervention. Grew the account to 2,000+ followers.',
    imageSrc: '/images/puppy_pic_cropped.png',
    narrowImageSrc: '/images/puppy_pic_cropped_narrow.png',
    technologies: ['Python', 'OpenAI', 'Gemini', 'Selenium', 'GCP'],
    title: 'Instagram Content Creation and Engagement Automation',
    to: '/projects/instagram-automation',
  },
  {
    imageClassName: 'sp-image-neuroscience',
    description:
      'Conducted a multi-year research program investigating perceptual decision making. Designed experiments, developed real-time research software, analyzed behavioral and neural data. Published findings in leading journals.',
    desktopDescription:
      'Conducted a multi-year research program investigating perceptual decision making. Designed experiments, developed real-time research software, analyzed behavioral and neural data, and published findings in leading scientific journals.',
    imageSrc: '/images/CS_Task_Saccade.png',
    narrowImageSrc: '/images/CS_Task_Saccade_narrow.png',
    technologies: [
      'Experimental Design',
      'MATLAB',
      'Data Analysis',
      'Computational Modeling',
    ],
    title: 'PhD Research in Neuroscience',
    to: '/projects/neuroscience-research',
  },
  {
    description:
      'Built an end-to-end system that automates giveaway discovery and engagement workflows on Twitter. Won 700+ digital assets through automated participation.',
    imageClassName: 'sp-image-twitter',
    imageFrameClassName: styles.imageInsetDark,
    imageSrc: '/images/NFT_Giveaway_Post_Dark.PNG',
    narrowImageSrc: '/images/NFT_Giveaway_Post_Dark_narrow.PNG',
    technologies: ['Python', 'Twitter API', 'AWS'],
    title: 'Automated Twitter Giveaway Entry',
    to: '/projects/twitter-automation',
  },
];

function SelectedProjectsPage() {
  return (
    <main className={`${styles.page} sp-page`} id="selected-projects">
      <Navigation variant="projects" />

      <section className={`${styles.content} sp-content`} aria-labelledby="projects-title">
        <header className={`${styles.header} sp-header`}>
          <h1 className={`${styles.title} sp-title`} id="projects-title">
            Selected Projects
          </h1>
          <p className={`${styles.subtitle} sp-subtitle`}>
            Selected projects spanning software development, automation,
            applied AI, and neuroscience research.
          </p>
        </header>

        <div className={`${styles.projectList} sp-list`}>
          {projects.map((project) => {
            const cardContent = (
                <>
                <div
                  className={`${styles.imagePlaceholder} sp-image-slot ${
                    project.imageFrameClassName ?? ''
                  } ${project.imageFrameClassName ? 'sp-image-dark' : ''} ${
                    project.imageClassName ?? ''
                  }`}
                  style={{
                    '--sp-desktop-image': `url(${project.imageSrc})`,
                    '--sp-narrow-image': `url(${project.narrowImageSrc ?? project.imageSrc})`,
                  }}
                  aria-hidden="true"
                >
                  {project.imageSrc ? (
                    <span className={`${styles.cardPicture} sp-card-picture`}>
                      <img
                        className={`${styles.cardImage} ${styles.desktopCardImage} sp-img sp-img-desktop`}
                        src={project.imageSrc}
                        alt=""
                        width="162"
                        height="162"
                        loading="eager"
                        decoding="sync"
                        fetchpriority="high"
                      />
                      {project.narrowImageSrc ? (
                        <img
                          className={`${styles.cardImage} ${styles.narrowCardImage} sp-img sp-img-narrow`}
                          src={project.narrowImageSrc}
                          alt=""
                          width="824"
                          height="294"
                          loading="eager"
                          decoding="sync"
                          fetchpriority="high"
                        />
                      ) : null}
                    </span>
                  ) : (
                    project.imageLabel
                  )}
                </div>

                <div className={`${styles.cardContent} sp-card-content`}>
                  <h2 className={`${styles.cardTitle} sp-card-title`}>{project.title}</h2>
                  <p className={`${styles.description} sp-description`}>
                    {project.desktopDescription ? (
                      <>
                        <span className={`${styles.desktopCopy} sp-desktop-copy`}>
                          {project.desktopDescription}
                        </span>
                        <span className={`${styles.mobileCopy} sp-mobile-copy`}>
                          {project.description}
                        </span>
                      </>
                    ) : (
                      project.description
                    )}
                  </p>

                  <ul
                    className={`${styles.technologies} sp-technologies`}
                    aria-label={`${project.title} technologies`}
                  >
                    {project.technologies.map((technology) => (
                      <li className={`${styles.technology} sp-technology`} key={technology}>
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
              <Link className={`${styles.card} sp-card`} key={project.title} to={project.to}>
                {cardContent}
              </Link>
            ) : (
              <article className={`${styles.card} sp-card`} key={project.title}>
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
