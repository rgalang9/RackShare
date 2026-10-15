import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRack } from '@/store/RackStore';
import { useUI } from '@/store/UIStore';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ItemGrid } from '@/components/items/ItemGrid';
import { CategoryFilter, filterByCategory, type CategoryFilterValue } from '@/components/items/CategoryFilter';
import { AddItemTile } from '@/components/items/AddItemTile';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { NotFoundPage } from './NotFoundPage';
import styles from './Page.module.css';

type ProfileTab = 'rack' | 'looks';

/** Serves both /profile (you) and /u/:handle (anyone). */
export function ProfilePage() {
  const { handle } = useParams();
  const { currentUser, getUser, itemsFor } = useRack();
  const { openAddItem } = useUI();
  const [category, setCategory] = useState<CategoryFilterValue>('all');
  const [tab, setTab] = useState<ProfileTab>('rack');

  const user = handle ? getUser(handle) : currentUser;
  if (!user) return <NotFoundPage />;

  const isMe = user.id === currentUser.id;
  const items = itemsFor(user.id);
  const visible = filterByCategory(items, category);

  return (
    <div className={styles.page} key={user.id}>
      <ProfileHeader user={user} itemCount={items.length} />

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.tabs} role="tablist">
            <button role="tab" aria-selected={tab === 'rack'} className={styles.tab} onClick={() => setTab('rack')}>
              Rack
            </button>
            <button role="tab" aria-selected={tab === 'looks'} className={styles.tab} disabled title="Coming soon">
              Full looks <span className={styles.soonBadge}>Soon</span>
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState icon="hanger" title={isMe ? 'Your rack is empty' : 'Nothing on this rack yet'}>
            {isMe && (
              <>
                <p>Add your first piece — a favorite tee, those shoes you always wear.</p>
                <Button icon="plus" onClick={openAddItem}>
                  Add item
                </Button>
              </>
            )}
          </EmptyState>
        ) : (
          <>
            <CategoryFilter value={category} onChange={setCategory} items={items} />
            <ItemGrid items={visible} leading={isMe && category === 'all' ? <AddItemTile /> : undefined} />
          </>
        )}
      </section>
    </div>
  );
}
