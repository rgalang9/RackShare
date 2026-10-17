/**
 * One-click login for local development. Signs in to a real test account, so RLS,
 * storage and Edge Functions behave exactly as they do for real users.
 *
 * Three independent guards keep this out of production:
 *  1. `import.meta.env.DEV` is replaced with `false` in `vite build`, so this whole branch
 *     (and the credentials) is stripped from the production bundle.
 *  2. Credentials live in `.env.development.local`, which Vite only loads for `vite` dev,
 *     never for `vite build`, and which `*.local` keeps out of git.
 *  3. Even in dev, it only turns on when the page is served from this machine.
 */
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

export const devLogin: { email: string; password: string } | null =
  import.meta.env.DEV &&
  LOCAL_HOSTS.includes(window.location.hostname) &&
  import.meta.env.VITE_DEV_LOGIN_EMAIL &&
  import.meta.env.VITE_DEV_LOGIN_PASSWORD
    ? { email: import.meta.env.VITE_DEV_LOGIN_EMAIL, password: import.meta.env.VITE_DEV_LOGIN_PASSWORD }
    : null;
