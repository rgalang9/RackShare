import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, type Location } from 'react-router-dom';
import { useAuth } from '@/store/AuthStore';
import { USERNAME_PATTERN } from '@/lib/profiles';
import { devLogin } from '@/lib/devLogin';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { GarmentArt } from '@/components/items/GarmentArt';
import { SplashScreen } from '@/components/auth/SplashScreen';
import type { CategoryId } from '@/types';
import form from '@/styles/forms.module.css';
import styles from './LoginPage.module.css';

type Mode = 'login' | 'signup';

const COLLAGE: [CategoryId, string][] = [
  ['outerwear', '#7C5CFF'],
  ['shoes', '#FF5A36'],
  ['tops', '#FFC145'],
  ['headwear', '#1FB57A'],
  ['bottoms', '#6C8DB5'],
  ['accessories', '#F15BB5'],
];

export function LoginPage() {
  const { session, loading, signIn, signUp } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from;

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [confirmSentTo, setConfirmSentTo] = useState<string>();

  if (loading) return <SplashScreen />;
  if (session) return <Navigate to={from ? `${from.pathname}${from.search}` : '/'} replace />;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(undefined);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const cleanUsername = username.trim().toLowerCase();
    if (mode === 'signup' && !USERNAME_PATTERN.test(cleanUsername)) {
      setError('Usernames are 3–30 characters: lowercase letters, numbers, dots and underscores.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        const { needsConfirmation } = await signUp(email.trim(), password, cleanUsername);
        if (needsConfirmation) setConfirmSentTo(email.trim());
      }
      // On success the session updates and the <Navigate> above takes over.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevLogin = async () => {
    if (!devLogin) return;
    setError(undefined);
    setSubmitting(true);
    try {
      await signIn(devLogin.email, devLogin.password);
    } catch (err) {
      setError(err instanceof Error ? `Dev login: ${err.message}` : 'Dev login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <aside className={styles.brand}>
        <Logo />
        <div className={styles.pitch}>
          <h1>
            Your closet is your <em>presence.</em>
          </h1>
          <p>Build your rack, peek into everyone else's, and find your next favorite piece.</p>
        </div>
        <div className={styles.collage} aria-hidden>
          {COLLAGE.map(([category, color], i) => (
            <div key={category} className={styles.tile} style={{ ['--i' as string]: i }}>
              <GarmentArt category={category} color={color} />
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.panel}>
        <div className={styles.card}>
          {confirmSentTo ? (
            <div className={styles.confirm}>
              <span className={styles.confirmIcon}>
                <Icon name="messages" size={26} />
              </span>
              <h2>Check your inbox</h2>
              <p>
                We sent a confirmation link to <strong>{confirmSentTo}</strong>. Click it to activate your account, then
                log in.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmSentTo(undefined);
                  switchMode('login');
                }}
              >
                Back to log in
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.tabs} role="tablist">
                {(['login', 'signup'] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    type="button"
                    aria-selected={mode === m}
                    className={styles.tab}
                    onClick={() => switchMode(m)}
                  >
                    {m === 'login' ? 'Log in' : 'Sign up'}
                  </button>
                ))}
              </div>

              <header className={styles.heading}>
                <h2>{mode === 'login' ? 'Welcome back 👋' : 'Start your rack'}</h2>
                <p>{mode === 'login' ? 'Log in to see what everyone’s wearing.' : 'It takes about ten seconds.'}</p>
              </header>

              <form className={form.form} onSubmit={handleSubmit} noValidate>
                {mode === 'signup' && (
                  <label className={form.field}>
                    <span className={form.label}>Username</span>
                    <div className={styles.handleInput}>
                      <span aria-hidden>@</span>
                      <input
                        className={form.input}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your.handle"
                        autoComplete="username"
                        autoCapitalize="none"
                        required
                      />
                    </div>
                  </label>
                )}
                <label className={form.field}>
                  <span className={form.label}>Email</span>
                  <input
                    className={form.input}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className={form.field}>
                  <span className={form.label}>
                    Password {mode === 'signup' && <span className={form.hint}>· at least 6 characters</span>}
                  </span>
                  <input
                    className={form.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    minLength={6}
                    required
                  />
                </label>

                {error && (
                  <p className={styles.error} role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" block disabled={submitting || !email || !password}>
                  {submitting ? 'One sec…' : mode === 'login' ? 'Log in' : 'Create account'}
                </Button>
              </form>

              {devLogin && mode === 'login' && (
                <button type="button" className={styles.devLogin} onClick={handleDevLogin} disabled={submitting}>
                  <span>DEV</span> Log in as {devLogin.email}
                </button>
              )}

              <p className={styles.switch}>
                {mode === 'login' ? 'New to Rack Share?' : 'Already have an account?'}{' '}
                <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
                  {mode === 'login' ? 'Create an account' : 'Log in'}
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
