import { Volume2, VolumeX } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
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

const technologies = ['Python', 'Selenium', 'OpenAI', 'Gemini', 'GCP'];

const examplePosts = [
  {
    mediaType: 'image',
    src: '/images/Cat_in_bag_instagram.jpg',
    caption: "Run like nobody's watching",
    href: 'https://www.instagram.com/p/DWrRaoTDm0K/',
  },
  {
    mediaType: 'image',
    src: '/images/Kitten_jumping_on_bed_instagram.jpg',
    caption: 'Double the purrs, double the love',
    href: 'https://www.instagram.com/p/DUvyECpjhF-/',
  },
  {
    mediaType: 'image',
    src: '/images/Golden_retriever_laying_on_couch_instagram.jpg',
    caption: 'Corgi zoomies = instant happiness',
    href: 'https://www.instagram.com/p/DVG9NOZjq_-/',
  },
  {
    mediaType: 'video',
    src: '/videos/video_cat_walking_w_music_instagram.mp4',
    caption: 'Cozy mood: activated',
    href: 'https://www.instagram.com/p/DWea2UaCXdE/',
  },
];

function InstagramProjectPage() {
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef(null);
  const heroCaption = useMemo(
    () => ({
      username: 'cute_kitties_and_puppies',
      text: 'Happy Friday! 🐾',
    }),
    [],
  );

  return (
    <main className={styles.page}>
      <Navigation variant="projects" />

      <div className={styles.content}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/projects">Selected Projects</Link>
          <span aria-hidden="true">›</span>
          <span>
            Automated Instagram Engagement System with AI-Powered Content
            Generation
          </span>
        </nav>

        <section className={styles.hero} aria-labelledby="project-title">
          <div className={styles.heroCopy}>
            <h1 id="project-title">
              Automated Instagram Engagement System with AI-Powered Content
              Generation
            </h1>
            <p className={styles.years}>11/2024 – Present</p>
            <p className={styles.intro}>
              Designed and built an end-to-end web automation system (Python,
              Selenium) to orchestrate daily content generation, posting, and
              engagement workflows without manual intervention. Integrated
              OpenAI and Gemini APIs for multimodal content generation, and for
              image-based classification to identify relevant accounts and
              enable targeted engagement. Deployed and operated the system on
              Google Cloud Platform (GCP) with scheduled execution, enabling
              continuous, unattended operation. Grew account to 2,000+
              followers with fully automated content generation and engagement
              workflows.
            </p>
          </div>

          <figure className={styles.heroPost}>
            <div className={styles.postFrame}>
              <div className={styles.postMedia}>
                <img
                  src="/images/Cat_in_bag_instagram.jpg"
                  alt="Example AI-generated Instagram cat post"
                />
              </div>
              <div className={styles.postBody}>
                <p className={styles.postCaption}>
                  <strong>{heroCaption.username}</strong> {heroCaption.text}
                </p>
              </div>
            </div>
            <figcaption>
              Example AI-generated post from the account
            </figcaption>
          </figure>
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
                viewBox="0 0 900 455"
              >
                <line x1="450" y1="96" x2="450" y2="160" />
                <line x1="260" y1="220" x2="289" y2="220" />
                <line x1="611" y1="220" x2="640" y2="220" />
                <line x1="450" y1="274" x2="450" y2="335" />
              </svg>

              <div className={`${styles.archBox} ${styles.contentGeneration}`}>
                <h3>Content Generation</h3>
                <p className={styles.boxAccent}>OpenAI / Gemini API</p>
                <p>Images, Videos, Music, Captions</p>
              </div>

              <article className={`${styles.archBox} ${styles.accountBox}`}>
                <h3>Account Discovery &amp; Filtering</h3>
                <ul>
                  <li>Computer Vision</li>
                  <li>OpenAI Vision API</li>
                </ul>
                <p className={styles.boxNote}>
                  Uses image-based classification to identify relevant accounts
                  and enable targeted engagement
                </p>
              </article>

              <article className={`${styles.archBox} ${styles.centerBox}`}>
                <h3>Python Orchestration Layer</h3>
                <p className={styles.boxAccent}>Selenium · GCP Scheduler</p>
                <p>Rules, workflow coordination</p>
                <p>decision making</p>
              </article>

              <article className={`${styles.archBox} ${styles.browserBox}`}>
                <h3>Browser Automation</h3>
                <ul>
                  <li>Post Content</li>
                  <li>Follow / Unfollow</li>
                  <li>Like</li>
                </ul>
              </article>

              <article className={`${styles.archBox} ${styles.bottomBox}`}>
                <h3>Data &amp; Behavioral Tracking</h3>
                <p>Action logs</p>
                <p>Engagement tracking</p>
                <p>Account history</p>
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
                    <p>
                      <strong>cute_kitties_and_puppies</strong> {post.caption}
                    </p>
                  </div>
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
        </section>
      </div>
    </main>
  );
}

export default InstagramProjectPage;
