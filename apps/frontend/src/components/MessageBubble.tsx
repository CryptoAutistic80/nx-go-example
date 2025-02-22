import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/MessageBubble.module.css';

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ content, isUser, timestamp, isStreaming }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <div className={`${styles.bubble} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.content} ref={contentRef}>
        {isUser ? (
          content
        ) : (
          <ReactMarkdown>{content || ''}</ReactMarkdown>
        )}
        {isStreaming && content && (
          <span className={styles.cursor}></span>
        )}
        {isStreaming && !content && (
          <span className={styles.typingIndicator}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </span>
        )}
      </div>
      {timestamp && <div className={styles.timestamp}>{timestamp}</div>}
    </div>
  );
}; 