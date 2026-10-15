import type { CategoryId } from '@/types';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: 'tops', label: 'Tops', emoji: '👕' },
  { id: 'outerwear', label: 'Hoodies & Outerwear', emoji: '🧥' },
  { id: 'bottoms', label: 'Pants & Bottoms', emoji: '👖' },
  { id: 'shoes', label: 'Shoes', emoji: '👟' },
  { id: 'headwear', label: 'Headwear', emoji: '🧢' },
  { id: 'accessories', label: 'Glasses & Accessories', emoji: '🕶️' },
];

export const categoryById = (id: CategoryId): Category =>
  CATEGORIES.find((c) => c.id === id)!;
