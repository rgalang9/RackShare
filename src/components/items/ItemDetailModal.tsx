import { Link } from 'react-router-dom';
import { categoryById } from '@/data/categories';
import { useRack } from '@/store/RackStore';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import { timeAgo } from '@/utils/format';
import { ItemImage } from './ItemImage';
import styles from './ItemDetailModal.module.css';

export function ItemDetailModal({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const { items, getUser, currentUser, removeItem } = useRack();
  const item = items.find((i) => i.id === itemId);
  if (!item) return null;

  const owner = getUser(item.ownerId)!;
  const isMine = owner.id === currentUser.id;
  const category = categoryById(item.category);

  return (
    <Modal title={item.name} onClose={onClose} width={760}>
      <div className={styles.layout}>
        <div className={styles.media}>
          <ItemImage item={item} />
        </div>
        <div className={styles.info}>
          <Link to={`/u/${owner.handle}`} onClick={onClose} className={styles.owner}>
            <Avatar user={owner} size={36} />
            <span>
              <strong>{owner.name}</strong>
              <small>@{owner.handle} · added {timeAgo(item.createdAt)} ago</small>
            </span>
          </Link>

          <dl className={styles.details}>
            <dt>Category</dt>
            <dd>
              {category.emoji} {category.label}
            </dd>
            {item.brand && (
              <>
                <dt>Brand</dt>
                <dd>{item.brand}</dd>
              </>
            )}
          </dl>

          {item.styles.length > 0 && (
            <div className={styles.tags}>
              {item.styles.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            {isMine ? (
              <Button
                variant="secondary"
                icon="trash"
                onClick={() => {
                  removeItem(item.id);
                  onClose();
                }}
              >
                Remove from rack
              </Button>
            ) : (
              <>
                <Button icon="swap" disabled title="Trading is coming soon">
                  Propose trade
                </Button>
                <Button variant="secondary" icon="sparkle" disabled title="Virtual try-on is coming soon">
                  Try on
                </Button>
              </>
            )}
          </div>
          {!isMine && <p className={styles.soon}>Trading &amp; virtual try-on are coming soon.</p>}
        </div>
      </div>
    </Modal>
  );
}
