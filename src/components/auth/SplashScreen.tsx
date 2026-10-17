import styles from './SplashScreen.module.css';

export function SplashScreen() {
  return (
    <div className={styles.splash} role="status" aria-label="Loading">
      <span className={styles.mark}>
        <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
          <path d="M7 11h18M10 11v13M22 11v13M16 6v5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </svg>
      </span>
    </div>
  );
}
