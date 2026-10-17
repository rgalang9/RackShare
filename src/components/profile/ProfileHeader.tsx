import { useRack } from '@/store/RackStore';
import { useUI } from '@/store/UIStore';
import type { User } from '@/types';
import { formatCount } from '@/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Chip';
import styles from './ProfileHeader.module.css';

export function ProfileHeader({ user, itemCount }: { user: User; itemCount: number }) {
  const { currentUser, isFollowing, toggleFollow } = useRack();
  const { openEditProfile, openAddItem, openMyPhoto } = useUI();
  const isMe = user.id === currentUser.id;
  const following = isFollowing(user.id);

  return (
    <section className={styles.header}>
      <div
        className={styles.banner}
        style={{
          background: `radial-gradient(circle at 15% 30%, color-mix(in srgb, ${user.accent} 45%, #fff), transparent 55%),
                       radial-gradient(circle at 85% 70%, color-mix(in srgb, ${user.accent} 25%, #fff), transparent 50%),
                       color-mix(in srgb, ${user.accent} 10%, #fff)`,
        }}
      />
      <div className={styles.body}>
        <div className={styles.avatar}>
          <Avatar user={user} size={112} ring />
        </div>

        <div className={styles.identity}>
          <h1>{user.name}</h1>
          <p className={styles.handle}>@{user.handle}</p>
          <p className={styles.title}>{user.title}</p>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
          {user.styles.length > 0 && (
            <div className={styles.tags}>
              {user.styles.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          )}
        </div>

        <div className={styles.side}>
          <dl className={styles.stats}>
            <div>
              <dt>Pieces</dt>
              <dd>{itemCount}</dd>
            </div>
            <div>
              <dt>Followers</dt>
              <dd>{formatCount(user.followers)}</dd>
            </div>
            <div>
              <dt>Following</dt>
              <dd>{formatCount(user.following)}</dd>
            </div>
          </dl>
          <div className={styles.actions}>
            {isMe ? (
              <>
                <Button variant="secondary" icon="edit" onClick={openEditProfile}>
                  Edit profile
                </Button>
                <Button variant="secondary" icon="profile" onClick={openMyPhoto}>
                  My photo
                </Button>
                <Button icon="plus" onClick={openAddItem}>
                  Add item
                </Button>
              </>
            ) : (
              <>
                <Button variant={following ? 'secondary' : 'primary'} onClick={() => toggleFollow(user.id)}>
                  {following ? 'Following' : 'Follow'}
                </Button>
                <Button variant="secondary" icon="messages" disabled title="DMs are coming soon">
                  Message
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
