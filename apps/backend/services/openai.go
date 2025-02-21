package services

import (
	"context"
	"os"

	"github.com/openai/openai-go"
	"github.com/openai/openai-go/option"
)

var client *openai.Client

func InitOpenAI() {
	client = openai.NewClient(
		option.WithAPIKey(os.Getenv("OPENAI_API_KEY")),
	)
}

func QueryOpenAI(query string) (string, error) {
	completion, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
		Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
			openai.UserMessage(query),
		}),
		Model: openai.F(openai.ChatModelGPT4o),
	})

	if err != nil {
		return "", err
	}

	return completion.Choices[0].Message.Content, nil
} 