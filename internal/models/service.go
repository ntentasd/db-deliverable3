package models

type Service struct {
	ID              int     `json:"id"`
	CarLicensePlate string  `json:"car_license_plate"`
	Description     string  `json:"description"`
	ServiceDate     string  `json:"service_date"`
	ServiceCost     float64 `json:"service_cost"`
}
