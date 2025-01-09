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

func (db *CarDB) GetAllCars(page, pageSize int) ([]models.Car, int, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT *,
		COUNT(*) OVER() as total_cars
		FROM Cars
		LIMIT ? OFFSET ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var cars []models.Car
	var count int
	for rows.Next() {
		var car models.Car
		if err := rows.Scan(
			&car.LicensePlate,
			&car.Make,
			&car.Model,
			&car.Status,
			&car.CostPerKm,
			&car.Location,
			&count,
		); err != nil {
			return nil, 0, err
		}
		cars = append(cars, car)
	}
	return cars, count, nil
}

func (db *CarDB) GetAllAvailableCars(page, pageSize int) ([]models.Car, int, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT *,
		COUNT(*) OVER() as total_available_cars
		FROM Cars
		WHERE status = 'AVAILABLE'
		LIMIT ? OFFSET ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var cars []models.Car
	var count int
	for rows.Next() {
		var car models.Car
		if err := rows.Scan(
			&car.LicensePlate,
			&car.Make,
			&car.Model,
			&car.Status,
			&car.CostPerKm,
			&car.Location,
			&count,
		); err != nil {
			return nil, 0, err
		}
		cars = append(cars, car)
	}
	return cars, count, nil
}

func (db *CarDB) GetAllRentedCars(page, pageSize int) ([]models.Car, int, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT *,
		COUNT(*) OVER() as total_available_cars
		FROM Cars
		WHERE status = 'RENTED'
		LIMIT ? OFFSET ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var cars []models.Car
	var count int
	for rows.Next() {
		var car models.Car
		if err := rows.Scan(
			&car.LicensePlate,
			&car.Make,
			&car.Model,
			&car.Status,
			&car.CostPerKm,
			&car.Location,
			&count,
		); err != nil {
			return nil, 0, err
		}
		cars = append(cars, car)
	}
	return cars, count, nil
}

func (db *CarDB) GetAllMaintenanceCars(page, pageSize int) ([]models.Car, int, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT *,
		COUNT(*) OVER() as total_available_cars
		FROM Cars
		WHERE status = 'MAINTENANCE'
		LIMIT ? OFFSET ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var cars []models.Car
	var count int
	for rows.Next() {
		var car models.Car
		if err := rows.Scan(
			&car.LicensePlate,
			&car.Make,
			&car.Model,
			&car.Status,
			&car.CostPerKm,
			&car.Location,
			&count,
		); err != nil {
			return nil, 0, err
		}
		cars = append(cars, car)
	}
	return cars, count, nil
}

func (db *CarDB) GetCarByLicensePlate(licensePlate string) (models.Car, error) {
	query := "SELECT * FROM Cars WHERE license_plate = ?"
	row := db.DB.QueryRow(query, licensePlate)

	var car models.Car
	if err := row.Scan(
		&car.LicensePlate, &car.Make, &car.Model, &car.Status, &car.CostPerKm, &car.Location,
	); err != nil {
		if err == sql.ErrNoRows {
			return models.Car{}, ErrCarNotFound
		}
		return models.Car{}, err
	}
	return car, nil
}

func (db *CarDB) InsertCar(car models.Car) error {
	query := `
		INSERT INTO
		Cars (license_plate, make, model, status, cost_per_km, location)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	_, err := db.DB.Exec(query, strings.ToUpper(car.LicensePlate), car.Make, car.Model, car.Status, car.CostPerKm, strings.ToUpper(car.Location))
	return err
}

func (db *CarDB) UpdateCarStatus(tx *sql.Tx, licensePlate, status string) error {
	query := `
		UPDATE Cars
		SET status = ?
		WHERE license_plate = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if tx != nil {
		_, err := tx.ExecContext(ctx, query, status, strings.ToUpper(licensePlate))
		return err
	}

	_, err := db.DB.ExecContext(ctx, query, status, strings.ToUpper(licensePlate))
	return err
}

func (db *CarDB) UpdateCar(car models.Car) (models.Car, error) {
	query := `
		UPDATE Cars
		SET make = ?, model = ?, status = ?, cost_per_km = ?, location = ?
		WHERE license_plate = ?
	`

	_, err := db.DB.Exec(
		query,
		car.Make,
		car.Model,
		car.Status,
		car.CostPerKm,
		strings.ToUpper(car.Location),
		strings.ToUpper(car.LicensePlate),
	)
	if err != nil {
		return models.Car{}, err
	}

	return models.Car{
		LicensePlate: car.LicensePlate,
		Make:         car.Make,
		Model:        car.Model,
		Status:       car.Status,
		CostPerKm:    car.CostPerKm,
		Location:     car.Location,
	}, err
}

var (
	ErrCarNotFound       = fmt.Errorf("car not found")
	ErrInvalidPageNumber = fmt.Errorf("invalid page number")
	ErrInvalidPageSize   = fmt.Errorf("invalid page size")
)

func (db *CarDB) DeleteCar(licensePlate string) (models.Car, error) {
	var car models.Car
	query := `
		SELECT license_plate, make, model, cost_per_km, location
		FROM Cars
		WHERE license_plate = ?
	`
	err := db.DB.QueryRow(query, strings.ToUpper(licensePlate)).Scan(&car.LicensePlate, &car.Make, &car.Model, &car.CostPerKm, &car.Location)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Car{}, ErrCarNotFound
		}
		return models.Car{}, err
	}

	deleteQuery := `
		DELETE FROM Cars
		WHERE license_plate = ?
	`
	_, err = db.DB.Exec(deleteQuery, strings.ToUpper(licensePlate))
	if err != nil {
		return models.Car{}, err
	}

	return car, nil
}

func (db *CarDB) GetTotalAvailableCarCount() (int, error) {
	var count int
	query := `
		SELECT COUNT(*)
		FROM Cars
		WHERE status = 'AVAILABLE'
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := db.DB.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
