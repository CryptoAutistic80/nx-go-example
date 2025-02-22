package auth

import (
	"fmt"
	"log"
	"net/http"
	"nx-go-example/backend/services"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

func init() {
	// Get JWT secret from secrets service
	secret := services.GetJWTSecret()
	if secret == "" {
		if os.Getenv("GO_ENV") == "production" {
			panic("JWT secret is not set in production mode")
		}
		// Use a default secret for development
		log.Printf("Using default JWT secret for development")
		secret = "default-development-secret-do-not-use-in-production"
	}
	jwtSecret = []byte(secret)
}

// GenerateToken creates a new JWT token for frontend use
func GenerateToken() (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"iss": "nx-go-example",
		"exp": time.Now().Add(time.Hour * 24).Unix(), // 24 hour expiry
	})

	return token.SignedString(jwtSecret)
}

// AuthMiddleware verifies the JWT token in the request
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Skip auth for OPTIONS requests (CORS preflight)
		if r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Remove 'Bearer ' prefix
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Token is valid, proceed to handler
		next.ServeHTTP(w, r)
	}
}
