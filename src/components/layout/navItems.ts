import type { IconName } from '@/components/ui/Icon';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

/** Shared by the desktop sidebar and the mobile bottom nav. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Feed', icon: 'feed' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
  { to: '/messages', label: 'Messages', icon: 'messages' },
];
