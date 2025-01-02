package models

import (
	_ "github.com/go-playground/validator/v10"
)

type Status string

const (
	Available   Status = "AVAILABLE"
	Rented      Status = "RENTED"
	Maintenance Status = "MAINTENANCE"
)

type Car struct {
	LicensePlate string   `json:"license_plate" validate:"required,len=7,alphanum"`
	Make         string   `json:"make" validate:"required,max=45"`
	Model        string   `json:"model" validate:"required,max=45"`
	Status       Status   `json:"status" validate:"required,oneof=AVAILABLE RENTED MAINTENANCE"`
	CostPerKm    *float64 `json:"cost_per_km,omitempty" validate:"omitempty,gt=0"`
	Location     string   `json:"location,omitempty" validate:"omitempty,max=255"`
}
