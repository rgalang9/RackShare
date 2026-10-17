import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import styles from './UpgradeModal.module.css';

const PERKS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'sparkle', title: 'Try it on', text: 'See any top, jacket or pants from someone’s rack on you before you ask about it.' },
  { icon: 'profile', title: 'Your photo stays yours', text: 'Your full-body photo is private — only you can see it.' },
  { icon: 'swap', title: 'Offer with confidence', text: 'Know it works with your fit before you message the owner.' },
];

export function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [clicked, setClicked] = useState(false);

  return (
    <Modal title="Rack Share Pro" onClose={onClose} width={480}>
      <div className={styles.hero}>
        <span className={styles.badge}>
          <Icon name="sparkle" size={16} /> PRO
        </span>
        <h3>See it on you before you ask for it.</h3>
        <p>Virtual try-on puts pieces from other racks onto your own photo in seconds.</p>
      </div>

      <ul className={styles.perks}>
        {PERKS.map((perk) => (
          <li key={perk.title}>
            <span className={styles.perkIcon}>
              <Icon name={perk.icon} size={18} />
            </span>
            <span>
              <strong>{perk.title}</strong>
              <small>{perk.text}</small>
            </span>
          </li>
        ))}
      </ul>

      <p className={styles.free}>Browsing racks, messaging owners and making offers stay free for everyone.</p>

      {/* Placeholder until Stripe checkout is wired up. */}
      <Button block size="lg" icon="sparkle" onClick={() => setClicked(true)} disabled={clicked}>
        {clicked ? 'Upgrades open soon' : 'Upgrade to Pro'}
      </Button>
      {clicked && <p className={styles.soon}>Payments are on the way — we’ll let you know the moment Pro is available.</p>}
    </Modal>
  );
}
