import type { Item } from '@/types';
import { GarmentArt } from './GarmentArt';

export function ItemImage({ item }: { item: Pick<Item, 'imageUrl' | 'category' | 'color' | 'name'> }) {
  return item.imageUrl ? (
    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    <GarmentArt category={item.category} color={item.color} />
  );
}
