'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to AI Chat</h1>
      <p className={styles.description}>
        Chat with our advanced AI models using GPT-4o and GPT-4o-mini
      </p>
      <button 
        className={styles.button}
        onClick={() => router.push('/chat')}
      >
        Enter Chat
      </button>
    </div>
  );
}

