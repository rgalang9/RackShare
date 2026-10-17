import { useState } from 'react';
import { useAuth } from '@/store/AuthStore';
import { Icon } from '@/components/ui/Icon';

interface LogoutButtonProps {
  className?: string;
  showLabel?: boolean;
}

/** Signing out clears the session; <RequireAuth> then redirects to /login. */
export function LogoutButton({ className, showLabel }: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed', err);
      setBusy(false);
    }
  };

  return (
    <button type="button" className={className} onClick={handleClick} disabled={busy} aria-label="Log out" title="Log out">
      <Icon name="logout" size={20} />
      {showLabel && <span>Log out</span>}
    </button>
  );
}
