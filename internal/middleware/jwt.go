package middleware

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

type ContextKey string

const (
	UserEmailKey ContextKey = "email"
)

func JWTMiddleware(secretKey string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Extract token from Authorization header
		authHeader := c.Get("Authorization")
		if !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Missing or invalid Authorization header"})
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Verify the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secretKey), nil
		})

		if err != nil || !token.Valid {
			log.Printf("JWT validation error: %v", err) // Log for debugging
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid claims"})
		}

		// Extract email and username
		email, emailOk := claims["email"].(string)
		if !emailOk {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid claims structure"})
		}

		// Attach to context
		c.Locals("email", email)

		return c.Next()
	}
}
