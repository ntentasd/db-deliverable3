package models

import (
	"time"

	_ "github.com/go-playground/validator/v10"
)

type User struct {
	Email           string    `json:"email" validate:"required,email,max=45"`
	UserName        string    `json:"user_name" db:"username" validate:"required,max=45"`
	FullName        string    `json:"full_name,omitempty" validate:"omitempty,max=45"`
	Password        string    `json:"password" validate:"required,min=8,max=255"`
	DrivingBehavior *float64  `json:"driving_behavior,omitempty" validate:"omitempty,min=0,max=10"`
	CreatedAt       time.Time `json:"created_at"`
}
