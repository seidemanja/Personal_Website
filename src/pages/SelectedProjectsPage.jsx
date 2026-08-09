import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import styles from './SelectedProjectsPage.module.css';

const personalWebsiteCardImage = '/images/homepage_SP_Card_v2.png';
const personalWebsiteNarrowCardImage = '/images/homepage_skinny_v2.png';

const projects = [
  {
    category: 'professional',
    description:
      'Owned roadmap and requirements for 30+ data analytics products, including AI-enabled products with LLM integration and semantic search.',
    imageClassName: 'sp-image-deloitte',
    imageSrc: '/images/pm_roadmap.png',
    narrowImageSrc: '/images/pm_roadmap_narrow.png',
    technologies: ['Product Management', 'AI/ML', 'Analytics', 'PMP'],
    title: 'Product Management for Data & AI Products',
    to: '/projects/product-management-data-ai',
  },
  {
    category: 'professional',
    imageClassName: 'sp-image-neuroscience',
    description:
      'Conducted a research program on rapid decision making. Designed experiments, built real-time software, analyzed data, and published findings in leading journals.',
    desktopDescription:
      'Conducted a research program on rapid decision making. Designed experiments, built real-time software, analyzed data, and published findings in leading journals.',
    imageSrc: '/images/Tach_Curve_mod.png',
    narrowImageSrc: '/images/3_tach_curves_mod.png',
    technologies: [
      'Experimental Design',
      'MATLAB',
      'Analysis',
      'Computational Modeling',
    ],
    title: 'PhD Research in Neuroscience',
    to: '/projects/neuroscience-research',
  },
  {
    category: 'independent',
    description:
      'Built a responsive personal portfolio with a grounded AI assistant, using AI-coding tools (Codex) to accelerate implementation.',
    imageClassName: 'sp-image-personal-website',
    imageFrameClassName: styles.imageContainFrame,
    imageSrc: personalWebsiteCardImage,
    narrowImageSrc: personalWebsiteNarrowCardImage,
    useResponsivePicture: true,
    technologies: ['React', 'Vite', 'OpenAI', 'Node.js'],
    title: 'Personal Website & Grounded AI Assistant',
    mobileTitle: 'Personal Website & Grounded AI Chat',
    to: '/projects/personal-website-ai-assistant',
  },
  {
    category: 'independent',
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
    category: 'independent',
    description:
      'Built an end-to-end system that automates giveaway discovery and engagement workflows on Twitter. Won 700+ digital assets through automated participation.',
    imageClassName: 'sp-image-twitter',
    imageFrameClassName: styles.imageInset,
    imageSrc: '/images/NFT_Giveaway_Post.PNG',
    narrowImageSrc: '/images/NFT_Giveaway_Post_narrow.PNG',
    technologies: ['Python', 'Twitter API', 'AWS'],
    title: 'Automated Twitter Giveaway Entry',
    to: '/projects/twitter-automation',
  },
];

const projectSections = [
  {
    description: 'Representative work from industry and academia',
    id: 'professional',
    title: 'Professional & Research',
  },
  {
    description: 'Self-directed work in software and applied AI',
    id: 'independent',
    title: 'Independent Projects',
  },
];

function SelectedProjectsPage() {
  return (
    <main className={`${styles.page} sp-page`} id="selected-projects">
      <Navigation variant="projects" />

      <section className={`${styles.content} sp-content`} aria-labelledby="projects-title">
        <header className={`${styles.header} sp-header`}>
          <h1 className={`${styles.title} sp-title`} id="projects-title">
            Selected Work
          </h1>
          <p className={`${styles.subtitle} sp-subtitle`}>
            Work spanning product management, software development, applied AI, and
            scientific research.
          </p>
        </header>

        <div className={`${styles.projectSections} sp-project-sections`}>
          {projectSections.map((section) => (
            <section
              className={`${styles.projectSection} sp-project-section`}
              key={section.id}
              aria-labelledby={`${section.id}-projects-title`}
            >
              <header className={`${styles.sectionHeader} sp-section-header`}>
                <h2
                  className={`${styles.sectionTitle} sp-section-title`}
                  id={`${section.id}-projects-title`}
                >
                  {section.title}
                </h2>
                <p className={`${styles.sectionDescription} sp-section-description`}>
                  {section.description}
                </p>
              </header>

              <div className={`${styles.projectList} sp-list`}>
                {projects.filter((project) => project.category === section.id).map((project) => {
            const isDarkImageFrame = project.imageFrameClassName === styles.imageInsetDark;
            const cardContent = (
                <>
                <div
                  className={`${styles.imagePlaceholder} sp-image-slot ${
                    project.imageFrameClassName ?? ''
                  } ${isDarkImageFrame ? 'sp-image-dark' : ''} ${
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
                      {project.useResponsivePicture ? (
                        <picture>
                          {project.narrowImageSrc ? (
                            <source
                              media="(max-width: 860px)"
                              srcSet={project.narrowImageSrc}
                              width="1912"
                              height="690"
                            />
                          ) : null}
                          <img
                            className={`${styles.cardImage} sp-img`}
                            src={project.imageSrc}
                            alt=""
                            width="1390"
                            height="1366"
                            loading="eager"
                            decoding="sync"
                            fetchpriority="high"
                          />
                        </picture>
                      ) : (
                        <>
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
                          width={
                            project.imageClassName === 'sp-image-twitter'
                              ? '533'
                              : project.imageClassName === 'sp-image-deloitte'
                                ? '1123'
                                : '824'
                          }
                          height={
                            project.imageClassName === 'sp-image-twitter'
                              ? '299'
                              : project.imageClassName === 'sp-image-deloitte'
                                ? '434'
                                : '294'
                          }
                          loading="eager"
                          decoding="sync"
                          fetchpriority="high"
                          style={
                            project.imageClassName === 'sp-image-twitter'
                              ? {
                                  width: '60%',
                                  maxWidth: '100%',
                                  height: 'auto',
                                  maxHeight: '100%',
                                  objectFit: 'contain',
                                  objectPosition: 'center center',
                                  transform: 'none',
                                  backgroundColor: '#fff',
                                }
                              : undefined
                          }
                        />
                          ) : null}
                        </>
                      )}
                    </span>
                  ) : (
                    project.imageLabel
                  )}
                </div>

                <div className={`${styles.cardContent} sp-card-content`}>
                  <h2 className={`${styles.cardTitle} sp-card-title`}>
                    {project.mobileTitle ? (
                      <>
                        <span className={`${styles.desktopCopy} sp-desktop-copy`}>
                          {project.title}
                        </span>
                        <span className={`${styles.mobileCopy} sp-mobile-copy`}>
                          {project.mobileTitle}
                        </span>
                      </>
                    ) : (
                      project.title
                    )}
                  </h2>
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
                      <li
                        className={`${styles.technology} sp-technology ${
                          project.title === 'PhD Research in Neuroscience' && technology === 'MATLAB'
                            ? 'sp-mobile-hidden-technology sp-narrow-desktop-hidden-technology'
                            : (project.title === 'Product Management for Data & AI Products' && technology === 'PMP')
                              || (project.title === 'Instagram Content Creation and Engagement Automation' && technology === 'Selenium')
                              ? 'sp-mobile-hidden-technology'
                              : ''
                        }`}
                        key={technology}
                      >
                        {project.title === 'PhD Research in Neuroscience' && technology === 'Computational Modeling' ? (
                          <>
                            <span className="sp-tag-desktop-copy">Computational Modeling</span>
                            <span className="sp-tag-mobile-copy">Modeling</span>
                          </>
                        ) : project.title === 'PhD Research in Neuroscience' && technology === 'Analysis' ? (
                          <>
                            <span className="sp-tag-desktop-copy">Data Analysis</span>
                            <span className="sp-tag-mobile-copy">Analysis</span>
                          </>
                        ) : (
                          technology
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <span className={`${styles.cardLinkIcon} sp-card-link-icon`} aria-hidden="true">
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
          ))}
        </div>
      </section>
    </main>
  );
}

export default SelectedProjectsPage;
