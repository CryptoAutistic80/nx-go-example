package main

import (
	"log"
	"net/http"

	"nx-go-example/backend/handlers"
	"nx-go-example/backend/services"
	"nx-go-example/backend/utils"
)

func main() {
	const port = ":8080"

	services.InitOpenAI()
	http.HandleFunc("/query", handlers.QueryHandler)

	// Print server info
	utils.PrintServerInfo(port)

	// Start server
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}
