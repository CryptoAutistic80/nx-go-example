package handlers

import (
	"encoding/json"
	"net/http"

	"nx-go-example/backend/models"
	"nx-go-example/backend/services"
)

func QueryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.QueryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.QueryResponse{Error: "Invalid request format"})
		return
	}

	response, err := services.QueryOpenAI(req.Query)
	if err != nil {
		json.NewEncoder(w).Encode(models.QueryResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(models.QueryResponse{Response: response})
} 