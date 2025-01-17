package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/ntentasd/db-deliverable3/config"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/memcached"
	"github.com/ntentasd/db-deliverable3/internal/middleware"
	"github.com/ntentasd/db-deliverable3/internal/server"
	"github.com/ntentasd/db-deliverable3/internal/tracing"
)

func main() {
	cleanup := tracing.Init("DatadriveAPI")
	defer cleanup()

	// Retrieve jwt secret from the environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatalf("JWT_SECRET environment variable is not set")
	}

	memcachedConfig := config.LoadMemcachedConfig()

	cacheClient := memcached.NewClient(memcachedConfig.Host, memcachedConfig.Port)

	// Load the configuration
	dbConfig := config.LoadDatabaseConfig()

	// Initialize the Database
	db, database, err := database.InitDB(dbConfig, cacheClient, 300) //  5 minutes Cache TTL
	if err != nil {
		log.Fatalf("Failed to initialize the database: %v", err)
	}
	defer db.Close()

	// Initialize the Fiber app
	app := fiber.New()
	app.Use(logger.New())
	app.Use(middleware.CorrelationMiddleware())
	// app.Use(middleware.TracingMiddleware())
	app.Use(middleware.OriginMiddleware())

	origin := os.Getenv("FRONTEND_ORIGIN")
	if origin == "" {
		origin = "http://localhost:3000"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:  fmt.Sprintf("%s, http://datadrive-ui", origin),
		AllowMethods:  "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:  "Content-Type, Authorization",
		ExposeHeaders: "Content-Length",
	}))

	app.Options("/*", func(c *fiber.Ctx) error {
		return c.SendStatus(fiber.StatusOK) // Respond with 200 OK for preflight requests
	})

	// Setup routes
	server := server.Server{
		FiberApp:  app,
		Database:  database,
		JWTSecret: jwtSecret,
	}

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(http.StatusOK).JSON(fiber.Map{
			"status":  "healthy",
			"message": "service is up and running",
		})
	})

	server.SetupCarRoutes()
	server.SetupTripRoutes()
	server.SetupUserRoutes()
	server.SetupReviewRoutes()
	server.SetupSubscriptionRoutes()

	// Start server
	log.Fatal(app.Listen(":8000"))
}
