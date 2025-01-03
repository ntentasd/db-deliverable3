package server

import (
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
)

type Server struct {
	FiberApp  *fiber.App
	Database  *database.Database
	JWTSecret string
}
