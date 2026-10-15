import type { ReactNode } from 'react';
import type { Item } from '@/types';
import { ItemCard } from './ItemCard';
import styles from './ItemGrid.module.css';

interface ItemGridProps {
  items: Item[];
  showOwner?: boolean;
  /** Optional tile rendered before the items (e.g. "Add item" on your own rack). */
  leading?: ReactNode;
}

export function ItemGrid({ items, showOwner, leading }: ItemGridProps) {
  return (
    <div className={styles.grid}>
      {leading}
      {items.map((item) => (
        <ItemCard key={item.id} item={item} showOwner={showOwner} />
      ))}
    </div>
  );
}
