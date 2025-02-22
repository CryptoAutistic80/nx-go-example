package handlers

import (
	"encoding/json"
	"net/http"

	"nx-go-example/backend/models"
	"nx-go-example/backend/services"
)

func QueryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.ChatResponse{Error: "Invalid request format"})
		return
	}

	// Validate required fields
	if req.Message == "" || req.Model == "" {
		json.NewEncoder(w).Encode(models.ChatResponse{Error: "Message and model are required"})
		return
	}

	response, err := services.HandleChatMessage(req.ChatID, req.Message, req.Model)
	if err != nil {
		json.NewEncoder(w).Encode(models.ChatResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(response)
} 
