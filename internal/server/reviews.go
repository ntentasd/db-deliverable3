package server

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/middleware"
)

func (srv *Server) SetupReviewRoutes() {
	reviewGroup := srv.FiberApp.Group("/reviews")

	validator := validator.New()
	_ = validator.RegisterValidation("licenseplate", validateLicensePlate)

	reviewGroup.Get("/car/:license_plate", func(c *fiber.Ctx) error {
		licensePlate := c.Params("license_plate")
		if err := validator.Var(licensePlate, "required,licenseplate"); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid license plate format"})
		}

		page := c.QueryInt("page", 1)
		if page < 1 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageNumber.Error()})
		}

		pageSize := c.QueryInt("page_size", 5)
		if pageSize < 1 || pageSize > 100 {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidPageSize.Error()})
		}

		reviews, emails, totalReviews, err := srv.Database.ReviewDB.GetAllReviewsForCar(licensePlate, page, pageSize)
		if err != nil {
			if err == database.ErrCarNotFound {
				return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		totalPages := (totalReviews + pageSize - 1) / pageSize

		return c.JSON(fiber.Map{
			"data": fiber.Map{
				"reviews": reviews,
				"emails":  emails,
			},
			"meta": fiber.Map{
				"current_page":  page,
				"page_size":     pageSize,
				"total_pages":   totalPages,
				"total_reviews": totalReviews,
			},
		})
	})

	authenticatedGroup := reviewGroup.Group("/", middleware.JWTMiddleware(srv.JWTSecret))

	authenticatedGroup.Post("/", func(c *fiber.Ctx) error {
		var payload struct {
			TripID  int    `json:"trip_id" validate:"required,gt=0"`
			Rating  int    `json:"rating" validate:"required,min=1,max=5"`
			Comment string `json:"comment,omitempty" validate:"omitempty,max=255"`
		}
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}

		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		err := srv.Database.ReviewDB.CreateReview(payload.TripID, payload.Rating, payload.Comment, email)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "review created"})
	})
}
