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
	"github.com/ntentasd/db-deliverable3/internal/models"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrValidationFailed = fmt.Errorf("validation failed")

	AdminUser  = fmt.Sprintf("Admin")
	ClientUser = fmt.Sprintf("Client")
)

func (srv *Server) SetupUserRoutes() {
	userGroup := srv.FiberApp

	validator := validator.New()

	authenticatedGroup := userGroup.Group("/user", middleware.JWTMiddleware(srv.JWTSecret))

	userGroup.Post("/login", func(c *fiber.Ctx) error {
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

		if isAdmin(payload.Email, payload.Password) {
			token, err := generateJWT(payload.Email, AdminUser, srv.JWTSecret)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
			}
			return c.JSON(fiber.Map{"token": token})
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

		token, err := generateJWT(user.Email, ClientUser, srv.JWTSecret)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
		}

		return c.JSON(fiber.Map{"token": token})
	})

	userGroup.Post("/signup", func(c *fiber.Ctx) error {
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

		if payload.Email == "admin@datadrive.com" {
			c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": database.ErrDuplicateEmail})
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
		if err != nil {
			c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		user, err := srv.Database.UserDB.CreateUser(payload.Email, payload.UserName, payload.FullName, string(hashedPassword))
		if err != nil {
			if errors.Is(err, database.ErrDuplicateEmail) {
				return c.Status(http.StatusConflict).JSON(fiber.Map{"error": err.Error()})
			}
			if errors.Is(err, database.ErrDuplicateUsername) {
				return c.Status(http.StatusConflict).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		token, err := generateJWT(user.Email, ClientUser, srv.JWTSecret)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to generate token"})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{
			"message": "user created successfully",
			"user":    user,
			"token":   token,
		})
	})

	authenticatedGroup.Get("/", func(c *fiber.Ctx) error {
		email, ok := c.Locals(string(middleware.Email)).(string)
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
		email, ok := c.Locals(string(middleware.Email)).(string)
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
		email, ok := c.Locals(string(middleware.Email)).(string)
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
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		err := srv.Database.UserDB.DeleteUser(email)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete user"})
		}

		return c.JSON(fiber.Map{"message": "user deleted successfully"})
	})

	// -- Settings --
	authenticatedGroup.Get("/settings", func(c *fiber.Ctx) error {
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}

		settings, err := srv.Database.SettingDB.GetSettings(email)
		if err != nil {
			if err == database.ErrSettingsNotFound {
				return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
			}
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(settings)
	})

	authenticatedGroup.Post("/settings", func(c *fiber.Ctx) error {
		var settings models.Settings
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		if err := c.BodyParser(&settings); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid payload"})
		}
		err := srv.Database.SettingDB.CreateSettings(email, settings)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.Status(http.StatusCreated).JSON(fiber.Map{"message": "settings created"})
	})

	authenticatedGroup.Put("/settings", func(c *fiber.Ctx) error {
		var settings models.Settings
		email, ok := c.Locals(string(middleware.Email)).(string)
		if !ok {
			return c.Status(http.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
		}
		if err := c.BodyParser(&settings); err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid payload"})
		}
		err := srv.Database.SettingDB.UpdateSetting(email, settings)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{"message": "settings updated"})
	})
}

func validatePassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func isAdmin(email, password string) bool {
	if email == "admin@datadrive.com" && password == "password" {
		return true
	}
	return false
}

func generateJWT(email, role, jwtSecret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": email,
		"role":  role,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}
