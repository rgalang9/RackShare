import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { AddItemModal } from '@/components/items/AddItemModal';
import { ItemDetailModal } from '@/components/items/ItemDetailModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { TryOnModal } from '@/components/tryon/TryOnModal';
import { UpgradeModal } from '@/components/tryon/UpgradeModal';
import { MyPhotoModal } from '@/components/tryon/MyPhoto';

/** App-wide overlays, openable from anywhere (sidebar, profile, cards…). */
interface UIStore {
  openAddItem: () => void;
  openItem: (itemId: string) => void;
  openEditProfile: () => void;
  /** Pro only — callers should check `profile.is_pro` and open the upgrade modal otherwise. */
  openTryOn: (itemId: string) => void;
  openUpgrade: () => void;
  openMyPhoto: () => void;
}

const UIContext = createContext<UIStore | null>(null);

type Overlay =
  | { kind: 'addItem' }
  | { kind: 'item'; itemId: string }
  | { kind: 'editProfile' }
  | { kind: 'tryOn'; itemId: string }
  | { kind: 'upgrade' }
  | { kind: 'myPhoto' }
  | null;

export function UIProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const close = () => setOverlay(null);

  const value = useMemo<UIStore>(
    () => ({
      openAddItem: () => setOverlay({ kind: 'addItem' }),
      openItem: (itemId) => setOverlay({ kind: 'item', itemId }),
      openEditProfile: () => setOverlay({ kind: 'editProfile' }),
      openTryOn: (itemId) => setOverlay({ kind: 'tryOn', itemId }),
      openUpgrade: () => setOverlay({ kind: 'upgrade' }),
      openMyPhoto: () => setOverlay({ kind: 'myPhoto' }),
    }),
    [],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      {overlay?.kind === 'addItem' && <AddItemModal onClose={close} />}
      {overlay?.kind === 'item' && <ItemDetailModal itemId={overlay.itemId} onClose={close} />}
      {overlay?.kind === 'editProfile' && <EditProfileModal onClose={close} />}
      {overlay?.kind === 'tryOn' && <TryOnModal itemId={overlay.itemId} onClose={close} />}
      {overlay?.kind === 'upgrade' && <UpgradeModal onClose={close} />}
      {overlay?.kind === 'myPhoto' && <MyPhotoModal onClose={close} />}
    </UIContext.Provider>
  );
}

export function useUI(): UIStore {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
