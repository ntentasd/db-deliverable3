package main

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql" // Import MySQL driver
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/server"
)

func main() {
	// Connect to the database
	db, err := sql.Open("mysql", "user:password@tcp(mysql:3306)/datadrive")
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer db.Close()

	// Initialize the CarDB
	carDB := database.NewCarDatabase(db)
	damageDB := database.NewDamageDB(db)
	serviceDB := database.NewServiceDB(db)

	// Initialize the Fiber app
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type, Authorization",
	}))

	// Setup routes
	server.SetupCarRoutes(app, carDB, damageDB, serviceDB)

	// Start server
	log.Fatal(app.Listen(":8000"))
}
