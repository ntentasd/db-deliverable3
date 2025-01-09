package server

import (
	"net/http"
	"regexp"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/middleware"
	"github.com/ntentasd/db-deliverable3/internal/models"
)

func (srv *Server) SetupCarRoutes() {
	carGroup := srv.FiberApp.Group("/details")

	validator := validator.New()

	_ = validator.RegisterValidation("licenseplate", validateLicensePlate)

	authenticatedGroup := srv.FiberApp.Group("/cars", middleware.JWTMiddleware(srv.JWTSecret))

	// Get all cars
	authenticatedGroup.Get("/", func(c *fiber.Ctx) error {
		_, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 5)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		cars, totalCars, err := srv.Database.CarDB.GetAllCars(page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		totalPages := (totalCars + pageSize - 1) / pageSize

		return c.JSON(fiber.Map{
			"data": cars,
			"meta": fiber.Map{
				"current_page": page,
				"page_size":    pageSize,
				"total_pages":  totalPages,
				"total_cars":   totalCars,
			},
		})
	})

	// Get all rented cars
	authenticatedGroup.Get("/rented", func(c *fiber.Ctx) error {
		_, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		if !checkAdmin(c) {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}

		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 5)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		cars, totalCars, err := srv.Database.CarDB.GetAllRentedCars(page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		totalPages := (totalCars + pageSize - 1) / pageSize

		return c.JSON(fiber.Map{
			"data": cars,
			"meta": fiber.Map{
				"current_page": page,
				"page_size":    pageSize,
				"total_pages":  totalPages,
				"total_cars":   totalCars,
			},
		})
	})

	// Get all maintenance cars
	authenticatedGroup.Get("/maintenance", func(c *fiber.Ctx) error {
		_, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		if !checkAdmin(c) {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}

		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 5)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		cars, totalCars, err := srv.Database.CarDB.GetAllMaintenanceCars(page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		totalPages := (totalCars + pageSize - 1) / pageSize

		return c.JSON(fiber.Map{
			"data": cars,
			"meta": fiber.Map{
				"current_page": page,
				"page_size":    pageSize,
				"total_pages":  totalPages,
				"total_cars":   totalCars,
			},
		})
	})

	// Get all available cars
	srv.FiberApp.Get("/available", func(c *fiber.Ctx) error {
		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 5)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		cars, totalCars, err := srv.Database.CarDB.GetAllAvailableCars(page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		totalPages := (totalCars + pageSize - 1) / pageSize

		return c.JSON(fiber.Map{
			"data": cars,
			"meta": fiber.Map{
				"current_page": page,
				"page_size":    pageSize,
				"total_pages":  totalPages,
				"total_cars":   totalCars,
			},
		})
	})

	// Get car by license plate
	authenticatedGroup.Get("/:license_plate", func(c *fiber.Ctx) error {
		_, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		licensePlate := c.Params("license_plate")
		if err := validator.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid license plate format"})
		}
		car, err := srv.Database.CarDB.GetCarByLicensePlate(licensePlate)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(car)
	})

	// Add a new car
	authenticatedGroup.Post("/", func(c *fiber.Ctx) error {
		var car models.Car
		_, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		if role, ok := c.Locals(string(middleware.Role)).(string); !ok || role != "Admin" {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		if err := c.BodyParser(&car); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
		}
		if err := validator.Struct(car); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "validation failed"})
		}
		car.Status = "AVAILABLE"
		if err := srv.Database.CarDB.InsertCar(car); err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(http.StatusCreated).JSON(car)
	})

	// Update car status
	authenticatedGroup.Put("/:license_plate", func(c *fiber.Ctx) error {
		_, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		licensePlate := c.Params("license_plate")
		if err := validator.Var(licensePlate, "required,licenseplate"); err != nil {
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
		if err := validator.Struct(car); err != nil {
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
	authenticatedGroup.Delete("/:license_plate", func(c *fiber.Ctx) error {
		_, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		if role, ok := c.Locals(string(middleware.Role)).(string); !ok || role != "Admin" {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		licensePlate := c.Params("license_plate")
		if err := validator.Var(licensePlate, "required,licenseplate"); err != nil {
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

	carGroup.Get("/:license_plate/damages", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		if err := validator.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid license plate format"})
		}

		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 5)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		// Fetch car details
		car, err := srv.Database.CarDB.GetCarByLicensePlate(licensePlate)
		if err != nil {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Car not found"})
		}

		// Fetch damages
		damages, totalDamages, err := srv.Database.DamageDB.GetDamages(licensePlate, page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		totalPages := (totalDamages + pageSize - 1) / pageSize

		return c.JSON(fiber.Map{
			"data": fiber.Map{
				"car":     car,
				"damages": damages,
			},
			"meta": fiber.Map{
				"current_page":  page,
				"page_size":     pageSize,
				"total_pages":   totalPages,
				"total_damages": totalDamages,
			},
		})
	})

	authenticatedGroup.Post("/damages", func(c *fiber.Ctx) error {
		_, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		if !checkAdmin(c) {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		var damage models.Damage
		if err := c.BodyParser(&damage); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}
		if err := validator.Struct(damage); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": ErrValidationFailed.Error()})
		}

		err := srv.Database.DamageDB.AddDamage(damage)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "damage added successfully"})
	})

	carGroup.Get("/:license_plate/services", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		if err := validator.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Invalid license plate format"})
		}

		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 5)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		// Fetch car details
		car, err := srv.Database.CarDB.GetCarByLicensePlate(licensePlate)
		if err != nil {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "Car not found"})
		}

		totalServices, err := srv.Database.ServiceDB.GetTotalServices(car.LicensePlate)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch total services count"})
		}

		totalPages := (totalServices + pageSize - 1) / pageSize

		// Fetch services
		services, err := srv.Database.ServiceDB.GetServices(licensePlate, page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{
			"data": fiber.Map{
				"car":      car,
				"services": services,
			},
			"meta": fiber.Map{
				"current_page":   page,
				"page_size":      pageSize,
				"total_pages":    totalPages,
				"total_services": totalServices,
			},
		})
	})

	authenticatedGroup.Post("/services", func(c *fiber.Ctx) error {
		_, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		if !checkAdmin(c) {
			return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
		}
		var service models.Service
		if err := c.BodyParser(&service); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}
		if err := validator.Struct(service); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": ErrValidationFailed.Error()})
		}

		err := srv.Database.ServiceDB.AddService(service)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "service added successfully"})
	})

	// Add authenticated Post endpoint for services and damages
}

func validateLicensePlate(fl validator.FieldLevel) bool {
	re := regexp.MustCompile(`^[A-Za-z]{3}[0-9]{4}$`)
	return re.MatchString(fl.Field().String())
}

func checkAdmin(c *fiber.Ctx) bool {
	if role, ok := c.Locals(string(middleware.Role)).(string); ok && role == "Admin" {
		return true
	}
	return false
}
