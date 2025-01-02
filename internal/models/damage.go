package models

type Damage struct {
	ID              int64    `json:"id" validate:"required,gt=0"`
	CarLicensePlate string   `json:"car_license_plate" validate:"required,len=7,alphanum"`
	ReportedDate    string   `json:"reported_date" validate:"required,datetime=2006-01-02"`
	Description     string   `json:"description,omitempty" validate:"omitempty,max=16777215"`
	Repaired        bool     `json:"repaired" validate:"required"`
	RepairCost      *float64 `json:"repair_cost,omitempty" validate:"omitempty,gt=0"`
}
