package models

import (
	_ "github.com/go-playground/validator/v10"
)

type Service struct {
	ID              int64    `json:"id" validate:"required,gt=0"`
	CarLicensePlate string   `json:"car_license_plate" validate:"required,len=7,alphanum"`
	ServiceDate     string   `json:"service_date" validate:"required,datetime=2006-01-02"`
	Description     string   `json:"description,omitempty" validate:"omitempty,max=16777215"`
	ServiceCost     *float64 `json:"service_cost,omitempty" validate:"omitempty,gt=0"`
}
