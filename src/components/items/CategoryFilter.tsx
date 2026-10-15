import { CATEGORIES } from '@/data/categories';
import type { CategoryId, Item } from '@/types';
import { Chip } from '@/components/ui/Chip';
import styles from './CategoryFilter.module.css';

export type CategoryFilterValue = CategoryId | 'all';

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  /** When provided, shows per-category counts and hides empty categories. */
  items?: Item[];
}

export function CategoryFilter({ value, onChange, items }: CategoryFilterProps) {
  const countFor = (id: CategoryId) => items?.filter((i) => i.category === id).length;
  const visible = items ? CATEGORIES.filter((c) => countFor(c.id)) : CATEGORIES;

  return (
    <div className={styles.row} role="toolbar" aria-label="Filter by category">
      <Chip active={value === 'all'} count={items?.length} onClick={() => onChange('all')}>
        All
      </Chip>
      {visible.map((c) => (
        <Chip key={c.id} active={value === c.id} count={countFor(c.id)} onClick={() => onChange(c.id)}>
          <span aria-hidden>{c.emoji}</span> {c.label}
        </Chip>
      ))}
    </div>
  );
}

export const filterByCategory = (items: Item[], value: CategoryFilterValue) =>
  value === 'all' ? items : items.filter((i) => i.category === value);
