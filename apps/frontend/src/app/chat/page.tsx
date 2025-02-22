'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from '../../components/MessageBubble';
import styles from '../../styles/Chat.module.css';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMessage = { content: input, isUser: true, timestamp };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:8080/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          model: model,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { 
          content: `Error: ${data.error}`, 
          isUser: false, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          content: data.response, 
          isUser: false, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        content: 'Failed to get response', 
        isUser: false, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.chatWindow} ref={chatWindowRef}>
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}
      </div>
      <form onSubmit={handleSubmit} className={styles.inputContainer}>
        <select
          className={styles.modelSelect}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o-mini</option>
        </select>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
} 