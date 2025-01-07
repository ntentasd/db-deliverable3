package models

import (
	"time"

	_ "github.com/go-playground/validator/v10"
)

type Trip struct {
	ID              int64      `json:"id"`
	UserEmail       string     `json:"user_email" validate:"required,email,max=45"`
	CarLicensePlate string     `json:"car_license_plate" validate:"required,len=7,alphanum"`
	StartTime       time.Time  `json:"start_time" validate:"required"`
	EndTime         *time.Time `json:"end_time,omitempty" validate:"omitempty,gtfield=StartTime"`
	DrivingBehavior *float64   `json:"driving_behavior,omitempty" validate:"omitempty,min=0,max=1"`
	Distance        *float64   `json:"distance,omitempty" validate:"omitempty,gt=0"`
}

type PayloadTrip struct {
	ID              int64         `json:"id"`
	UserEmail       string        `json:"user_email"`
	CarLicensePlate string        `json:"car_license_plate"`
	StartTime       time.Time     `json:"start_time"`
	EndTime         *time.Time    `json:"end_time,omitempty"`
	DrivingBehavior *float64      `json:"driving_behavior,omitempty"`
	Distance        *float64      `json:"distance,omitempty"`
	Amount          float64       `json:"amount"`
	PaymentMethod   PaymentMethod `json:"payment_method"`
}
