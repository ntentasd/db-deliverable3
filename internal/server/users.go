package server

import (
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/ntentasd/db-deliverable3/internal/database"
	"github.com/ntentasd/db-deliverable3/internal/middleware"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrValidationFailed = fmt.Errorf("validation failed")
)

func (srv *Server) SetupUserRoutes() {
	validator := validator.New()

	baseGroup := srv.FiberApp
	authenticatedGroup := baseGroup.Group("/user", middleware.JWTMiddleware(srv.JWTSecret))

	baseGroup.Post("/login", func(c *fiber.Ctx) error {
		var payload struct {
			Email    string `json:"email" validate:"required,email"`
			Password string `json:"password" validate:"required"`
		}
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}
		if err := validator.Struct(payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": ErrValidationFailed.Error()})
		}

		user, err := srv.Database.UserDB.GetUserByEmail(payload.Email)
		if err != nil {
			if err == database.ErrUserNotFound {
				c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrInvalidCredentials.Error()})
			}
			c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		if user.Email == "" || user.Password == "" || !validatePassword(user.Password, payload.Password) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": database.ErrInvalidCredentials.Error()})
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"email": user.Email,
			"exp":   time.Now().Add(time.Hour * 24).Unix(),
		})
		tokenString, err := token.SignedString([]byte(srv.JWTSecret))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
		}

		return c.JSON(fiber.Map{"token": tokenString})
	})

	baseGroup.Post("/signup", func(c *fiber.Ctx) error {
		var payload struct {
			Email    string `json:"email" validate:"required,email"`
			UserName string `json:"username" validate:"required"`
			FullName string `json:"full_name" validate:"required"`
			Password string `json:"password" validate:"required"`
		}
		if err := c.BodyParser(&payload); err != nil {
			c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}
		if err := validator.Struct(payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": ErrValidationFailed.Error()})
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
		if err != nil {
			c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		user, err := srv.Database.UserDB.CreateUser(payload.Email, payload.UserName, payload.FullName, string(hashedPassword))
		if err != nil {
			if errors.Is(err, database.ErrDuplicateEntry) {
				return c.Status(http.StatusConflict).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"email": payload.Email,
			"exp":   time.Now().Add(time.Hour * 24).Unix(),
		})
		tokenString, err := token.SignedString([]byte(srv.JWTSecret))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{
			"message": "user created successfully",
			"user":    user,
			"token":   tokenString,
		})
	})

	authenticatedGroup.Get("/", func(c *fiber.Ctx) error {
		email, ok := c.Locals(string(middleware.UserEmailKey)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		user, err := srv.Database.UserDB.GetUserDetails(email)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch user details"})
		}

		return c.JSON(user)
	})

	authenticatedGroup.Put("/username", func(c *fiber.Ctx) error {
		var payload struct {
			UserName string `json:"username" validate:"required"`
		}
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}

		if err := validator.Struct(payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": ErrValidationFailed.Error()})
		}
		email, ok := c.Locals(string(middleware.UserEmailKey)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		err := srv.Database.UserDB.UpdateUsername(email, payload.UserName)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update username"})
		}

		return c.JSON(fiber.Map{"message": "username updated successfully"})
	})

	authenticatedGroup.Put("/full_name", func(c *fiber.Ctx) error {
		var payload struct {
			FullName string `json:"full_name" validate:"required"`
		}
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
		}

		if err := validator.Struct(payload); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": ErrValidationFailed.Error()})
		}
		email, ok := c.Locals(string(middleware.UserEmailKey)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		err := srv.Database.UserDB.UpdateFullname(email, payload.FullName)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update full_name"})
		}

		return c.JSON(fiber.Map{"message": "full_name updated successfully"})
	})

	authenticatedGroup.Delete("/", func(c *fiber.Ctx) error {
		email, ok := c.Locals(string(middleware.UserEmailKey)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		err := srv.Database.UserDB.DeleteUser(email)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete user"})
		}

		return c.JSON(fiber.Map{"message": "user deleted successfully"})
	})
}

func validatePassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}
