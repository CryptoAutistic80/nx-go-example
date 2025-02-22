'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from '../../components/MessageBubble';
import { streamChat } from '../../services/api';
import styles from '../../styles/Chat.module.css';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
  isStreaming?: boolean;
}

interface ChatResponse {
  chatId: string;
  message: Message;
  error?: string;
}

interface ChatRequest {
  chatId?: string;
  message: string;
  model: string;
  token?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-4o');
  const [chatId, setChatId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef('');

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
    if (!input.trim() || !token || isStreaming) return;

    const userMessage = { content: input, isUser: true, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMessage]);
    
    // Add initial assistant message for streaming
    const initialAssistantMessage = { 
      content: '', 
      isUser: false, 
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true 
    };
    setMessages(prev => [...prev, initialAssistantMessage]);
    
    setInput('');
    setIsStreaming(true);
    streamingContentRef.current = ''; // Reset streaming content

    try {      
      await streamChat(
        {
          chatId: chatId,
          message: input,
          model: model,
          token: token,
        },
        (content) => {
          // Update streaming content immediately
          streamingContentRef.current += content;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (!lastMessage.isUser) {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: streamingContentRef.current
                }
              ];
            }
            return newMessages;
          });
        },
        (tool) => {
          // Handle tool calls if needed
          console.log('Tool call:', tool);
        },
        (error) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (!lastMessage.isUser) {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: `Error: ${error}`,
                  isStreaming: false
                }
              ];
            }
            return newMessages;
          });
          setIsStreaming(false);
        },
        () => {
          // Streaming complete
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (!lastMessage.isUser) {
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  isStreaming: false
                }
              ];
            }
            return newMessages;
          });
          setIsStreaming(false);
        }
      );
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (!lastMessage.isUser) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: 'Failed to get response',
              isStreaming: false
            }
          ];
        }
        return newMessages;
      });
      setIsStreaming(false);
    }
  };

  const startNewChat = () => {
    if (isStreaming) return;
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
          disabled={isStreaming}
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o-mini</option>
        </select>
        <button 
          onClick={startNewChat} 
          className={styles.newChatButton}
          disabled={isStreaming}
        >
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
            isStreaming={message.isStreaming}
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
          disabled={isStreaming}
        />
        <button 
          type="submit" 
          className={styles.button}
          disabled={isStreaming}
        >
          Send
        </button>
      </form>
    </div>
  );
} 