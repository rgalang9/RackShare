import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/store/AuthStore';
import { deleteMyPhoto, getMyPhotoUrl, uploadMyPhoto } from '@/lib/tryOn';
import { fileToResizedBlob } from '@/utils/image';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import styles from './MyPhoto.module.css';

/** The signed-in user's private full-body photo. `url` is undefined while loading, null when there's none. */
export function useMyPhoto() {
  const userId = useAuth().session?.user.id;
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getMyPhotoUrl(userId).then((u) => !cancelled && setUrl(u));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const run = useCallback(async (task: () => Promise<string | null>) => {
    setBusy(true);
    setError(null);
    try {
      setUrl(await task());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }, []);

  const upload = (file: File) =>
    run(async () => {
      if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
      await uploadMyPhoto(userId!, await fileToResizedBlob(file));
      return getMyPhotoUrl(userId!);
    });

  const remove = () =>
    run(async () => {
      await deleteMyPhoto(userId!);
      return null;
    });

  return { url, busy, error, upload, remove };
}

type MyPhotoState = ReturnType<typeof useMyPhoto>;

/** Upload / replace / remove UI for "My Photo". */
export function MyPhotoPicker({ photo }: { photo: MyPhotoState }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const pick = () => inputRef.current?.click();

  return (
    <div className={styles.picker}>
      <div
        className={`${styles.frame} ${dragging ? styles.dragging : ''} ${photo.url ? styles.filled : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) void photo.upload(file);
        }}
      >
        {photo.url === undefined ? (
          <div className={styles.loading} aria-label="Loading your photo" />
        ) : photo.url ? (
          <img src={photo.url} alt="Your full-body photo" />
        ) : (
          <button type="button" className={styles.prompt} onClick={pick} disabled={photo.busy}>
            <span className={styles.silhouette}>
              <Icon name="profile" size={34} />
            </span>
            <strong>Add a full-body photo</strong>
            <span>Head to toe, facing the camera, good light</span>
          </button>
        )}
        {photo.busy && <div className={styles.busy}>Saving…</div>}
      </div>

      <div className={styles.side}>
        <ul className={styles.tips}>
          <li>Stand straight on, arms slightly away from your body</li>
          <li>Plain, fitted clothes work best</li>
          <li>Just you in the shot</li>
        </ul>
        <p className={styles.private}>
          <Icon name="profile" size={14} /> Private to you. It’s only shared with our try-on partner, FASHN, while
          generating a try-on.
        </p>
        {photo.error && <p className={styles.error}>{photo.error}</p>}
        <div className={styles.actions}>
          <Button variant={photo.url ? 'secondary' : 'primary'} size="sm" icon="upload" onClick={pick} disabled={photo.busy}>
            {photo.url ? 'Replace photo' : 'Upload photo'}
          </Button>
          {photo.url && (
            <Button variant="ghost" size="sm" icon="trash" onClick={() => void photo.remove()} disabled={photo.busy}>
              Remove
            </Button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="visually-hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void photo.upload(file);
        }}
      />
    </div>
  );
}

export function MyPhotoModal({ onClose }: { onClose: () => void }) {
  const photo = useMyPhoto();
  return (
    <Modal title="My photo" onClose={onClose} width={600}>
      <p className={styles.intro}>This is the photo we use when you try on pieces from other racks.</p>
      <MyPhotoPicker photo={photo} />
      <div className={styles.footer}>
        <Button onClick={onClose} disabled={photo.busy}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
