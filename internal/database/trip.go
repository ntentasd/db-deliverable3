package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/ntentasd/db-deliverable3/internal/models"
)

type TripDB struct {
	DB *sql.DB
}

var (
	ErrTripNotFound = fmt.Errorf("trip not found")
)

func NewTripDatabase(db *sql.DB) *TripDB {
	return &TripDB{DB: db}
}

func (db *TripDB) GetAllTripsForCar(licensePlate string, page, pageSize int) ([]models.Trip, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT *
		FROM Trips
		WHERE car_license_plate = ?
		LIMIT ? OFFSET ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, licensePlate, pageSize, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var trips []models.Trip
	for rows.Next() {
		var trip models.Trip
		if err := rows.Scan(
			&trip.ID,
			&trip.UserEmail,
			&trip.CarLicensePlate,
			&trip.StartTime,
			&trip.EndTime,
			&trip.DrivingBehavior,
			&trip.Distance,
		); err != nil {
			return nil, err
		}
		trips = append(trips, trip)
	}

	return trips, nil
}

func (db *TripDB) GetAllTripsForUser(email string, page, pageSize int) ([]models.Trip, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT *
		FROM Trips
		WHERE user_email = ?
		LIMIT ? OFFSET ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, email, pageSize, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var trips []models.Trip
	for rows.Next() {
		var trip models.Trip
		if err := rows.Scan(
			&trip.ID,
			&trip.UserEmail,
			&trip.CarLicensePlate,
			&trip.StartTime,
			&trip.EndTime,
			&trip.DrivingBehavior,
			&trip.Distance,
		); err != nil {
			return nil, err
		}
		trips = append(trips, trip)
	}

	return trips, nil
}

func (db *TripDB) CreateTrip(tx *sql.Tx, email, licensePlate string) error {
	query := `
		INSERT INTO 
		Trips (user_email, car_license_plate, start_time)
		VALUES (?, ?, NOW())
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if tx != nil {
		_, err := tx.ExecContext(ctx, query, email, licensePlate)
		return err
	}

	_, err := db.DB.ExecContext(ctx, query, email, licensePlate)
	return err
}

func (db *TripDB) EndTrip(tx *sql.Tx, email string) error {
	query := `
		UPDATE Trips
		SET end_time = NOW()
		WHERE user_email = ? AND end_time IS NULL
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if tx != nil {
		_, err := tx.ExecContext(ctx, query, email)
		return err
	}

	_, err := db.DB.ExecContext(ctx, query, email)
	return err
}

func (db *TripDB) FindActiveTripCar(email string) (models.Car, error) {
	query1 := `
		SELECT car_license_plate
		FROM Trips
		WHERE user_email = ? AND end_time IS NULL
	`

	query2 := `
		SELECT *
		FROM Cars
		WHERE license_plate = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var car models.Car
	var licensePlate string

	err := db.DB.QueryRowContext(ctx, query1, email).Scan(&licensePlate)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Car{}, ErrCarNotFound
		}
		return models.Car{}, err
	}

	err = db.DB.QueryRowContext(ctx, query2, licensePlate).Scan(
		&car.LicensePlate,
		&car.Make,
		&car.Model,
		&car.Status,
		&car.CostPerKm,
		&car.Location,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Car{}, ErrCarNotFound
		}
		return models.Car{}, err
	}

	return car, nil
}

func (db *TripDB) GetTripByID(id string) (models.Trip, error) {
	query := `
			SELECT id, user_email, car_license_plate, start_time, end_time, driving_behavior, distance
			FROM Trips
			WHERE id = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var trip models.Trip
	err := db.DB.QueryRowContext(ctx, query, id).Scan(
		&trip.ID,
		&trip.UserEmail,
		&trip.CarLicensePlate,
		&trip.StartTime,
		&trip.EndTime,
		&trip.DrivingBehavior,
		&trip.Distance,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Trip{}, ErrTripNotFound
		}
		return models.Trip{}, err
	}

	return trip, nil
}

func (db *TripDB) GetTotalTripCountForUser(email string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM trips WHERE user_email = ?`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := db.DB.QueryRowContext(ctx, query, email).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
