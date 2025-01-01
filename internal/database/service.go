package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/ntentasd/db-deliverable3/internal/models"
)

type ServiceDB struct {
	DB *sql.DB
}

// NewServiceDB initializes the ServiceDB struct
func NewServiceDB(db *sql.DB) *ServiceDB {
	return &ServiceDB{DB: db}
}

// GetServicesByLicensePlate retrieves all services for a specific car
func (db *ServiceDB) GetServicesByLicensePlate(licensePlate string) ([]models.Service, error) {
	query := `
		SELECT id, description, service_date, service_cost 
		FROM Services 
		WHERE car_license_plate = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, licensePlate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var services []models.Service
	for rows.Next() {
		var service models.Service
		if err := rows.Scan(
			&service.ID,
			&service.Description,
			&service.ServiceDate,
			&service.ServiceCost,
		); err != nil {
			return nil, err
		}
		services = append(services, service)
	}

	return services, nil
}

// AddService adds a new service entry to the database
func (db *ServiceDB) AddService(service models.Service) error {
	query := `
		INSERT INTO Services (car_license_plate, description, service_date, service_cost) 
		VALUES (?, ?, ?, ?)
	`

	_, err := db.DB.Exec(query,
		service.CarLicensePlate,
		service.Description,
		service.ServiceDate,
		service.ServiceCost,
	)

	return err
}
