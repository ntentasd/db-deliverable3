package models

import (
	_ "github.com/go-playground/validator/v10"
)

type Damage struct {
	ID              int64    `json:"id"`
	CarLicensePlate string   `json:"license_plate" validate:"required,len=7,alphanum"`
	ReportedDate    string   `json:"reported_date" validate:"required,datetime=2006-01-02"`
	Description     string   `json:"description,omitempty" validate:"omitempty,max=16777215"`
	Repaired        bool     `json:"repaired" validate:"required"`
	RepairCost      *float64 `json:"repair_cost,omitempty" validate:"omitempty,gt=0"`
}
