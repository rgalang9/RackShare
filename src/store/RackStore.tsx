import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { CURRENT_USER_ID, MOCK_ITEMS, MOCK_USERS } from '@/data/mockData';
import type { Item, User } from '@/types';

/**
 * Client-side store backed by mock data + localStorage.
 * The action surface (addItem, removeItem, …) is what a real API layer
 * would implement later, so pages never touch storage directly.
 */

interface State {
  users: User[];
  items: Item[];
  following: string[];
}

type Action =
  | { type: 'addItem'; item: Item }
  | { type: 'removeItem'; id: string }
  | { type: 'updateProfile'; patch: Partial<User> }
  | { type: 'toggleFollow'; userId: string };

const STORAGE_KEY = 'rackshare:v1';

const initialState: State = {
  users: MOCK_USERS,
  items: MOCK_ITEMS,
  following: ['u-maya', 'u-dee'],
};

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...(JSON.parse(raw) as State) } : initialState;
  } catch {
    return initialState;
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addItem':
      return { ...state, items: [action.item, ...state.items] };
    case 'removeItem':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'updateProfile':
      return {
        ...state,
        users: state.users.map((u) => (u.id === CURRENT_USER_ID ? { ...u, ...action.patch } : u)),
      };
    case 'toggleFollow': {
      const isFollowing = state.following.includes(action.userId);
      const delta = isFollowing ? -1 : 1;
      return {
        ...state,
        following: isFollowing
          ? state.following.filter((id) => id !== action.userId)
          : [...state.following, action.userId],
        users: state.users.map((u) => {
          if (u.id === action.userId) return { ...u, followers: u.followers + delta };
          if (u.id === CURRENT_USER_ID) return { ...u, following: u.following + delta };
          return u;
        }),
      };
    }
  }
}

interface RackStore extends State {
  currentUser: User;
  getUser: (idOrHandle: string) => User | undefined;
  itemsFor: (userId: string) => Item[];
  isFollowing: (userId: string) => boolean;
  addItem: (input: Omit<Item, 'id' | 'ownerId' | 'createdAt'>) => Item;
  removeItem: (id: string) => void;
  updateProfile: (patch: Partial<Pick<User, 'name' | 'title' | 'bio' | 'avatarUrl' | 'handle'>>) => void;
  toggleFollow: (userId: string) => void;
}

const RackContext = createContext<RackStore | null>(null);

export function RackProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — the session still works in memory.
    }
  }, [state]);

  const addItem = useCallback<RackStore['addItem']>((input) => {
    const item: Item = {
      ...input,
      id: `i-${crypto.randomUUID()}`,
      ownerId: CURRENT_USER_ID,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'addItem', item });
    return item;
  }, []);

  const value = useMemo<RackStore>(() => {
    const currentUser = state.users.find((u) => u.id === CURRENT_USER_ID)!;
    return {
      ...state,
      currentUser,
      getUser: (key) => state.users.find((u) => u.id === key || u.handle === key),
      itemsFor: (userId) => state.items.filter((i) => i.ownerId === userId),
      isFollowing: (userId) => state.following.includes(userId),
      addItem,
      removeItem: (id) => dispatch({ type: 'removeItem', id }),
      updateProfile: (patch) => dispatch({ type: 'updateProfile', patch }),
      toggleFollow: (userId) => dispatch({ type: 'toggleFollow', userId }),
    };
  }, [state, addItem]);

  return <RackContext.Provider value={value}>{children}</RackContext.Provider>;
}

export function useRack(): RackStore {
  const ctx = useContext(RackContext);
  if (!ctx) throw new Error('useRack must be used inside <RackProvider>');
  return ctx;
}
