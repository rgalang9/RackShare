import { useRack } from '@/store/RackStore';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from './Page.module.css';
import msg from './MessagesPage.module.css';

const PREVIEWS: Record<string, string> = {
  'u-dee': 'yo would you trade those court sneakers? 👀',
  'u-maya': 'where did you find that cap!!',
  'u-sol': 'ok that color combo is unreal',
};

/** Placeholder inbox — DMs & trade offers land here later. */
export function MessagesPage() {
  const { getUser } = useRack();
  const threads = Object.entries(PREVIEWS).map(([id, text]) => ({ user: getUser(id)!, text }));

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1>Messages</h1>
        <p>Chat about pieces, swap fit ideas, and (soon) trade.</p>
      </header>

      <div className={msg.layout}>
        <ul className={msg.list}>
          {threads.map(({ user, text }, i) => (
            <li key={user.id} className={`${msg.thread} ${i === 0 ? msg.active : ''}`}>
              <Avatar user={user} size={44} />
              <span>
                <strong>{user.name}</strong>
                <small>{text}</small>
              </span>
            </li>
          ))}
        </ul>
        <div className={msg.pane}>
          <EmptyState icon="messages" title="DMs & trading are on the way">
            Messaging is a preview for now — soon you'll be able to chat and send trade offers right from
            someone's rack.
          </EmptyState>
        </div>
      </div>
    </div>
  );
}
