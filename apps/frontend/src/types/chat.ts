export interface ChatRequest {
  chatId?: string;
  message: string;
  model: string;
  token?: string;
}

export interface ChatResponse {
  message?: string;
  error?: string;
  chatId?: string;
}

export interface StreamingChatProps {
  onMessage: (content: string) => void;
  onToolCall?: (tool: any) => void;
  onError: (error: string) => void;
  onComplete: () => void;
} 