package models

type QueryRequest struct {
	Query string `json:"query"`
	Model string `json:"model"`
}

type QueryResponse struct {
	Response string `json:"response"`
	Error    string `json:"error,omitempty"`
}
