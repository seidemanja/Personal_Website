import { NavLink } from 'react-router-dom';
import styles from './Navigation.module.css';

const rightItems = ['Resume', 'Selected Projects'];

function Navigation() {
  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      <div className={styles.inner}>
        <NavLink
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
          to="/"
        >
          Home
        </NavLink>

        <div className={styles.rightGroup} aria-label="Supplemental navigation">
          {rightItems.map((item) => (
            <span className={styles.link} aria-disabled="true" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
