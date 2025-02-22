package services

import (
	"context"
	"fmt"
	"log"
	"os"

	"nx-go-example/backend/config"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

var client *openai.Client

// Supported models
const (
	ModelGPT4o     = "gpt-4o"
	ModelGPT4oMini = "gpt-4o-mini"
)

func InitOpenAI() {
	client = openai.NewClient(
		option.WithAPIKey(os.Getenv("OPENAI_API_KEY")),
	)
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

	completion, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
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
