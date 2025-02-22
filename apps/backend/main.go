package main

import (
	"log"
	"net/http"
	"nx-go-example/backend/auth"
	"nx-go-example/backend/handlers"
	"nx-go-example/backend/services"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}

func main() {
	// Initialize OpenAI
	services.InitOpenAI()

	// Health check endpoint
	http.HandleFunc("/health", healthHandler)

	// Public route for getting JWT token
	http.HandleFunc("/auth/token", handlers.GetTokenHandler)

	// Protected route for chat
	http.HandleFunc("/query", auth.AuthMiddleware(handlers.QueryHandler))

	// New route for streaming
	http.HandleFunc("/stream", handlers.StreamQueryHandler)

	log.Printf("Server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
