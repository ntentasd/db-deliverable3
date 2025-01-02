package server

import (
	"net/http"
	"regexp"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/models"
)

func (srv *Server) SetupCarRoutes(app *fiber.App) {
	carGroup := app.Group("/cars")

	validate := validator.New()

	_ = validate.RegisterValidation("licenseplate", validateLicensePlate)

	// Get all cars
	carGroup.Get("/", func(c *fiber.Ctx) error {
		cars, err := srv.Database.CarDB.GetAllCars()
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(cars)
	})

	// Get car by license plate
	carGroup.Get("/:license_plate", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		if err := validate.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid license plate format"})
		}
		car, err := srv.Database.CarDB.GetCarByLicensePlate(licensePlate)
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
		if err := validate.Struct(car); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "validation failed"})
		}
		car.Status = "AVAILABLE"
		if err := srv.Database.CarDB.InsertCar(car); err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(http.StatusCreated).JSON(car)
	})

	// Update car status
	carGroup.Put("/:license_plate", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		if err := validate.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid license plate format"})
		}
		var car struct {
			Make      string        `json:"make" validate:"required,max=45"`
			Model     string        `json:"model" validate:"required,max=45"`
			Status    models.Status `json:"status" validate:"required,oneof=AVAILABLE RENTED MAINTENANCE"`
			CostPerKm *float64      `json:"cost_per_km" validate:"omitempty,gt=0"`
			Location  string        `json:"location" validate:"omitempty,max=255"`
		}
		if err := c.BodyParser(&car); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid data format"})
		}
		if err := validate.Struct(car); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		updatedCar, err := srv.Database.CarDB.UpdateCar(models.Car{
			LicensePlate: licensePlate,
			Make:         car.Make,
			Model:        car.Model,
			Status:       car.Status,
			CostPerKm:    car.CostPerKm,
			Location:     car.Location,
		})
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(http.StatusOK).JSON(updatedCar)
	})

	// Delete a car
	carGroup.Delete("/:license_plate", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		if err := validate.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid license plate format"})
		}
		car, err := srv.Database.CarDB.DeleteCar(licensePlate)
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
		if err := validate.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid license plate format"})
		}

		// Fetch car details
		car, err := srv.Database.CarDB.GetCarByLicensePlate(licensePlate)
		if err != nil {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Car not found"})
		}

		// Fetch damages
		damages, err := srv.Database.DamageDB.GetDamagesByLicensePlate(licensePlate)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		// Fetch services
		services, err := srv.Database.ServiceDB.GetServicesByLicensePlate(licensePlate)
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

func validateLicensePlate(fl validator.FieldLevel) bool {
	re := regexp.MustCompile(`^[A-Za-z]{3}[0-9]{4}$`)
	return re.MatchString(fl.Field().String())
}
