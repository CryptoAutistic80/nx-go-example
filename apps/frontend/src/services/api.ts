import { ChatRequest, ChatResponse, ToolCallData } from '../types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export const streamChat = async (
  request: ChatRequest,
  onMessage: (content: string) => void,
  onToolCall: (tool: ToolCallData) => void,
  onError: (error: string) => void,
  onComplete: () => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6);
          try {
            // Try to parse as JSON first
            const data = JSON.parse(content);
            switch (data.type) {
              case 'error':
                onError(data.error);
                return;
              case 'tool':
                onToolCall(data.data);
                break;
              case 'done':
                onComplete();
                return;
              default:
                if (data.content) {
                  onMessage(data.content);
                } else {
                  onMessage(content);
                }
            }
          } catch (error) {
            // If it's not valid JSON, treat it as plain text
            console.debug('Failed to parse JSON:', error);
            onMessage(content);
          }
        }
      }
    }

    // Handle any remaining buffer
    if (buffer && buffer.startsWith('data: ')) {
      const content = buffer.slice(6);
      try {
        const data = JSON.parse(content);
        if (data.type === 'error') {
          onError(data.error);
        } else if (data.type === 'tool') {
          onToolCall(data.data);
        } else if (data.content) {
          onMessage(data.content);
        } else {
          onMessage(content);
        }
      } catch (error) {
        console.debug('Failed to parse JSON:', error);
        onMessage(content);
      }
    }

    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};

export const chat = async (request: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${request.token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}; 