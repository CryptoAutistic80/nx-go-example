import React from 'react';
import styles from '../styles/MessageBubble.module.css';

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ content, isUser, timestamp }) => {
  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.content}>{content}</div>
      {timestamp && <div className={styles.timestamp}>{timestamp}</div>}
    </div>
  );
}; 