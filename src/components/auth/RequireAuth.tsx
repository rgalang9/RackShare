import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthStore';
import { SplashScreen } from './SplashScreen';

/** Gate for every in-app route: no session → /login (remembering where they were headed). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SplashScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
