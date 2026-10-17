import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRack } from '@/store/RackStore';
import { useUI } from '@/store/UIStore';
import { tryOn, TryOnError } from '@/lib/tryOn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ItemImage } from '@/components/items/ItemImage';
import { MyPhotoPicker, useMyPhoto } from './MyPhoto';
import styles from './TryOnModal.module.css';

const LOADING_LINES = ['Measuring the fit…', 'Steaming out the wrinkles…', 'Matching the lighting…', 'Almost ready…'];

type Phase = { kind: 'idle' } | { kind: 'running' } | { kind: 'done'; url: string } | { kind: 'error'; message: string };

export function TryOnModal({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const { items, getUser } = useRack();
  const { openUpgrade } = useUI();
  const photo = useMyPhoto();
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [line, setLine] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const autoStarted = useRef(false);

  const item = items.find((i) => i.id === itemId);
  const owner = item && getUser(item.ownerId);

  const start = useCallback(async () => {
    if (!item) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase({ kind: 'running' });
    setLine(0);
    try {
      const url = await tryOn(item, controller.signal);
      if (!controller.signal.aborted) setPhase({ kind: 'done', url });
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof TryOnError && err.code === 'not_pro') return openUpgrade();
      if (err instanceof TryOnError && err.code === 'no_photo') return setPhase({ kind: 'idle' });
      setPhase({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    }
  }, [item, openUpgrade]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Already have a photo → go straight to the try-on. Uploading one inside this modal waits for a click instead.
  useEffect(() => {
    if (photo.url === undefined || autoStarted.current) return;
    autoStarted.current = true;
    if (photo.url) void start();
  }, [photo.url, start]);

  useEffect(() => {
    if (phase.kind !== 'running') return;
    const timer = setInterval(() => setLine((l) => Math.min(l + 1, LOADING_LINES.length - 1)), 3500);
    return () => clearInterval(timer);
  }, [phase.kind]);

  if (!item || !owner) return null;

  // Covers the moment between loading an existing photo and the auto-start kicking in.
  const loading = photo.url === undefined || (!!photo.url && !autoStarted.current);
  const needsPhoto = phase.kind === 'idle' && !loading;

  return (
    <Modal title="Try it on" onClose={onClose} width={phase.kind === 'done' ? 560 : 640}>
      {loading && <div className={styles.placeholder} aria-label="Loading" />}

      {needsPhoto && (
        <div className={styles.setup}>
          <p className={styles.lead}>
            First, add a full-body photo of yourself. We’ll put <strong>{item.name}</strong> on it.
          </p>
          <MyPhotoPicker photo={photo} />
          <div className={styles.footer}>
            <Button icon="sparkle" size="lg" disabled={!photo.url || photo.busy} onClick={() => void start()}>
              Try it on
            </Button>
          </div>
        </div>
      )}

      {phase.kind === 'running' && photo.url && (
        <div className={styles.running} aria-live="polite">
          <div className={styles.pair}>
            <div className={`${styles.card} ${styles.scanning}`}>
              <img src={photo.url} alt="" />
            </div>
            <span className={styles.plus}>
              <Icon name="sparkle" size={22} />
            </span>
            <div className={styles.card}>
              <ItemImage item={item} />
            </div>
          </div>
          <p className={styles.status}>{LOADING_LINES[line]}</p>
          <p className={styles.sub}>Usually takes 10–20 seconds.</p>
        </div>
      )}

      {phase.kind === 'error' && (
        <div className={styles.errorBox}>
          <span className={styles.errorIcon}>!</span>
          <p>{phase.message}</p>
          <div className={styles.footerCenter}>
            <Button variant="secondary" onClick={() => setPhase({ kind: 'idle' })}>
              Change my photo
            </Button>
            <Button icon="sparkle" onClick={() => void start()}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {phase.kind === 'done' && (
        <div className={styles.result}>
          <div className={styles.resultImage}>
            <img src={phase.url} alt={`You wearing ${item.name}`} />
            <span className={styles.resultTag}>
              <Icon name="sparkle" size={14} /> {item.name}
            </span>
          </div>
          <p className={styles.sub}>
            Like it? It’s on <strong>@{owner.handle}</strong>’s rack.
          </p>
          <div className={styles.resultActions}>
            <Link to="/messages" onClick={onClose} className={styles.linkButton}>
              <Icon name="messages" size={18} /> Message owner
            </Link>
            <Button variant="secondary" icon="swap" disabled title="Offers are coming soon">
              Make an offer
            </Button>
          </div>
          <button className={styles.again} onClick={() => setPhase({ kind: 'idle' })}>
            Use a different photo
          </button>
        </div>
      )}
    </Modal>
  );
}
