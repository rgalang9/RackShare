import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { AddItemModal } from '@/components/items/AddItemModal';
import { ItemDetailModal } from '@/components/items/ItemDetailModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';

/** App-wide overlays, openable from anywhere (sidebar, profile, cards…). */
interface UIStore {
  openAddItem: () => void;
  openItem: (itemId: string) => void;
  openEditProfile: () => void;
}

const UIContext = createContext<UIStore | null>(null);

type Overlay = { kind: 'addItem' } | { kind: 'item'; itemId: string } | { kind: 'editProfile' } | null;

export function UIProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const close = () => setOverlay(null);

  const value = useMemo<UIStore>(
    () => ({
      openAddItem: () => setOverlay({ kind: 'addItem' }),
      openItem: (itemId) => setOverlay({ kind: 'item', itemId }),
      openEditProfile: () => setOverlay({ kind: 'editProfile' }),
    }),
    [],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      {overlay?.kind === 'addItem' && <AddItemModal onClose={close} />}
      {overlay?.kind === 'item' && <ItemDetailModal itemId={overlay.itemId} onClose={close} />}
      {overlay?.kind === 'editProfile' && <EditProfileModal onClose={close} />}
    </UIContext.Provider>
  );
}

export function useUI(): UIStore {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
