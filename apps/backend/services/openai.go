package services

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"

	"nx-go-example/backend/config"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

var (
	openaiClient *openai.Client
	once         sync.Once
)

// Supported models
const (
	ModelGPT4o     = "gpt-4o"
	ModelGPT4oMini = "gpt-4o-mini"
)

// GetOpenAIClient returns a singleton instance of the OpenAI client
func GetOpenAIClient() *openai.Client {
	once.Do(func() {
		apiKey := os.Getenv("OPENAI_API_KEY")
		if apiKey == "" {
			panic("OPENAI_API_KEY environment variable is not set")
		}
		openaiClient = openai.NewClient(
			option.WithAPIKey(apiKey),
		)
	})
	return openaiClient
}

func InitOpenAI() {
	if err := config.LoadMessages(); err != nil {
		log.Printf("Failed to load messages: %v", err)
	}
}

func QueryOpenAI(query string, model string) (string, error) {
	// Validate model
	var openAIModel string
	switch model {
	case ModelGPT4o:
		openAIModel = openai.ChatModelGPT4o
	case ModelGPT4oMini:
		openAIModel = openai.ChatModelGPT4oMini
	default:
		return "", fmt.Errorf("invalid model: must be %s or %s", ModelGPT4o, ModelGPT4oMini)
	}

	completion, err := openaiClient.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.SystemMessage(config.GetSystemMessage("default")),
			openai.UserMessage(query),
		}),
		Model: openai.F(openAIModel),
	})

	if err != nil {
		return "", err
	}

	return completion.Choices[0].Message.Content, nil
}
