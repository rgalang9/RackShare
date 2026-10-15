import type { User } from '@/types';
import { initials } from '@/utils/format';
import styles from './Avatar.module.css';

interface AvatarProps {
  user: Pick<User, 'name' | 'avatarUrl' | 'accent'>;
  size?: number;
  ring?: boolean;
}

export function Avatar({ user, size = 40, ring }: AvatarProps) {
  return (
    <span
      className={`${styles.avatar} ${ring ? styles.ring : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.38, background: user.accent }}
    >
      {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user.name)}
    </span>
  );
}
