package server

import (
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/middleware"
)

func (srv *Server) SetupTripRoutes() {
	tripGroup := srv.FiberApp.Group("/trips")

	validator := validator.New()

	_ = validator.RegisterValidation("licenseplate", validateLicensePlate)

	authenticatedGroup := tripGroup.Group("/", middleware.JWTMiddleware(srv.JWTSecret))

	authenticatedGroup.Get("/car/:license_plate", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		if err := validator.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid license plate format"})
		}

		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 10)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		trips, err := srv.Database.TripDB.GetAllTripsForCar(licensePlate, page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(trips)
	})

	authenticatedGroup.Get("/details/:id", func(c *fiber.Ctx) error {
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		tripID := c.Params("id")
		if tripID == "" {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid trip ID"})
		}

		trip, err := srv.Database.TripDB.GetTripByID(tripID, email)
		if err != nil {
			if err == database.ErrTripNotFound {
				return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(trip)
	})

	authenticatedGroup.Get("/", func(c *fiber.Ctx) error {
		email, ok := c.Locals(string(middleware.Email)).(string)
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

		totalTrips, err := srv.Database.TripDB.GetTotalTripCountForUser(email)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch total trips count"})
		}

		totalPages := (totalTrips + pageSize - 1) / pageSize

		trips, err := srv.Database.TripDB.GetAllTripsForUser(email, page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{
			"data": trips,
			"meta": fiber.Map{
				"current_page": page,
				"page_size":    pageSize,
				"total_pages":  totalPages,
				"total_trips":  totalTrips,
			},
		})
	})

	authenticatedGroup.Get("/active", func(c *fiber.Ctx) error {
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		car, err := srv.Database.TripDB.GetActiveTrip(email)
		if err != nil {
			if err == database.ErrTripNotFound {
				c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
			}
			c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		if car.CarLicensePlate == "" {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "no active trip found"})
		}

		return c.JSON(car)
	})

	authenticatedGroup.Post("/start", func(c *fiber.Ctx) error {
		var requestBody struct {
			LicensePlate string `json:"license_plate" validate:"required,licenseplate"`
		}
		if err := c.BodyParser(&requestBody); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}
		if err := validator.Var(requestBody.LicensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid license plate format"})
		}

		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		car, err := srv.Database.CarDB.GetCarByLicensePlate(requestBody.LicensePlate)
		if err != nil {
			if err == database.ErrCarNotFound {
				return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "car not found"})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		if car.Status != "AVAILABLE" {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "car is not available for a trip"})
		}

		tx, err := srv.Database.CarDB.DB.Begin()
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to start transaction"})
		}

		defer func() {
			if err != nil {
				tx.Rollback()
			}
		}()

		err = srv.Database.TripDB.CreateTrip(tx, email, strings.ToUpper(requestBody.LicensePlate))
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		err = srv.Database.CarDB.UpdateCarStatus(tx, requestBody.LicensePlate, "RENTED")
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update car status"})
		}

		if err = tx.Commit(); err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"errir": "failed to commit transaction"})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "trip started successfully"})
	})

	authenticatedGroup.Post("/stop", func(c *fiber.Ctx) error {
		var payload struct {
			Distance        float64 `json:"distance" validate:"required,gt=0"`
			DrivingBehavior float64 `json:"driving_behavior" validate:"required,gt=0,max=1"`
		}
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		if err := c.BodyParser(&payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}
		if err := validator.Struct(payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": ErrValidationFailed.Error()})
		}

		car, err := srv.Database.TripDB.FindActiveTripCar(email)
		if err != nil {
			if err == database.ErrCarNotFound {
				return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		tx, err := srv.Database.CarDB.DB.Begin()
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to start transaction"})
		}

		defer func() {
			if err != nil {
				tx.Rollback()
			} else {
				tx.Commit()
			}
		}()

		err = srv.Database.TripDB.EndTrip(tx, email, payload.Distance, payload.DrivingBehavior)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		err = srv.Database.CarDB.UpdateCarStatus(tx, car.LicensePlate, "AVAILABLE")
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update car status"})
		}

		if err = tx.Commit(); err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"errir": "failed to commit transaction"})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "trip ended successfully"})
	})
}
