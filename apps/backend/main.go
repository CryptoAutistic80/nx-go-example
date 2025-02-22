package main

import (
	"log"
	"net/http"
	"nx-go-example/backend/auth"
	"nx-go-example/backend/handlers"
)

func main() {
	// Public route for getting JWT token
	http.HandleFunc("/auth/token", handlers.GetTokenHandler)

	// Protected route for chat
	http.HandleFunc("/query", auth.AuthMiddleware(handlers.QueryHandler))

	log.Printf("Server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
