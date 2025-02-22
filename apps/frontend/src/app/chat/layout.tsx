'use client';

import { useRouter } from 'next/navigation';
import styles from '../../styles/ChatLayout.module.css';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const router = useRouter();

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => router.push('/')}
        >
          ← Back
        </button>
        <button 
          className={styles.newChatButton}
          onClick={() => window.location.reload()}
        >
          New Chat
        </button>
      </div>
      {children}
    </div>
  );
} 