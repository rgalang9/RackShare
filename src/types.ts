export type CategoryId =
  | 'tops'
  | 'outerwear'
  | 'bottoms'
  | 'shoes'
  | 'headwear'
  | 'accessories';

export interface User {
  id: string;
  handle: string;
  name: string;
  /** Short headline shown under the name, e.g. "Vintage hunter · Brooklyn". */
  title: string;
  bio: string;
  /** Uploaded image (data URL / remote URL). Falls back to initials. */
  avatarUrl?: string;
  /** Used for the initials avatar and profile banner when no photo is set. */
  accent: string;
  styles: string[];
  followers: number;
  following: number;
}

export interface Item {
  id: string;
  ownerId: string;
  name: string;
  brand?: string;
  category: CategoryId;
  /** Real photo. When absent, an illustrated placeholder is drawn from `color`. */
  imageUrl?: string;
  color: string;
  styles: string[];
  createdAt: string;
}
