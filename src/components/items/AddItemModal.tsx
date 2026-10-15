import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '@/data/categories';
import { useRack } from '@/store/RackStore';
import type { CategoryId } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PhotoDropzone } from './PhotoDropzone';
import { GarmentArt } from './GarmentArt';
import form from '@/styles/forms.module.css';
import styles from './AddItemModal.module.css';

const SWATCHES = ['#1C1C22', '#F4F1EA', '#9AA3AE', '#6C8DB5', '#2D3A2E', '#A8673A', '#FF5A36', '#FFC145', '#F15BB5', '#7C5CFF'];

export function AddItemModal({ onClose }: { onClose: () => void }) {
  const { addItem } = useRack();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState<string>();
  const [category, setCategory] = useState<CategoryId>();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState(SWATCHES[0]!);
  const [styleText, setStyleText] = useState('');

  const canSubmit = Boolean(category && name.trim());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!category || !name.trim()) return;
    addItem({
      name: name.trim(),
      brand: brand.trim() || undefined,
      category,
      color,
      imageUrl,
      styles: styleText
        .split(/[,\s#]+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    });
    onClose();
    navigate('/profile');
  };

  return (
    <Modal title="Add to your rack" onClose={onClose} width={760}>
      <form className={styles.layout} onSubmit={handleSubmit}>
        <div className={styles.photoCol}>
          <PhotoDropzone value={imageUrl} onChange={setImageUrl}>
            {category && <GarmentArt category={category} color={color} />}
          </PhotoDropzone>
          {!imageUrl && (
            <div className={form.field}>
              <span className={form.label}>
                Main color <span className={form.hint}>· used for the preview until you add a photo</span>
              </span>
              <div className={styles.swatches}>
                {SWATCHES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.swatch} ${s === color ? styles.swatchActive : ''}`}
                    style={{ background: s }}
                    onClick={() => setColor(s)}
                    aria-label={`Color ${s}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={form.form}>
          <fieldset className={styles.fieldset}>
            <legend className={form.label}>Category</legend>
            <div className={styles.categories}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.category} ${category === c.id ? styles.categoryActive : ''}`}
                  onClick={() => setCategory(c.id)}
                  aria-pressed={category === c.id}
                >
                  <span className={styles.emoji}>{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className={form.field}>
            <span className={form.label}>Name</span>
            <input className={form.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Washed Denim Jacket" />
          </label>

          <div className={form.row}>
            <label className={form.field}>
              <span className={form.label}>
                Brand <span className={form.hint}>· optional</span>
              </span>
              <input className={form.input} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Levi's" />
            </label>
            <label className={form.field}>
              <span className={form.label}>
                Style tags <span className={form.hint}>· optional</span>
              </span>
              <input className={form.input} value={styleText} onChange={(e) => setStyleText(e.target.value)} placeholder="vintage, y2k" />
            </label>
          </div>

          <div className={form.actions}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" icon="plus" disabled={!canSubmit}>
              Add to rack
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
