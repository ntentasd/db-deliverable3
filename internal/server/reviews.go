package server

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
)

func (srv *Server) SetupReviewRoutes() {
	tripGroup := srv.FiberApp.Group("/reviews")

	validator := validator.New()

	_ = validator.RegisterValidation("licenseplate", validateLicensePlate)

	// authenticatedGroup := tripGroup.Group("/", middleware.JWTMiddleware(srv.JWTSecret))

	tripGroup.Get("/car/:license_plate", func(c *fiber.Ctx) error {
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
				"current_page": page,
				"page_size":    pageSize,
				"total_pages":  totalPages,
				"total_trips":  totalReviews,
			},
		})
	})
}
