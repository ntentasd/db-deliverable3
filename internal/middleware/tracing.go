package middleware

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"go.opentelemetry.io/otel"
)

func TracingMiddleware() fiber.Handler {
	tracer := otel.Tracer("server")

	return func(c *fiber.Ctx) error {
		ctx, span := tracer.Start(context.Background(), c.Path())
		defer span.End()

		// Attach the context with trace to Fiber's locals for downstream usage
		c.Locals("context", ctx)
		return c.Next()
	}
}
