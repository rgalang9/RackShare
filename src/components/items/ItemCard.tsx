import { Link } from 'react-router-dom';
import { useRack } from '@/store/RackStore';
import { useUI } from '@/store/UIStore';
import type { Item } from '@/types';
import { categoryById } from '@/data/categories';
import { Avatar } from '@/components/ui/Avatar';
import { ItemImage } from './ItemImage';
import styles from './ItemCard.module.css';

interface ItemCardProps {
  item: Item;
  showOwner?: boolean;
}

export function ItemCard({ item, showOwner }: ItemCardProps) {
  const { getUser } = useRack();
  const { openItem } = useUI();
  const owner = showOwner ? getUser(item.ownerId) : undefined;

  return (
    <article className={styles.card}>
      <button className={styles.media} onClick={() => openItem(item.id)} aria-label={`View ${item.name}`}>
        <ItemImage item={item} />
        <span className={styles.badge}>{categoryById(item.category).emoji}</span>
      </button>
      <div className={styles.meta}>
        <p className={styles.name}>{item.name}</p>
        {item.brand && <p className={styles.brand}>{item.brand}</p>}
        {owner && (
          <Link to={`/u/${owner.handle}`} className={styles.owner}>
            <Avatar user={owner} size={20} />@{owner.handle}
          </Link>
        )}
      </div>
    </article>
  );
}
