import { ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import { useArchitectureLayout } from '../hooks/useArchitectureLayout.js';
import styles from './InstagramProjectPage.module.css';

const metrics = [
  {
    title: '2,000+',
    description: 'Followers gained',
  },
  {
    title: '100%',
    description: 'Automated workflows',
    mobileDescription: 'Automated',
  },
  {
    title: 'AI',
    description: 'Content creation',
  },
  {
    title: 'Cloud',
    description: 'GCP deployment',
  },
];

const technologies = ['Python', 'OpenAI', 'Gemini', 'Selenium', 'GCP'];

const examplePosts = [
  {
    mediaType: 'video',
    src: '/videos/video_cat_walking_w_music_instagram.mp4',
    caption: 'Pause, stretch, settle. Tiny tabby perfection.',
    href: 'https://www.instagram.com/p/DWea2UaCXdE/',
    appHref: 'instagram://media?id=3863643612303161156',
  },
  {
    mediaType: 'image',
    src: '/images/Golden_retriever_laying_on_couch_instagram.jpg',
    caption: 'Living for the snuggles!',
    href: 'https://www.instagram.com/p/DVG9NOZjq_-/',
    appHref: 'instagram://media?id=3839024922031468542',
  },
  {
    mediaType: 'image',
    src: '/images/Cat_in_bag_instagram.jpg',
    caption: 'Ambition entered the bag first, dignity got stuck behind.',
    href: 'https://www.instagram.com/p/DWrRaoTDm0K/',
    appHref: 'instagram://media?id=3867261301794172170',
  },
  {
    mediaType: 'image',
    src: '/images/Kitten_jumping_on_bed_instagram.jpg',
    caption: 'Soaking up the snuggles!',
    href: 'https://www.instagram.com/p/DUvyECpjhF-/',
    appHref: 'instagram://media?id=3832501987963703678',
  },
];

function InstagramProjectPage() {
  const [videoMuted, setVideoMuted] = useState(true);
  const [isPostsHighlighted, setIsPostsHighlighted] = useState(false);
  const videoRef = useRef(null);
  const architectureContainerRef = useRef(null);
  const contentGenerationRef = useRef(null);
  const accountRef = useRef(null);
  const centerRef = useRef(null);
  const browserRef = useRef(null);
  const bottomRef = useRef(null);
  const architectureRefs = useMemo(
    () => ({
      account: accountRef,
      bottom: bottomRef,
      browser: browserRef,
      center: centerRef,
      top: contentGenerationRef,
    }),
    [],
  );
  const architectureLayout = useArchitectureLayout(architectureRefs, {
    containerRef: architectureContainerRef,
    horizontalGap: 72,
    storageKey: 'instagram-project-architecture',
    verticalGap: 42,
    width: 900,
  });
  const handlePostLinkClick = useCallback((event, post) => {
    if (
      typeof window !== 'undefined'
      && window.matchMedia('(hover: none) and (pointer: coarse)').matches
    ) {
      event.preventDefault();
      window.location.assign(post.appHref ?? post.href);
    }
  }, []);

  useEffect(() => {
    if (!isPostsHighlighted) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setIsPostsHighlighted(false);
    }, 1300);

    return () => window.clearTimeout(timeout);
  }, [isPostsHighlighted]);

  return (
    <main className={`${styles.page} pd-page`}>
      <Navigation variant="projects" />

      <div className={`${styles.content} pd-content`}>
        <nav className={`${styles.breadcrumbs} pd-breadcrumbs`} aria-label="Breadcrumb">
          <Link to="/projects">Selected Projects</Link>
          <span aria-hidden="true">›</span>
          <span>Instagram Content Creation and Engagement Automation</span>
        </nav>

        <section className={styles.hero} aria-labelledby="project-title">
          <div className={`${styles.heroCopy} pd-hero-copy`}>
            <h1 className={`${styles.instagramTitle} pd-project-title pd-instagram-title`} id="project-title">
              Instagram Content Creation and Engagement Automation
            </h1>
            <p className={`${styles.years} pd-years`}>11/2024 – Present</p>
            <p className={`${styles.intro} pd-intro`}>
              Designed and built an end-to-end system that automates content
              generation, posting, audience targeting, and engagement for
              Instagram, using AI-assisted coding to accelerate implementation.
              The system has grown the account to 2,000+ followers through{' '}
              <a href="#posts-title" onClick={() => setIsPostsHighlighted(true)}>
                AI-powered content creation
              </a>{' '}
              and fully
              automated engagement workflows.
            </p>
          </div>
        </section>

        <section className={`${styles.metrics} pd-metrics`} aria-label="Project highlights">
          {metrics.map(({ description, mobileDescription, title }) => (
            <article className={`${styles.metricCard} pd-metric-card`} key={title}>
              <h2>{title}</h2>
              <p>
                {mobileDescription ? (
                  <>
                    <span className={`${styles.metricDesktopCopy} pd-metric-desktop-copy`}>{description}</span>
                    <span className={`${styles.metricMobileCopy} pd-metric-mobile-copy`}>{mobileDescription}</span>
                  </>
                ) : (
                  description
                )}
              </p>
            </article>
          ))}
        </section>

        <section className={`${styles.section} pd-section`} aria-labelledby="architecture-title">
          <header className={`${styles.sectionHeader} pd-section-header`}>
            <h2 id="architecture-title">Architecture</h2>
            <p>
              <span className={`${styles.desktopCopy} pd-detail-desktop-copy`}>
                An end-to-end pipeline for AI-powered content generation,
                automated posting, and targeted engagement.
              </span>
              <span className={`${styles.mobileCopy} pd-detail-mobile-copy`}>
                An end-to-end pipeline for AI-powered content creation,
                automated posting, and targeted engagement.
              </span>
            </p>
          </header>

          <div className={`${styles.architectureScroller} pd-architecture-scroller`} ref={architectureContainerRef}>
            <div
              className={`${styles.architectureDiagram} pd-architecture-diagram`}
              style={architectureLayout.diagramStyle}
            >
              <svg
                aria-hidden="true"
                className={`${styles.connectorLayer} pd-connector-layer`}
                style={architectureLayout.connectorStyle}
                viewBox={`0 0 ${architectureLayout.width || 900} ${architectureLayout.height || 540}`}
              >
                {architectureLayout.lines.map((line, index) => (
                  <line
                    key={`${line.x1}-${line.y1}-${index}`}
                    x1={line.x1}
                    x2={line.x2}
                    y1={line.y1}
                    y2={line.y2}
                  />
                ))}
              </svg>

              <div
                className={`${styles.archBox} ${styles.contentGeneration} pd-arch-box pd-instagram-top`}
                ref={contentGenerationRef}
                style={architectureLayout.positions.top}
              >
                <h3>AI Content Generation</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Images</p>
                  <p>Videos</p>
                  <p>Music</p>
                  <p>Captions</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Generates content for posting
                </p>
              </div>

              <article
                className={`${styles.archBox} ${styles.accountBox} pd-arch-box pd-instagram-account`}
                ref={accountRef}
                style={architectureLayout.positions.account}
              >
                <h3>Account Discovery &amp; Filtering</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Computer vision</p>
                  <p>Behavioral profiling</p>
                  <p>Interest characterization</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Selects target accounts for engagement
                </p>
              </article>

              <article
                className={`${styles.archBox} ${styles.centerBox} pd-arch-box pd-instagram-center`}
                ref={centerRef}
                style={architectureLayout.positions.center}
              >
                <h3>Coordination Layer</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Workflow coordination</p>
                  <p>Execution timing</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Coordinates system behavior
                </p>
              </article>

              <article
                className={`${styles.archBox} ${styles.browserBox} pd-arch-box pd-instagram-browser`}
                ref={browserRef}
                style={architectureLayout.positions.browser}
              >
                <h3>Browser Automation</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Post content</p>
                  <p>Follow / Unfollow</p>
                  <p>Like</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Executes Instagram actions
                </p>
              </article>

              <article
                className={`${styles.archBox} ${styles.bottomBox} pd-arch-box pd-instagram-bottom`}
                ref={bottomRef}
                style={architectureLayout.positions.bottom}
              >
                <h3>Data &amp; Behavioral Tracking</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Action logs</p>
                  <p>Engagement received</p>
                  <p>Public account metrics</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Tracks actions and system inputs
                </p>
              </article>
            </div>

            <div className={`${styles.mobileArchitectureDiagram} pd-mobile-architecture-diagram`}>
              <article className={`${styles.mobileArchBox} ${styles.mobileRootBox} pd-mobile-arch-box pd-mobile-root-box`}>
                <h3>Coordination Layer</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Workflow coordination</p>
                  <p>Execution timing</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Coordinates system behavior
                </p>
              </article>

              <article className={`${styles.mobileArchBox} pd-mobile-arch-box`}>
                <h3>AI Content Generation</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Images</p>
                  <p>Videos</p>
                  <p>Music</p>
                  <p>Captions</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Generates content for posting
                </p>
              </article>

              <article className={`${styles.mobileArchBox} pd-mobile-arch-box`}>
                <h3>Account Discovery &amp; Filtering</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Computer vision</p>
                  <p>Behavioral profiling</p>
                  <p>Interest characterization</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Selects target accounts for engagement
                </p>
              </article>

              <article className={`${styles.mobileArchBox} pd-mobile-arch-box`}>
                <h3>Browser Automation</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Post content</p>
                  <p>Follow / Unfollow</p>
                  <p>Like</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Executes Instagram actions
                </p>
              </article>

              <article className={`${styles.mobileArchBox} pd-mobile-arch-box`}>
                <h3>Data &amp; Behavioral Tracking</h3>
                <div className={`${styles.archItems} pd-arch-items`}>
                  <p>Action logs</p>
                  <p>Engagement received</p>
                  <p>Public account metrics</p>
                </div>
                <p className={`${styles.boxNote} pd-box-note`}>
                  Tracks actions and system inputs
                </p>
              </article>
            </div>
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

        <section className={`${styles.section} pd-section`} aria-labelledby="posts-title">
          <header
            className={`${styles.sectionHeader} pd-section-header ${
              isPostsHighlighted ? styles.anchorHighlight : ''
            }`}
          >
            <h2 id="posts-title">Example Posts</h2>
            <p>A few examples of AI-generated content published to the Instagram account.</p>
          </header>

          <div className={`${styles.postGrid} pd-post-grid`}>
            {examplePosts.map((post) => {
              const cardInner = (
                <>
                  <div className={`${styles.exampleMedia} pd-example-media`}>
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
                  <div className={`${styles.exampleMeta} pd-example-meta`}>
                    <p>{post.caption}</p>
                  </div>
                  <span className={`${styles.cardLinkIcon} pd-card-link-icon`} aria-hidden="true">
                    <ExternalLink />
                  </span>
                </>
              );

              return (
                <a
                  className={`${styles.exampleCard} ${styles.exampleLinkCard} pd-example-card`}
                  href={post.href}
                  key={post.src}
                  onClick={(event) => handlePostLinkClick(event, post)}
                  rel="noreferrer"
                  target="_blank"
                >
                  {cardInner}
                </a>
              );
            })}
          </div>
          <p className={`${styles.postNote} pd-post-note`}>
            Click on a post to see engagement received (e.g., likes, comments).
          </p>
        </section>
      </div>
    </main>
  );
}

export default InstagramProjectPage;
