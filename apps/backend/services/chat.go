package services

import (
	"context"
	"fmt"
	"nx-go-example/backend/models"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

var (
	chats = make(map[string]*models.Chat)
	mutex sync.RWMutex
)

// Map our model names to OpenAI model names
func getOpenAIModel(model string) string {
	switch model {
	case "gpt-4o":
		return string(openai.ChatModelGPT4o)
	case "gpt-4o-mini":
		return string(openai.ChatModelGPT4oMini)
	default:
		return string(openai.ChatModelGPT4o)
	}
}

func CreateChat(model string) *models.Chat {
	chat := &models.Chat{
		ID:        uuid.New().String(),
		Messages:  []models.Message{},
		Model:     model,
		CreatedAt: time.Now().Format(time.RFC3339),
	}

	mutex.Lock()
	chats[chat.ID] = chat
	mutex.Unlock()

	return chat
}

func GetChat(chatID string) (*models.Chat, error) {
	mutex.RLock()
	chat, exists := chats[chatID]
	mutex.RUnlock()

	if !exists {
		return nil, fmt.Errorf("chat not found")
	}

	return chat, nil
}

func AddMessageToChat(chatID string, content string, isUser bool) (*models.Message, error) {
	mutex.Lock()
	defer mutex.Unlock()

	chat, exists := chats[chatID]
	if !exists {
		return nil, fmt.Errorf("chat not found")
	}

	message := models.Message{
		Content:   content,
		IsUser:    isUser,
		Timestamp: time.Now().Format(time.RFC3339),
	}

	chat.Messages = append(chat.Messages, message)
	return &message, nil
}

func convertToOpenAIMessages(messages []models.Message) []openai.ChatCompletionMessageParamUnion {
	var openaiMessages []openai.ChatCompletionMessageParamUnion
	for _, msg := range messages {
		if msg.IsUser {
			openaiMessages = append(openaiMessages, openai.UserMessage(msg.Content))
		} else {
			openaiMessages = append(openaiMessages, openai.AssistantMessage(msg.Content))
		}
	}
	return openaiMessages
}

func HandleChatMessage(chatID string, message string, modelName string) (*models.ChatResponse, error) {
	var chat *models.Chat
	var err error

	if chatID == "" {
		chat = CreateChat(modelName)
	} else {
		chat, err = GetChat(chatID)
		if err != nil {
			return nil, err
		}
	}

	// Add user message
	_, err = AddMessageToChat(chat.ID, message, true)
	if err != nil {
		return nil, err
	}

	// Get API key from secrets service
	apiKey := GetOpenAIToken()
	if apiKey == "" {
		return nil, fmt.Errorf("OpenAI API key is not set")
	}

	// Convert chat history to OpenAI format
	openaiMessages := convertToOpenAIMessages(chat.Messages)

	// Initialize OpenAI client
	client := openai.NewClient(
		option.WithAPIKey(apiKey),
	)

	// Create chat completion with full conversation history
	completion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
		Messages: openai.F(openaiMessages),
		Model:    openai.F(getOpenAIModel(modelName)),
	})
	if err != nil {
		return nil, err
	}

	// Add AI response to chat history
	aiMsg, err := AddMessageToChat(chat.ID, completion.Choices[0].Message.Content, false)
	if err != nil {
		return nil, err
	}

	return &models.ChatResponse{
		ChatID:  chat.ID,
		Message: *aiMsg,
	}, nil
}
