import { NavLink } from 'react-router-dom';
import { loadResumePage } from '../routes.js';
import styles from './Navigation.module.css';

const rightItems = [
  { label: 'Resume', to: '/resume' },
  { label: 'Selected Projects', to: '/projects' },
];

function prefetchRoute(to) {
  if (to === '/resume') {
    void loadResumePage();
  }
}

function Navigation({ variant = 'home' }) {
  const isInteriorPage = variant !== 'home';

  return (
    <nav className={`${styles.nav} ${isInteriorPage ? styles.sticky : ''}`} aria-label="Primary navigation">
      <div className={styles.inner}>
        {isInteriorPage ? (
          <NavLink className={styles.brand} to="/" aria-label="Joshua Seideman, PhD home">
            Joshua Seideman, PhD
          </NavLink>
        ) : (
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            to="/"
          >
            Home
          </NavLink>
        )}

        <div className={styles.rightGroup} aria-label="Supplemental navigation">
          {rightItems.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
                to={item.to}
                onFocus={() => prefetchRoute(item.to)}
                onMouseEnter={() => prefetchRoute(item.to)}
                onTouchStart={() => prefetchRoute(item.to)}
              >
                {item.label}
              </NavLink>
            ) : (
              <span className={styles.link} aria-disabled="true" key={item.label}>
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
