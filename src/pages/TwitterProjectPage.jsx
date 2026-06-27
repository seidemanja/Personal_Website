import { ExternalLink } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation.jsx';
import { useArchitectureLayout } from '../hooks/useArchitectureLayout.js';
import styles from './InstagramProjectPage.module.css';

const metrics = [
  {
    title: '700+',
    description: 'Digital assets won',
  },
  {
    title: '100%',
    description: 'Automated workflows',
    mobileDescription: 'Automated',
  },
  {
    title: 'AWS',
    description: 'Cloud deployment',
  },
];

const technologies = ['Python', 'Twitter API', 'AWS'];

const nftExamples = [
  {
    src: '/images/Skeleton_punks_NFT.avif',
    title: 'Skeleton Punks #355',
    href: 'https://opensea.io/item/polygon/0x688e6a1ca010e3b7eee99db8deea442257d48b31/355',
  },
  {
    src: '/images/Pizzaface.avif',
    title: 'Pizzaface #5',
    href: 'https://opensea.io/item/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/49879903120962930312887756712303232053883587649198307825174097650565511118849',
  },
  {
    imageClassName: styles.imageAlignTop,
    src: '/images/Fuzzy_Buddy_NFT.avif',
    title: 'Fuzzy Buddy 1357 #242',
    href: 'https://opensea.io/item/polygon/0x50e282cfa3cd96760ec3d0519f3d5433751360d0/242',
  },
  {
    src: '/images/Ape_JokerNFT.avif',
    title: 'Ape JokerNFT',
    href: 'https://opensea.io/item/polygon/0x2953399124f0cbb46d2cbacd8a89cf0599974963/25084302752015208703924669976003710660946739208206644788788707655380728021017',
  },
];

function TwitterProjectPage() {
  const architectureContainerRef = useRef(null);
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
    }),
    [],
  );
  const architectureLayout = useArchitectureLayout(architectureRefs, {
    centerTop: 24,
    childGap: 24,
    containerRef: architectureContainerRef,
    layout: 'parent-row',
    verticalGap: 72,
    width: 900,
  });

  return (
    <main className={styles.page}>
      <Navigation variant="projects" />

      <div className={styles.content}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link to="/projects">Selected Projects</Link>
          <span aria-hidden="true">›</span>
          <span>Automated Twitter Giveaway Entry</span>
        </nav>

        <section className={styles.hero} aria-labelledby="project-title">
          <div className={styles.heroCopy}>
            <h1 id="project-title">Automated Twitter Giveaway Entry</h1>
            <p className={styles.years}>03/2022 – 05/2023</p>
            <p className={styles.intro}>
              Designed and built an end-to-end system that automates giveaway
              discovery, entry requirement evaluation, and engagement workflows
              on Twitter. The system operated without manual intervention and
              {' '}
              <a href="#nfts-title">won 700+ digital assets</a> through
              automated giveaway participation.
            </p>
          </div>
        </section>

        <section
          className={`${styles.metrics} ${styles.metricsThree}`}
          aria-label="Project highlights"
        >
          {metrics.map(({ description, mobileDescription, title }) => (
            <article className={styles.metricCard} key={title}>
              <h2>{title}</h2>
              <p>
                {mobileDescription ? (
                  <>
                    <span className={styles.metricDesktopCopy}>{description}</span>
                    <span className={styles.metricMobileCopy}>{mobileDescription}</span>
                  </>
                ) : (
                  description
                )}
              </p>
            </article>
          ))}
        </section>

        <section className={styles.section} aria-labelledby="architecture-title">
          <header className={styles.sectionHeader}>
            <h2 id="architecture-title">Architecture</h2>
            <p>
              A fully automated pipeline for content discovery, engagement,
              and activity tracking.
            </p>
          </header>

          <div className={styles.architectureScroller} ref={architectureContainerRef}>
            <div
              className={`${styles.architectureDiagram} ${styles.twitterArchitectureDiagram}`}
              style={architectureLayout.diagramStyle}
            >
              <svg
                aria-hidden="true"
                className={`${styles.connectorLayer} ${styles.twitterConnectorLayer}`}
                style={architectureLayout.connectorStyle}
                viewBox={`0 0 ${architectureLayout.width || 900} ${architectureLayout.height || 380}`}
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

              <article
                className={`${styles.archBox} ${styles.accountBox} ${styles.twitterAccountBox}`}
                ref={accountRef}
                style={architectureLayout.positions.account}
              >
                <h3>Content Discovery</h3>
                <div className={styles.archItems}>
                  <p>Search and find giveaways</p>
                  <p>Screen entry requirements</p>
                  <p>Detect giveaway blockchain</p>
                </div>
                <p className={styles.boxNote}>Finds relevant opportunities</p>
              </article>

              <article
                className={`${styles.archBox} ${styles.centerBox} ${styles.twitterCenterBox}`}
                ref={centerRef}
                style={architectureLayout.positions.center}
              >
                <h3>Coordination Layer</h3>
                <div className={styles.archItems}>
                  <p>Evaluate entry requirements</p>
                  <p>Select participation actions</p>
                  <p>Match blockchain to wallet</p>
                </div>
                <p className={styles.boxNote}>
                  Coordinates system behavior
                </p>
              </article>

              <article
                className={`${styles.archBox} ${styles.browserBox} ${styles.twitterBrowserBox}`}
                ref={browserRef}
                style={architectureLayout.positions.browser}
              >
                <h3>Automated Engagement</h3>
                <div className={styles.archItems}>
                  <p>Like giveaway posts</p>
                  <p>Retweet giveaway posts</p>
                  <p>Follow accounts</p>
                  <p>Comment to enter</p>
                </div>
                <p className={styles.boxNote}>Executes Twitter actions</p>
              </article>

              <article
                className={`${styles.archBox} ${styles.bottomBox} ${styles.twitterBottomBox}`}
                ref={bottomRef}
                style={architectureLayout.positions.bottom}
              >
                <h3>Data &amp; Activity Tracking</h3>
                <div className={styles.archItems}>
                  <p>Giveaway metadata</p>
                  <p>Action logs</p>
                </div>
                <p className={styles.boxNote}>
                  Tracks giveaways and actions
                </p>
              </article>
            </div>

            <div className={styles.mobileArchitectureDiagram}>
              <article className={`${styles.mobileArchBox} ${styles.mobileRootBox}`}>
                <h3>Coordination Layer</h3>
                <div className={styles.archItems}>
                  <p>Evaluate entry requirements</p>
                  <p>Select participation actions</p>
                  <p>Match blockchain to wallet</p>
                </div>
                <p className={styles.boxNote}>
                  Coordinates system behavior
                </p>
              </article>

              <article className={styles.mobileArchBox}>
                <h3>Content Discovery</h3>
                <div className={styles.archItems}>
                  <p>Search and find giveaways</p>
                  <p>Screen entry requirements</p>
                  <p>Detect giveaway blockchain</p>
                </div>
                <p className={styles.boxNote}>Finds relevant opportunities</p>
              </article>

              <article className={styles.mobileArchBox}>
                <h3>Automated Engagement</h3>
                <div className={styles.archItems}>
                  <p>Like giveaway posts</p>
                  <p>Retweet giveaway posts</p>
                  <p>Follow accounts</p>
                  <p>Comment to enter</p>
                </div>
                <p className={styles.boxNote}>Executes Twitter actions</p>
              </article>

              <article className={styles.mobileArchBox}>
                <h3>Data &amp; Activity Tracking</h3>
                <div className={styles.archItems}>
                  <p>Giveaway metadata</p>
                  <p>Action logs</p>
                </div>
                <p className={styles.boxNote}>
                  Tracks giveaways and actions
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

        <section className={styles.section} aria-labelledby="nfts-title">
          <header className={styles.sectionHeader}>
            <h2 id="nfts-title">Example Digital Assets Won</h2>
            <p>A sample of digital assets won through automated engagement.</p>
          </header>

          <div className={`${styles.postGrid} ${styles.nftGrid}`}>
            {nftExamples.map((nft) => (
              <a
                className={`${styles.exampleCard} ${styles.exampleLinkCard} ${styles.nftCard}`}
                href={nft.href}
                key={nft.title}
                rel="noreferrer"
                target="_blank"
              >
                <div className={styles.exampleMedia}>
                  <img className={nft.imageClassName} src={nft.src} alt="" />
                </div>
                <div className={styles.exampleMeta}>
                  <p>
                    <strong>{nft.title}</strong>
                  </p>
                </div>
                <span className={styles.cardLinkIcon} aria-hidden="true">
                  <ExternalLink />
                </span>
              </a>
            ))}
          </div>
          <p className={styles.postNote}>
            Click on a digital asset to view it on OpenSea.
          </p>
        </section>
      </div>
    </main>
  );
}

export default TwitterProjectPage;
