package server

import (
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/middleware"
	"github.com/ntentasd/db-deliverable3/internal/models"
)

func (srv *Server) SetupSubscriptionRoutes() {
	subscriptionGroup := srv.FiberApp.Group("/subscriptions")

	validator := validator.New()

	subscriptionGroup.Get("/", func(c *fiber.Ctx) error {
		subscriptions, err := srv.Database.SubscriptionDB.GetAllSubscriptions()
		if err != nil {
			c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(subscriptions)
	})

	authenticatedGroup := subscriptionGroup.Group("/", middleware.JWTMiddleware(srv.JWTSecret))

	authenticatedGroup.Get("/active", func(c *fiber.Ctx) error {
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		subscription, err := srv.Database.SubscriptionDB.GetActiveSubscription(email)
		if err != nil {
			if err == database.ErrUserSubscriptionNotFound {
				return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(subscription)
	})

	authenticatedGroup.Post("/buy", func(c *fiber.Ctx) error {
		var subscription models.UserSubscription
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		if err := c.BodyParser(&subscription); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}
		if err := validator.Struct(subscription); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": ErrValidationFailed.Error()})
		}

		endDate, err := srv.Database.SubscriptionDB.BuySubscription(email, string(subscription.SubscriptionName))
		if err != nil {
			if err == database.ErrInvalidSubscriptionName {
				return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{
			"message":  fmt.Sprintf("successfully bought a %s subscription", subscription.SubscriptionName),
			"end_date": endDate,
		})
	})

	authenticatedGroup.Put("/cancel", func(c *fiber.Ctx) error {
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		err := srv.Database.SubscriptionDB.CancelSubscription(email)
		if err != nil {
			if err == database.ErrInvalidSubscriptionName {
				return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{
			"message": fmt.Sprintf("successfully cancelled current subscription"),
		})
	})
}
