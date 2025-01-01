package models

type Damage struct {
	ID              int     `json:"id"`
	CarLicensePlate string  `json:"car_license_plate"`
	Description     string  `json:"description"`
	ReportedDate    string  `json:"reported_date"`
	RepairCost      float64 `json:"repair_cost"`
	Repaired        bool    `json:"repaired"`
}
