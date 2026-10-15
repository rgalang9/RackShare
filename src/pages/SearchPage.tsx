import { Link, useSearchParams } from 'react-router-dom';
import { useRack } from '@/store/RackStore';
import { categoryById } from '@/data/categories';
import { Avatar } from '@/components/ui/Avatar';
import { ItemGrid } from '@/components/items/ItemGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from './Page.module.css';
import search from './SearchPage.module.css';

export function SearchPage() {
  const [params] = useSearchParams();
  const { users, items } = useRack();
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const matches = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(q));

  const people = users.filter((u) => matches(u.name, u.handle, u.title, ...u.styles));
  const pieces = items.filter((i) =>
    matches(i.name, i.brand, categoryById(i.category).label, ...i.styles),
  );

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1>
          Results for <em>“{params.get('q')}”</em>
        </h1>
        <p>
          {people.length} people · {pieces.length} pieces
        </p>
      </header>

      {people.length > 0 && (
        <section className={styles.section}>
          <h2 className={search.heading}>People</h2>
          <div className={search.people}>
            {people.map((u) => (
              <Link key={u.id} to={`/u/${u.handle}`} className={search.person}>
                <Avatar user={u} size={48} />
                <span>
                  <strong>{u.name}</strong>
                  <small>@{u.handle}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {pieces.length > 0 && (
        <section className={styles.section}>
          <h2 className={search.heading}>Pieces</h2>
          <ItemGrid items={pieces} showOwner />
        </section>
      )}

      {!people.length && !pieces.length && (
        <EmptyState icon="search" title="No matches">
          Try a brand, a category like “shoes”, or a style like “vintage”.
        </EmptyState>
      )}
    </div>
  );
}
