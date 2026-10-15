import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

export function Logo() {
  return (
    <Link to="/" className={styles.logo}>
      <span className={styles.mark} aria-hidden>
        <svg viewBox="0 0 32 32" width="22" height="22">
          <path d="M7 11h18M10 11v13M22 11v13M16 6v5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </svg>
      </span>
      <span className={styles.word}>
        rack<span>share</span>
      </span>
    </Link>
  );
}
