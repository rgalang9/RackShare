import { useMemo, useState } from 'react';
import { useRack } from '@/store/RackStore';
import { RackPreviewCard } from '@/components/profile/RackPreviewCard';
import { ItemGrid } from '@/components/items/ItemGrid';
import { CategoryFilter, filterByCategory, type CategoryFilterValue } from '@/components/items/CategoryFilter';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from './Page.module.css';

type FeedTab = 'discover' | 'following';

export function FeedPage() {
  const { users, items, currentUser, following } = useRack();
  const [tab, setTab] = useState<FeedTab>('discover');
  const [category, setCategory] = useState<CategoryFilterValue>('all');

  const others = users.filter((u) => u.id !== currentUser.id);
  const racks = tab === 'following' ? others.filter((u) => following.includes(u.id)) : others;

  const freshItems = useMemo(() => {
    const ownerIds = new Set(racks.map((u) => u.id));
    return items
      .filter((i) => ownerIds.has(i.ownerId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [items, racks]);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1>
          Your closet is your <em>presence.</em>
        </h1>
        <p>Peek into other racks, find your next favorite piece, and show off yours.</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Racks to explore</h2>
          <div className={styles.tabs} role="tablist">
            {(['discover', 'following'] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} className={styles.tab} onClick={() => setTab(t)}>
                {t === 'discover' ? 'Discover' : 'Following'}
              </button>
            ))}
          </div>
        </div>
        {racks.length ? (
          <div className={styles.rackGrid}>
            {racks.map((u) => (
              <RackPreviewCard key={u.id} user={u} />
            ))}
          </div>
        ) : (
          <EmptyState icon="profile" title="You're not following anyone yet">
            Follow a few racks from Discover and they'll show up here.
          </EmptyState>
        )}
      </section>

      {freshItems.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Fresh on the racks</h2>
          </div>
          <CategoryFilter value={category} onChange={setCategory} />
          <ItemGrid items={filterByCategory(freshItems, category)} showOwner />
        </section>
      )}
    </div>
  );
}
