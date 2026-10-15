import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Logo } from './Logo';
import styles from './TopBar.module.css';

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');

  // Keep the input in sync when navigating to/away from search.
  useEffect(() => {
    setQuery(location.pathname === '/search' ? params.get('q') ?? '' : '');
  }, [location.pathname, params]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className={styles.bar}>
      <div className={styles.mobileLogo}>
        <Logo />
      </div>
      <form className={styles.search} onSubmit={handleSubmit} role="search">
        <Icon name="search" size={18} className={styles.searchIcon} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, pieces, styles…"
          aria-label="Search"
        />
      </form>
    </header>
  );
}
