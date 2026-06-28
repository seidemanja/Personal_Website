import { NavLink } from 'react-router-dom';
import styles from './Navigation.module.css';

const rightItems = [
  { label: 'Resume', to: '/resume' },
  { label: 'Selected Projects', to: '/projects' },
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
            <span className={`${styles.mobileBrandText} pd-nav-mobile-brand-text`}>Seideman, PhD</span>
          </NavLink>
        ) : (
          <NavLink
            className={({ isActive }) =>
              isActive
                ? `${styles.link} ${styles.active} pd-nav-link pd-nav-active`
                : `${styles.link} pd-nav-link`
            }
            to="/"
          >
            Home
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
                {item.label}
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
