package models

type Message struct {
	Content   string `json:"content"`
	IsUser    bool   `json:"isUser"`
	Timestamp string `json:"timestamp"`
}

type Chat struct {
	ID        string    `json:"id"`
	Messages  []Message `json:"messages"`
	Model     string    `json:"model"`
	CreatedAt string    `json:"createdAt"`
}

type ChatRequest struct {
	ChatID  string `json:"chatId"`
	Message string `json:"message"`
	Model   string `json:"model"`
}

type ChatResponse struct {
	ChatID  string  `json:"chatId"`
	Message Message `json:"message"`
	Error   string  `json:"error,omitempty"`
}
