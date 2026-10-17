import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthError, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isUsernameTaken, loadOrCreateProfile, type Profile } from '@/lib/profiles';

interface AuthStore {
  session: Session | null;
  profile: Profile | null;
  /** True until the stored session has been checked on first load. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Resolves with `needsConfirmation: true` when Supabase requires email confirmation. */
  signUp: (email: string, password: string, username: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthStore | null>(null);

/** Turns Supabase's error strings into something friendlier to show in the form. */
function friendly(error: AuthError): Error {
  const msg = error.message.toLowerCase();
  if (msg.includes('invalid login credentials')) return new Error('Wrong email or password.');
  if (msg.includes('email not confirmed')) return new Error('Please confirm your email first — check your inbox.');
  if (msg.includes('already registered')) return new Error('An account with this email already exists. Try logging in.');
  return new Error(error.message);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // onAuthStateChange fires INITIAL_SESSION on subscribe, so no separate getSession() is needed.
  // Don't await other Supabase calls inside this callback (it can deadlock) — profile loading
  // happens in the effect below instead.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const user = session?.user;
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    loadOrCreateProfile(user)
      .then((p) => !cancelled && setProfile(p))
      .catch((err) => console.error('Failed to load profile', err));
    return () => {
      cancelled = true;
    };
    // Only refetch when the signed-in user changes, not on token refresh.
  }, [user?.id]);

  const value = useMemo<AuthStore>(
    () => ({
      session,
      profile,
      loading,

      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw friendly(error);
      },

      async signUp(email, password, username) {
        if (await isUsernameTaken(username)) throw new Error('That username is taken — try another.');

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username }, emailRedirectTo: window.location.origin },
        });
        if (error) throw friendly(error);
        // With email confirmation on, Supabase hides "already registered" and returns a user with no identities.
        if (data.user && data.user.identities?.length === 0) {
          throw new Error('An account with this email already exists. Try logging in.');
        }
        return { needsConfirmation: !data.session };
      },

      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw friendly(error);
      },
    }),
    [session, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
