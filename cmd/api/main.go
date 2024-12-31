package main

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql" // Import MySQL driver
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/server"
)

func main() {
	// Connect to the database
	db, err := sql.Open("mysql", "user:password@tcp(localhost:33306)/datadrive")
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// Initialize the CarDB
	carDB := database.NewCarDatabase(db)

	// Initialize the Fiber app
	app := fiber.New()

	// Setup routes
	server.SetupCarRoutes(app, carDB)

	// Start server
	log.Fatal(app.Listen(":8000"))
}
