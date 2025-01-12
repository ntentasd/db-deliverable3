package server

import (
	"log"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"

	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/middleware"
	"github.com/ntentasd/db-deliverable3/internal/models"
)

func (srv *Server) SetupTripRoutes() {
	tripGroup := srv.FiberApp.Group("/trips")

	validator := validator.New()

	_ = validator.RegisterValidation("licenseplate", validateLicensePlate)

	authenticatedGroup := tripGroup.Group("/", middleware.JWTMiddleware(srv.JWTSecret))

	authenticatedGroup.Get("/car/:license_plate", func(c *fiber.Ctx) error {
		ctx, span := InitServerTracer(c, "GetCarTripsHandler")
		defer span.End()

		licensePlate := c.Params("license_plate")
		if err := validator.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).
				JSON(fiber.Map{"error": "invalid license plate format"})
		}

		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).
				JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 10)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).
				JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		trips, err := srv.Database.TripDB.GetAllTripsForCar(ctx, licensePlate, page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(trips)
	})

	authenticatedGroup.Get("/details/:id", func(c *fiber.Ctx) error {
		ctx, span := InitServerTracer(c, "GetTripDetailsHandler")
		defer span.End()

		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		tripID := c.Params("id")
		if tripID == "" {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid trip ID"})
		}

		trip, costPerKm, err := srv.Database.TripDB.GetTripByID(ctx, tripID, email)
		if err != nil {
			if err == database.ErrTripNotFound {
				return c.Status(http.StatusForbidden).JSON(fiber.Map{"error": "forbidden"})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{
			"trip":        trip,
			"cost_per_km": costPerKm,
		})
	})

	authenticatedGroup.Get("/", func(c *fiber.Ctx) error {
		ctx, span := InitServerTracer(c, "GetUserTripsHandler")
		defer span.End()

		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).
				JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 5)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).
				JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		trips, totalTrips, err := srv.Database.TripDB.GetAllTripsForUser(ctx, email, page, pageSize)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		totalPages := (totalTrips + pageSize - 1) / pageSize

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
		ctx, span := InitServerTracer(c, "GetActiveTripHandler")
		defer span.End()

		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		car, err := srv.Database.TripDB.GetActiveTrip(ctx, email)
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
		ctx, span := InitServerTracer(c, "StartTripHandler")
		defer span.End()

		var requestBody struct {
			LicensePlate string `json:"license_plate" validate:"required,licenseplate"`
		}
		if err := c.BodyParser(&requestBody); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}
		if err := validator.Var(requestBody.LicensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).
				JSON(fiber.Map{"error": "invalid license plate format"})
		}

		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		car, err := srv.Database.CarDB.GetCarByLicensePlate(ctx, requestBody.LicensePlate)
		if err != nil {
			if err == database.ErrCarNotFound {
				return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "car not found"})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		if car.Status != "AVAILABLE" {
			return c.Status(http.StatusBadRequest).
				JSON(fiber.Map{"error": "car is not available for a trip"})
		}

		tx, err := srv.Database.CarDB.DB.Begin()
		if err != nil {
			return c.Status(http.StatusInternalServerError).
				JSON(fiber.Map{"error": "failed to start transaction"})
		}

		defer func() {
			if err != nil {
				tx.Rollback()
			}
		}()

		err = srv.Database.TripDB.CreateTrip(ctx, tx, email, strings.ToUpper(requestBody.LicensePlate))
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		err = srv.Database.CarDB.UpdateCarStatus(ctx, tx, requestBody.LicensePlate, "RENTED")
		if err != nil {
			return c.Status(http.StatusInternalServerError).
				JSON(fiber.Map{"error": "failed to update car status"})
		}

		if err = tx.Commit(); err != nil {
			return c.Status(http.StatusInternalServerError).
				JSON(fiber.Map{"errir": "failed to commit transaction"})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "trip started successfully"})
	})

	authenticatedGroup.Post("/stop", func(c *fiber.Ctx) error {
		ctx, span := InitServerTracer(c, "StopTripHandler")
		defer span.End()

		var payload struct {
			Distance        float64              `json:"distance" validate:"required,gt=0"`
			DrivingBehavior float64              `json:"driving_behavior" validate:"required,gt=0,max=10"`
			Amount          float64              `json:"amount" validate:"required,gt=0,max=99999999.99"`
			PaymentMethod   models.PaymentMethod `json:"payment_method" validate:"required,oneof=SUBSCRIPTION CARD CRYPTO"`
		}
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		if err := c.BodyParser(&payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}
		if err := validator.Struct(payload); err != nil {
			return c.Status(http.StatusBadRequest).
				JSON(fiber.Map{"error": ErrValidationFailed.Error()})
		}

		tripID, licensePlate, costPerKm, err := srv.Database.TripDB.FindActiveTripCar(ctx, email)
		if err != nil {
			if err == database.ErrCarNotFound {
				return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		if calculateAmount(payload.Distance, costPerKm) != payload.Amount {
			return c.Status(fiber.StatusBadRequest).SendString("inconsistent amount calculation")
		}

		tx, err := srv.Database.CarDB.DB.Begin()
		if err != nil {
			return c.Status(http.StatusInternalServerError).
				JSON(fiber.Map{"error": "failed to start transaction"})
		}

		defer func() {
			if err != nil {
				tx.Rollback()
			} else {
				tx.Commit()
			}
		}()

		err = srv.Database.TripDB.EndTrip(ctx, tx, email, payload.Distance, payload.DrivingBehavior)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		err = srv.Database.CarDB.UpdateCarStatus(ctx, tx, licensePlate, "AVAILABLE")
		if err != nil {
			return c.Status(http.StatusInternalServerError).
				JSON(fiber.Map{"error": "failed to update car status"})
		}

		err = srv.Database.UserDB.UpdateDrivingBehavior(tx, email, payload.DrivingBehavior)
		if err != nil {
			return c.Status(http.StatusInternalServerError).
				JSON(fiber.Map{"error": "failed to update driving behavior"})
		}

		var subbed bool
		if sub, err := srv.Database.SubscriptionDB.GetActiveSubscription(email); err == nil &&
			sub.EndDate.After(time.Now()) {
			subbed = true
		}

		// If subbed, set the payment amount to 0 and payment method to `SUBSCRIPTION`
		if subbed {
			payload.Amount = 0
			payload.PaymentMethod = models.Sub
		}

		err = srv.Database.PaymentDB.CreatePayment(
			tx,
			tripID,
			payload.Amount,
			string(payload.PaymentMethod),
		)
		if err != nil {
			log.Println(err)
			return c.Status(http.StatusInternalServerError).
				JSON(fiber.Map{"error": "failed to register payment"})
		}

		if err = tx.Commit(); err != nil {
			return c.Status(http.StatusInternalServerError).
				JSON(fiber.Map{"error": "failed to commit transaction"})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "trip ended successfully"})
	})
}

func calculateAmount(distance float64, costPerKm float64) float64 {
	return math.Round(distance*costPerKm*100) / 100
}
