import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import styles from './RouteErrorPage.module.css';

/**
 * Router errorElement. Used both inside the shell (sidebar stays usable) and
 * as the top-level fallback when the shell itself fails (`fullPage`).
 */
export function RouteErrorPage({ fullPage }: { fullPage?: boolean }) {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  if (import.meta.env.DEV) console.error(error);

  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : undefined;

  return (
    <div className={fullPage ? styles.fullPage : undefined}>
      <EmptyState
        icon="hanger"
        title={isNotFound ? "This rack doesn't exist" : 'Something slipped off the hanger'}
      >
        <p>
          {isNotFound
            ? 'The page you were looking for has moved or never existed.'
            : 'An unexpected error happened while loading this page. Try again, or head back to the feed.'}
        </p>
        {import.meta.env.DEV && detail && <code className={styles.detail}>{detail}</code>}
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try again
          </Button>
          {/* Plain link with reload so a broken shell/router state is fully reset. */}
          <Link to="/" reloadDocument>
            <Button>Back to feed</Button>
          </Link>
        </div>
      </EmptyState>
    </div>
  );
}
