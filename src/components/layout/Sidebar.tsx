import { NavLink } from 'react-router-dom';
import { useAuth } from '@/store/AuthStore';
import { useUI } from '@/store/UIStore';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Logo } from './Logo';
import { NAV_ITEMS } from './navItems';
import styles from './Sidebar.module.css';

/**
 * Desktop: fixed left sidebar. Under 768px the same component restyles
 * into an Instagram-style bottom bar with the Add button in the middle.
 */
export function Sidebar() {
  const { session, profile } = useAuth();
  const { openAddItem } = useUI();
  const [feed, ...rest] = NAV_ITEMS;

  const link = (item: (typeof NAV_ITEMS)[number]) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
    >
      <Icon name={item.icon} size={22} />
      <span className={styles.label}>{item.label}</span>
    </NavLink>
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Logo />
      </div>

      <nav className={styles.nav} aria-label="Main">
        {link(feed!)}
        <button className={styles.add} onClick={openAddItem}>
          <span className={styles.addIcon}>
            <Icon name="plus" size={22} />
          </span>
          <span className={styles.label}>Add Item</span>
        </button>
        {rest.map(link)}
      </nav>

      <div className={styles.account}>
        <NavLink to="/profile" className={styles.me}>
          <Avatar
            user={{ name: profile?.username ?? '?', avatarUrl: profile?.avatar_url ?? undefined, accent: 'var(--accent)' }}
            size={36}
          />
          <span>
            <strong>{profile ? `@${profile.username}` : '…'}</strong>
            <small>{session?.user.email}</small>
          </span>
        </NavLink>
        <LogoutButton className={styles.logout} />
      </div>
    </aside>
  );
}
