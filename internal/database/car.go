package database

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/ntentasd/db-deliverable3/internal/models"
)

type CarDB struct {
	DB *sql.DB
}

func NewCarDatabase(db *sql.DB) *CarDB {
	return &CarDB{DB: db}
}

func (db *CarDB) GetAllCars() ([]models.Car, error) {
	query := `SELECT * FROM Cars`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cars []models.Car
	for rows.Next() {
		var car models.Car
		if err := rows.Scan(
			&car.LicensePlate, &car.Make, &car.Model, &car.Status, &car.CostPerKm, &car.Location,
		); err != nil {
			return nil, err
		}
		cars = append(cars, car)
	}
	return cars, nil
}

// Get car by license plate
func (db *CarDB) GetCarByLicensePlate(licensePlate string) (*models.Car, error) {
	query := "SELECT * FROM Cars WHERE license_plate = ?"
	row := db.DB.QueryRow(query, licensePlate)

	var car models.Car
	if err := row.Scan(
		&car.LicensePlate, &car.Make, &car.Model, &car.Status, &car.CostPerKm, &car.Location,
	); err != nil {
		return nil, err
	}
	return &car, nil
}

// Insert new car
func (db *CarDB) InsertCar(car models.Car) error {
	query := "INSERT INTO Cars (license_plate, make, model, status, cost_per_km, location) VALUES (?, ?, ?, ?, ?, ?)"
	_, err := db.DB.Exec(query, strings.ToUpper(car.LicensePlate), car.Make, car.Model, car.Status, car.CostPerKm, strings.ToUpper(car.Location))
	return err
}

// Update car status
func (db *CarDB) UpdateCarStatus(licensePlate, status string) error {
	query := "UPDATE Cars SET status = ? WHERE license_plate = ?"
	_, err := db.DB.Exec(query, status, strings.ToUpper(licensePlate))
	return err
}

var (
	ErrCarNotFound = fmt.Errorf("car not found")
)

func (db *CarDB) DeleteCar(licensePlate string) (models.Car, error) {
	// First, retrieve the car's data before deletion
	var car models.Car
	query := "SELECT license_plate, make, model, cost_per_km, location FROM Cars WHERE license_plate = ?"
	err := db.DB.QueryRow(query, strings.ToUpper(licensePlate)).Scan(&car.LicensePlate, &car.Make, &car.Model, &car.CostPerKm, &car.Location)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Car{}, ErrCarNotFound
		}
		return models.Car{}, err
	}

	// Delete the car
	deleteQuery := "DELETE FROM Cars WHERE license_plate = ?"
	_, err = db.DB.Exec(deleteQuery, strings.ToUpper(licensePlate))
	if err != nil {
		return models.Car{}, err
	}

	// Return the deleted car data
	return car, nil
}
