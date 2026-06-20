import { ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import styles from './InstagramProjectPage.module.css';

const metrics = [
  {
    title: '2,000+',
    description: 'Followers grown organically',
  },
  {
    title: '100%',
    description: 'Automated workflows',
  },
  {
    title: 'Daily',
    description: 'Content generation, posting, engagement',
  },
  {
    title: 'Cloud',
    description: 'Deployed on Google Cloud Platform',
  },
];

const technologies = ['Python', 'OpenAI', 'Gemini', 'Selenium', 'GCP'];

const examplePosts = [
  {
    mediaType: 'video',
    src: '/videos/video_cat_walking_w_music_instagram.mp4',
    caption: 'Pause, stretch, settle. Tiny tabby perfection.',
    href: 'https://www.instagram.com/p/DWea2UaCXdE/',
  },
  {
    mediaType: 'image',
    src: '/images/Golden_retriever_laying_on_couch_instagram.jpg',
    caption: 'Living for the snuggles!',
    href: 'https://www.instagram.com/p/DVG9NOZjq_-/',
  },
  {
    mediaType: 'image',
    src: '/images/Cat_in_bag_instagram.jpg',
    caption: 'Ambition entered the bag first, dignity got stuck behind.',
    href: 'https://www.instagram.com/p/DWrRaoTDm0K/',
  },
  {
    mediaType: 'image',
    src: '/images/Kitten_jumping_on_bed_instagram.jpg',
    caption: 'Soaking up the snuggles!',
    href: 'https://www.instagram.com/p/DUvyECpjhF-/',
  },
];

function InstagramProjectPage() {
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef(null);

  return (
    <main className={styles.page}>
      <Navigation variant="projects" />

      <div className={styles.content}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/projects">Selected Projects</Link>
          <span aria-hidden="true">›</span>
          <span>Instagram Content Creation and Engagement Automation</span>
        </nav>

        <section className={styles.hero} aria-labelledby="project-title">
          <div className={styles.heroCopy}>
            <h1 id="project-title">
              Instagram Content Creation and Engagement Automation
            </h1>
            <p className={styles.years}>11/2024 – Present</p>
            <p className={styles.intro}>
              Designed and built an end-to-end system that automates content
              generation, publishing, audience targeting, and engagement
              workflows for Instagram. The system has grown the account to
              2,000+ followers through{' '}
              <a href="#posts-title">AI-powered content creation</a> and fully
              automated engagement workflows.
            </p>
          </div>
        </section>

        <section className={styles.metrics} aria-label="Project highlights">
          {metrics.map(({ description, title }) => (
            <article className={styles.metricCard} key={title}>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <section className={styles.section} aria-labelledby="architecture-title">
          <header className={styles.sectionHeader}>
            <h2 id="architecture-title">Architecture</h2>
            <p>
              An end-to-end pipeline for AI-powered content generation,
              automated posting, and targeted engagement.
            </p>
          </header>

          <div className={styles.architectureScroller}>
            <div className={styles.architectureDiagram}>
              <svg
                aria-hidden="true"
                className={styles.connectorLayer}
                viewBox="0 0 900 484"
              >
                <line x1="450" y1="160" x2="450" y2="196" />
                <line x1="143" y1="258" x2="450" y2="258" />
                <line x1="450" y1="258" x2="733" y2="258" />
                <line x1="450" y1="320" x2="450" y2="356" />
              </svg>

              <div className={`${styles.archBox} ${styles.contentGeneration}`}>
                <h3>AI Content Generation</h3>
                <div className={styles.archItems}>
                  <p>Images</p>
                  <p>Videos</p>
                  <p>Music</p>
                  <p>Captions</p>
                </div>
                <p className={styles.boxNote}>
                  Generates content for posting
                </p>
              </div>

              <article className={`${styles.archBox} ${styles.accountBox}`}>
                <h3>Account Discovery &amp; Filtering</h3>
                <div className={styles.archItems}>
                  <p>Computer vision</p>
                  <p>Content categorization</p>
                  <p>Account relevance scoring</p>
                </div>
                <p className={styles.boxNote}>
                  Selects target accounts for engagement
                </p>
              </article>

              <article className={`${styles.archBox} ${styles.centerBox}`}>
                <h3>Coordination Layer</h3>
                <div className={styles.archItems}>
                  <p>Workflow coordination</p>
                  <p>Execution timing</p>
                </div>
                <p className={styles.boxNote}>
                  Coordinates system behavior
                </p>
              </article>

              <article className={`${styles.archBox} ${styles.browserBox}`}>
                <h3>Browser Automation</h3>
                <div className={styles.archItems}>
                  <p>Post content</p>
                  <p>Follow / Unfollow</p>
                  <p>Like</p>
                </div>
                <p className={styles.boxNote}>
                  Executes Instagram actions
                </p>
              </article>

              <article className={`${styles.archBox} ${styles.bottomBox}`}>
                <h3>Data &amp; Behavioral Tracking</h3>
                <div className={styles.archItems}>
                  <p>Action logs</p>
                  <p>Engagement received</p>
                  <p>Public account metrics</p>
                </div>
                <p className={styles.boxNote}>
                  Tracks actions and system inputs
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="technologies-title">
          <div className={styles.technologyRow}>
            <p className={styles.technologyLabel} id="technologies-title">
              Technologies
            </p>
            <ul className={styles.technologyList}>
              {technologies.map((technology) => (
                <li className={styles.technologyPill} key={technology}>
                  {technology}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="posts-title">
          <header className={styles.sectionHeader}>
            <h2 id="posts-title">Example Posts</h2>
            <p>A few examples of AI-generated content published to the Instagram account.</p>
          </header>

          <div className={styles.postGrid}>
            {examplePosts.map((post) => {
              const cardInner = (
                <>
                  <div className={styles.exampleMedia}>
                    {post.mediaType === 'video' ? (
                      <>
                        <video
                          autoPlay
                          loop
                          muted={videoMuted}
                          playsInline
                          preload="metadata"
                          ref={videoRef}
                          onLoadedMetadata={() => {
                            if (videoRef.current) {
                              videoRef.current.volume = 0.32;
                            }
                          }}
                        >
                          <source src={post.src} type="video/mp4" />
                        </video>
                        <button
                          type="button"
                          className={styles.audioToggle}
                          aria-label={videoMuted ? 'Turn sound on' : 'Mute video'}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setVideoMuted((current) => {
                              const nextMuted = !current;

                              if (videoRef.current) {
                                videoRef.current.muted = nextMuted;
                                if (!nextMuted) {
                                  videoRef.current.volume = 0.32;
                                }
                              }

                              return nextMuted;
                            });
                          }}
                        >
                          {videoMuted ? <VolumeX /> : <Volume2 />}
                        </button>
                      </>
                    ) : (
                      <img src={post.src} alt="" />
                    )}
                  </div>
                  <div className={styles.exampleMeta}>
                    <p>{post.caption}</p>
                  </div>
                  <span className={styles.cardLinkIcon} aria-hidden="true">
                    <ExternalLink />
                  </span>
                </>
              );

              return (
                <a
                  className={`${styles.exampleCard} ${styles.exampleLinkCard}`}
                  href={post.href}
                  key={post.src}
                  rel="noreferrer"
                  target="_blank"
                >
                  {cardInner}
                </a>
              );
            })}
          </div>
          <p className={styles.postNote}>
            Click on a post to see engagement received (e.g., likes, comments).
          </p>
        </section>
      </div>
    </main>
  );
}

export default InstagramProjectPage;
