package main

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/server"
)

func main() {
	// Retrieve jwt secret from the environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatalf("JWT_SECRET environment variable is not set")
	}

	// Connect to the database
	db, err := sql.Open("mysql", "user:password@tcp(mysql:3306)/datadrive?parseTime=true")
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// Initialize the Database
	database, err := database.InitDB(db)
	if err != nil {
		log.Fatalf("Failed to initialize the database: %v", err)
	}

	// Initialize the Fiber app
	app := fiber.New()
	app.Use(logger.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins:  "http://localhost:3000, http://datadrive-ui",
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
	server.SetupCarRoutes()
	server.SetupTripRoutes()
	server.SetupUserRoutes()
	server.SetupReviewRoutes()

	// Start server
	log.Fatal(app.Listen(":8000"))
}
