'use client';

import { useRouter } from 'next/navigation';
import styles from '../../styles/ChatLayout.module.css';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      </div>
      {children}
    </div>
  );
} 