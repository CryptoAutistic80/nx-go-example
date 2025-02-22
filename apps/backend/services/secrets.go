package services

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"sync"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/secretsmanager"
)

type Secrets struct {
	JWTSecret   string `json:"jwt_secret"`
	OpenAIToken string `json:"openai_token"`
}

var (
	secretsClient *secretsmanager.Client
	secrets       *Secrets
	secretsMutex  sync.RWMutex
	secretName    = "nx-go-example/secrets"
)

func init() {
	// Load AWS configuration
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("us-east-1"), // Change this to your AWS region
	)
	if err != nil {
		log.Printf("Unable to load AWS SDK config: %v", err)
		return
	}

	// Create Secrets Manager client
	secretsClient = secretsmanager.NewFromConfig(cfg)
}

// GetSecrets retrieves secrets from AWS Secrets Manager
func GetSecrets() (*Secrets, error) {
	secretsMutex.RLock()
	if secrets != nil {
		defer secretsMutex.RUnlock()
		return secrets, nil
	}
	secretsMutex.RUnlock()

	// Default to development mode unless explicitly set to production
	if os.Getenv("GO_ENV") != "production" {
		// Development mode: use local .env file
		log.Printf("Running in development mode, using .env file")
		return getLocalSecrets()
	}

	// Production mode: try AWS Secrets Manager first
	log.Printf("Running in production mode, attempting to use AWS Secrets Manager")
	secretsMutex.Lock()
	defer secretsMutex.Unlock()

	// Try to get secrets from AWS
	if secretsClient != nil {
		input := &secretsmanager.GetSecretValueInput{
			SecretId: &secretName,
		}

		result, err := secretsClient.GetSecretValue(context.TODO(), input)
		if err == nil {
			// Successfully got secrets from AWS
			secrets = &Secrets{}
			if err := json.Unmarshal([]byte(*result.SecretString), secrets); err == nil {
				log.Printf("Successfully loaded secrets from AWS Secrets Manager")
				return secrets, nil
			}
		}
		log.Printf("Failed to get secrets from AWS: %v", err)
	}

	// Fallback to environment variables if AWS fails
	log.Printf("Falling back to environment variables")
	return getLocalSecrets()
}

// getLocalSecrets reads secrets from local .env file for development
func getLocalSecrets() (*Secrets, error) {
	return &Secrets{
		JWTSecret:   os.Getenv("JWT_SECRET"),
		OpenAIToken: os.Getenv("OPENAI_API_KEY"),
	}, nil
}

// GetJWTSecret returns the JWT secret
func GetJWTSecret() string {
	s, err := GetSecrets()
	if err != nil {
		log.Printf("Failed to get JWT secret: %v", err)
		return os.Getenv("JWT_SECRET") // Fallback to environment variable
	}
	return s.JWTSecret
}

// GetOpenAIToken returns the OpenAI API token
func GetOpenAIToken() string {
	s, err := GetSecrets()
	if err != nil {
		log.Printf("Failed to get OpenAI token: %v", err)
		return os.Getenv("OPENAI_API_KEY") // Fallback to environment variable
	}
	return s.OpenAIToken
}
