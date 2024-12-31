package server

import (
	"fmt"
	"net/http"
	"regexp"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/models"
)

func SetupCarRoutes(app *fiber.App, carDB *database.CarDB) {
	carGroup := app.Group("/cars")

	// Get all cars
	carGroup.Get("/", func(c *fiber.Ctx) error {
		cars, err := carDB.GetAllCars()
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(cars)
	})

	// Get car by license plate
	carGroup.Get("/:license_plate", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		car, err := carDB.GetCarByLicensePlate(licensePlate)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(car)
	})

	// Add a new car
	carGroup.Post("/", func(c *fiber.Ctx) error {
		var car models.Car
		if err := c.BodyParser(&car); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
		}
		validate := validator.New()
		if err := validate.Struct(car); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "validation failed"})
		}
		car.Status = "AVAILABLE"
		if err := carDB.InsertCar(car); err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(http.StatusCreated).JSON(car)
	})

	// Update car status
	carGroup.Put("/:license_plate/status", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		var input struct {
			Status models.Status `json:"status"`
		}
		if err := c.BodyParser(&input); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
		}
		if valid := input.Status.ValidateStatus(); valid != true {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "status can either be available, rented or maintenance"})
		}
		validate := validator.New()
		if err := validate.Struct(input); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "validation failed"})
		}
		if err := carDB.UpdateCarStatus(licensePlate, input.Status.String()); err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.SendStatus(http.StatusOK)
	})

	// Delete a car
	carGroup.Delete("/:license_plate", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		if err := validateLicensePlate(licensePlate); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		car, err := carDB.DeleteCar(licensePlate)
		if err != nil {
			if err == database.ErrCarNotFound {
				return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(http.StatusOK).JSON(car)
	})
}

func validateLicensePlate(licensePlate string) error {
	re := regexp.MustCompile(`^[A-Za-z]{3}[0-9]{4}`)
	if !re.MatchString(licensePlate) {
		return fmt.Errorf("invalid license plate format")
	}
	return nil
}
