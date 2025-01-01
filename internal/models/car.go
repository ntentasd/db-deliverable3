package models

import (
	"strings"

	_ "github.com/go-playground/validator/v10"
)

type Status string

type Car struct {
	LicensePlate string  `json:"license_plate" db:"license_plate" validate:"required"`
	Make         string  `json:"make" db:"make" validate:"required"`
	Model        string  `json:"model" db:"model" validate:"required"`
	Status       Status  `json:"status,omitempty" db:"status"` // This will not be part of the request
	CostPerKm    float64 `json:"cost_per_km" db:"cost_per_km" validate:"required,gt=0"`
	Location     string  `json:"location" db:"location" validate:"required"`
}

func (s Status) String() string {
	return string(s)
}

func (s Status) ValidateStatus() bool {
	switch strings.ToUpper(s.String()) {
	case "AVAILABLE", "RENTED", "MAINTENANCE":
		return true
	}
	return false
}
