package config

import (
	"encoding/json"
	"os"
)

type Messages struct {
	SystemMessages map[string]string `json:"system_messages"`
}

var messages Messages

func LoadMessages() error {
	data, err := os.ReadFile("./config/systemPrompt.json")
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &messages)
}

func GetSystemMessage(key string) string {
	if msg, ok := messages.SystemMessages[key]; ok {
		return msg
	}
	return messages.SystemMessages["default"]
} 