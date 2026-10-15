import { useUI } from '@/store/UIStore';
import { Icon } from '@/components/ui/Icon';
import styles from './AddItemTile.module.css';

export function AddItemTile() {
  const { openAddItem } = useUI();
  return (
    <button className={styles.tile} onClick={openAddItem}>
      <span className={styles.icon}>
        <Icon name="plus" size={26} />
      </span>
      Add a piece
    </button>
  );
}
