package models

type QueryRequest struct {
	Query string `json:"query"`
}

type QueryResponse struct {
	Response string `json:"response"`
	Error    string `json:"error,omitempty"`
}
