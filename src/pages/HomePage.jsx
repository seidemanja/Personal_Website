import { Fragment, useEffect, useRef, useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import Navigation from '../components/Navigation.jsx';
import { refreshNIHGrantUrl } from '../nihGrant.js';
import styles from './HomePage.module.css';

const EMAIL_ADDRESS = 'josh.seideman@me.com';

const profileLinks = [
  {
    type: 'email',
    label: 'Email Joshua Seideman',
    text: 'Email',
    icon: Mail,
  },
  {
    href: 'https://www.linkedin.com/in/joshua-a-seideman/',
    label: 'LinkedIn profile',
    text: 'LinkedIn',
    icon: '/images/LinkedIn_icon_64.png',
  },
  {
    href: 'https://scholar.google.com/citations?user=_dN3kXQAAAAJ&hl=en&oi=ao',
    label: 'Google Scholar profile',
    text: 'Google Scholar',
    icon: '/images/Google_Scholar_logo.svg',
  },
];

function HomePage() {
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const emailButtonRef = useRef(null);
  const emailMenuRef = useRef(null);

  useEffect(() => {
    void refreshNIHGrantUrl({ force: true });
  }, []);

  useEffect(() => {
    if (!isEmailOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;

      if (
        emailButtonRef.current?.contains(target) ||
        emailMenuRef.current?.contains(target)
      ) {
        return;
      }

      setIsEmailOpen(false);
      setIsCopied(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isEmailOpen]);

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_ADDRESS);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1600);
    } catch {
      const fallbackInput = document.createElement('textarea');
      fallbackInput.value = EMAIL_ADDRESS;
      fallbackInput.setAttribute('readonly', '');
      fallbackInput.style.position = 'fixed';
      fallbackInput.style.opacity = '0';
      document.body.appendChild(fallbackInput);
      fallbackInput.select();
      document.execCommand('copy');
      document.body.removeChild(fallbackInput);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1600);
    }
  };

  return (
    <main className={styles.page} id="home">
      <section className={styles.hero} aria-labelledby="home-title">
        <Navigation variant="home" />

        <div className={styles.heroGrid}>
          <div className={styles.portraitWrap}>
            <img
              className={styles.portrait}
              src="/images/Josh_Headshot_760.jpg"
              alt="Joshua Seideman"
              decoding="sync"
              fetchpriority="high"
              loading="eager"
              width="743"
              height="760"
            />
          </div>

          <div className={styles.content}>
            <header className={styles.header}>
              <h1 id="home-title" className={styles.title}>
                Joshua Seideman, PhD
              </h1>
              <p className={styles.subtitle}>Product Manager &middot; Scientist</p>
            </header>

            <div className={styles.rule} aria-hidden="true" />

            <ul className={styles.profileLinks} aria-label="Profile links">
              {profileLinks.map(({ href, label, icon: Icon, type, text }, index) => (
                <Fragment key={label}>
                  <li className={styles.profileLinkItem}>
                    {type === 'email' ? (
                      <>
                        <button
                          ref={emailButtonRef}
                          className={styles.profileLink}
                          type="button"
                          aria-label={label}
                          aria-expanded={isEmailOpen}
                          aria-controls="email-menu"
                          onClick={() => setIsEmailOpen((open) => !open)}
                        >
                          <Icon aria-hidden="true" strokeWidth={1.9} />
                          <span className={styles.emailLabel}>{text}</span>
                        </button>

                        {isEmailOpen ? (
                          <div
                            ref={emailMenuRef}
                            className={styles.emailMenu}
                            id="email-menu"
                            role="menu"
                            aria-label="Email address"
                          >
                            <span className={styles.emailAddress}>
                              {EMAIL_ADDRESS}
                            </span>
                            <button
                              className={styles.copyButton}
                              type="button"
                              aria-label="Copy email address"
                              onClick={copyEmailToClipboard}
                            >
                              {isCopied ? (
                                <Check aria-hidden="true" strokeWidth={2} />
                              ) : (
                                <Copy aria-hidden="true" strokeWidth={2} />
                              )}
                            </button>
                            <span
                              className={`${styles.copyMessage} ${
                                isCopied ? styles.copyMessageVisible : ''
                              }`}
                              aria-live="polite"
                            >
                              Copied to clipboard
                            </span>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <a
                        className={styles.profileLink}
                        href={href}
                        aria-label={label}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          className={styles.linkIcon}
                          src={Icon}
                          alt=""
                          aria-hidden="true"
                          decoding="sync"
                          loading="eager"
                          width="32"
                          height="32"
                        />
                        <span className={styles.socialLabel}>{text}</span>
                      </a>
                    )}
                  </li>
                  {index < profileLinks.length - 1 ? (
                    <li className={styles.dividerItem} aria-hidden="true">
                      <span className={styles.divider} />
                    </li>
                  ) : null}
                </Fragment>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
