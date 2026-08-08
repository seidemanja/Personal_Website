import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import styles from './Navigation.module.css';

const rightItems = [
  { label: 'Resume', to: '/resume' },
  { label: 'Selected Work', to: '/projects' },
  { label: 'AI Chat', shortLabel: 'AI', to: '/ai-chat' },
];

function Navigation({ variant = 'home' }) {
  const isInteriorPage = variant !== 'home';

  return (
    <nav
      className={`${styles.nav} pd-nav ${isInteriorPage ? `${styles.sticky} pd-nav-sticky` : ''}`}
      aria-label="Primary navigation"
    >
      <div className={`${styles.inner} pd-nav-inner`}>
        {isInteriorPage ? (
          <NavLink
            className={`${styles.brand} pd-nav-brand`}
            to="/"
            aria-label="Joshua Seideman, PhD home"
          >
            <span className={`${styles.desktopBrandText} pd-nav-desktop-brand-text`}>Joshua Seideman, PhD</span>
            <Home className={`${styles.mobileHomeIcon} pd-nav-mobile-home-icon`} size={18} strokeWidth={1.9} aria-hidden="true" />
          </NavLink>
        ) : (
          <NavLink
            className={({ isActive }) =>
              isActive
                ? `${styles.link} ${styles.active} pd-nav-link pd-nav-active`
                : `${styles.link} pd-nav-link`
            }
            to="/"
            aria-label="Home"
          >
            <span className={`${styles.homeText} pd-nav-home-text`}>Home</span>
            <Home className={`${styles.mobileHomeIcon} pd-nav-mobile-home-icon`} size={18} strokeWidth={1.9} aria-hidden="true" />
          </NavLink>
        )}

        <div className={`${styles.rightGroup} pd-nav-right-group`} aria-label="Supplemental navigation">
          {rightItems.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.link} ${styles.active} pd-nav-link pd-nav-active`
                    : `${styles.link} pd-nav-link`
                }
                to={item.to}
              >
                {item.shortLabel ? (
                  <>
                    <span className={`${styles.fullLinkText} pd-nav-full-link-text`}>{item.label}</span>
                    <span className={`${styles.shortLinkText} pd-nav-short-link-text`}>
                      {item.shortLabel}
                    </span>
                  </>
                ) : (
                  item.label
                )}
              </NavLink>
            ) : (
              <span className={`${styles.link} pd-nav-link`} aria-disabled="true" key={item.label}>
                {item.label}
              </span>
            ),
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
