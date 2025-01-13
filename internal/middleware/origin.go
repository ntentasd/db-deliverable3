package middleware

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

func OriginMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		allowedOrigin := "http://localhost"

		origin := c.Get("Origin")
		referer := c.Get("Referer")

		if origin != allowedOrigin && origin != "" {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"error": "Forbidden - Invalid Origin",
			})
		}

		if referer != "" && !startsWith(referer, allowedOrigin) {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{
				"error": "Forbidden - Invalid Referer",
			})
		}

		return c.Next()
	}
}

func startsWith(s, prefix string) bool {
	return len(s) >= len(prefix) && s[:len(prefix)] == prefix
}
