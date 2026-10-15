import { useRef, useState, type FormEvent } from 'react';
import { useRack } from '@/store/RackStore';
import { fileToResizedDataUrl } from '@/utils/image';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import form from '@/styles/forms.module.css';
import styles from './EditProfileModal.module.css';

export function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { currentUser, updateProfile } = useRack();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState({
    name: currentUser.name,
    handle: currentUser.handle,
    title: currentUser.title,
    bio: currentUser.bio,
    avatarUrl: currentUser.avatarUrl,
  });

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...draft,
      name: draft.name.trim() || currentUser.name,
      handle: draft.handle.trim().replace(/^@/, '').toLowerCase() || currentUser.handle,
    });
    onClose();
  };

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form className={form.form} onSubmit={handleSubmit}>
        <div className={styles.avatarRow}>
          <Avatar user={{ ...currentUser, ...draft }} size={72} />
          <div className={styles.avatarActions}>
            <Button type="button" variant="secondary" size="sm" icon="upload" onClick={() => fileRef.current?.click()}>
              Upload photo
            </Button>
            {draft.avatarUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={() => set('avatarUrl', undefined)}>
                Remove
              </Button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) set('avatarUrl', await fileToResizedDataUrl(file, 320));
            }}
          />
        </div>

        <div className={form.row}>
          <label className={form.field}>
            <span className={form.label}>Name</span>
            <input className={form.input} value={draft.name} onChange={(e) => set('name', e.target.value)} />
          </label>
          <label className={form.field}>
            <span className={form.label}>Handle</span>
            <input className={form.input} value={draft.handle} onChange={(e) => set('handle', e.target.value)} />
          </label>
        </div>
        <label className={form.field}>
          <span className={form.label}>Title</span>
          <input
            className={form.input}
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Vintage hunter · Brooklyn"
          />
        </label>
        <label className={form.field}>
          <span className={form.label}>Bio</span>
          <textarea className={form.input} value={draft.bio} onChange={(e) => set('bio', e.target.value)} />
        </label>

        <div className={form.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
