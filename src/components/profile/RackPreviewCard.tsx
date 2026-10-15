import { Link } from 'react-router-dom';
import { useRack } from '@/store/RackStore';
import type { User } from '@/types';
import { formatCount } from '@/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { ItemImage } from '@/components/items/ItemImage';
import styles from './RackPreviewCard.module.css';

/** A peek into someone's closet: four pieces + who they are. */
export function RackPreviewCard({ user }: { user: User }) {
  const { itemsFor, isFollowing, toggleFollow } = useRack();
  const items = itemsFor(user.id);
  const preview = items.slice(0, 4);
  const following = isFollowing(user.id);

  return (
    <article className={styles.card}>
      <Link to={`/u/${user.handle}`} className={styles.mosaic} aria-label={`Open ${user.name}'s rack`}>
        {preview.map((item) => (
          <div key={item.id} className={styles.tile}>
            <ItemImage item={item} />
          </div>
        ))}
        <span className={styles.count}>{items.length} pieces</span>
      </Link>
      <div className={styles.footer}>
        <Link to={`/u/${user.handle}`} className={styles.who}>
          <Avatar user={user} size={40} />
          <span>
            <strong>{user.name}</strong>
            <small>
              {user.title} · {formatCount(user.followers)} followers
            </small>
          </span>
        </Link>
        <Button size="sm" variant={following ? 'secondary' : 'primary'} onClick={() => toggleFollow(user.id)}>
          {following ? 'Following' : 'Follow'}
        </Button>
      </div>
    </article>
  );
}
