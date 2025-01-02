package main

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql" // Import MySQL driver
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/server"
)

func main() {
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
		AllowOrigins: "http://localhost:3000, http://datadrive-ui",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type, Authorization",
	}))

	// Setup routes
	server := server.Server{Database: database}
	server.SetupCarRoutes(app)
	server.SetupTripRoutes(app, jwtSecret)

	// Start server
	log.Fatal(app.Listen(":8000"))
}
