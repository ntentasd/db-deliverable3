package server

import (
	"fmt"
	"net/http"
	"regexp"

	"github.com/go-playground/validator"
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/models"
)

func SetupCarRoutes(app *fiber.App, carDB *database.CarDB, damageDB *database.DamageDB, serviceDB *database.ServiceDB) {
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
	carGroup.Put("/:license_plate", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		if err := validateLicensePlate(licensePlate); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		_, err := carDB.GetCarByLicensePlate(licensePlate)
		if err != nil {
			if err == database.ErrCarNotFound {
				return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		var car struct {
			Make      string        `json:"make" db:"make" validate:"required"`
			Model     string        `json:"model" db:"model" validate:"required"`
			Status    models.Status `json:"status,omitempty" db:"status" validate:"required"`
			CostPerKm float64       `json:"cost_per_km" db:"cost_per_km" validate:"required,gt=0"`
			Location  string        `json:"location" db:"location" validate:"required"`
		}
		if err := c.BodyParser(&car); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid data form"})
		}
		if !car.Status.ValidateStatus() {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "status can either be available, rented or maintenance"})
		}
		validate := validator.New()
		if err := validate.Struct(car); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "validation failed"})
		}
		tempCar := models.Car{
			LicensePlate: licensePlate,
			Make:         car.Make,
			Model:        car.Model,
			Status:       car.Status,
			CostPerKm:    car.CostPerKm,
			Location:     car.Location,
		}
		updatedCar, err := carDB.UpdateCar(tempCar)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(http.StatusOK).JSON(updatedCar)
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

	carGroup.Get("/:license_plate/details", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")

		// Fetch car details
		car, err := carDB.GetCarByLicensePlate(licensePlate)
		if err != nil {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Car not found"})
		}

		// Fetch damages
		damages, err := damageDB.GetDamagesByLicensePlate(licensePlate)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		// Fetch services
		services, err := serviceDB.GetServicesByLicensePlate(licensePlate)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{
			"car":      car,
			"damages":  damages,
			"services": services,
		})
	})
}

func validateLicensePlate(licensePlate string) error {
	re := regexp.MustCompile(`^[A-Za-z]{3}[0-9]{4}`)
	if !re.MatchString(licensePlate) {
		return fmt.Errorf("invalid license plate format")
	}
	return nil
}
