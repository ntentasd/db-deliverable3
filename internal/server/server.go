package server

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"

	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/middleware"
)

type Server struct {
	FiberApp  *fiber.App
	Database  *database.Database
	JWTSecret string
}

func InitServerTracer(c *fiber.Ctx, name string) (context.Context, trace.Span) {
	tracer := otel.Tracer("server")
	ctx, span := tracer.Start(c.Context(), name)

	correlationID := c.Locals(middleware.CorrelationIDHeader).(string)
	span.SetAttributes(attribute.String("correlation.id", correlationID))

	return ctx, span
}
