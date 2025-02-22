'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from '../../components/MessageBubble';
import styles from '../../styles/Chat.module.css';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatResponse {
  chatId: string;
  message: Message;
  error?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [chatId, setChatId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get JWT token when component mounts
    const getToken = async () => {
      try {
        const response = await fetch('http://localhost:8080/auth/token');
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Failed to get token:', error);
      }
    };
    getToken();
  }, []);

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
    if (!input.trim() || !token) return;

    const userMessage = { content: input, isUser: true, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:8080/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: chatId,
          message: input,
          model: model,
        }),
      });

      const data: ChatResponse = await response.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { 
          content: `Error: ${data.error}`, 
          isUser: false, 
          timestamp: new Date().toLocaleTimeString() 
        }]);
      } else {
        // Update chat ID if this is a new conversation
        if (!chatId) {
          setChatId(data.chatId);
        }
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        content: 'Failed to get response', 
        isUser: false, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    }
  };

  const startNewChat = () => {
    setChatId('');
    setMessages([]);
  };

  if (!token) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <select
          className={styles.modelSelect}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o-mini</option>
        </select>
        <button onClick={startNewChat} className={styles.newChatButton}>
          New Chat
        </button>
      </div>
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