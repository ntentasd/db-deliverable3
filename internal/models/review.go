package models

import (
	"time"

	_ "github.com/go-playground/validator/v10"
)

type Review struct {
	TripID    int64     `json:"trip_id" validate:"required,gt=0"`
	Rating    int       `json:"rating" validate:"required,min=1,max=5"`
	Comment   string    `json:"comment,omitempty" validate:"omitempty,max=255"`
	CreatedAt time.Time `json:"created_at"`
}
