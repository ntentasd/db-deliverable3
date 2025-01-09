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

func (db *TripDB) GetAllTripsForUser(email string, page, pageSize int) ([]models.PayloadTrip, int, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT t.id, t.user_email, t.car_license_plate, t.start_time, t.end_time,
			t.driving_behavior, t.distance,
			COALESCE(p.amount, 0) as amount,
			COALESCE(p.payment_method, '') as payment_method,
			COUNT(*) OVER() as trip_count
		FROM Trips t
		LEFT JOIN Payments p
		ON t.id = p.trip_id
		WHERE t.user_email = ?
		ORDER BY t.start_time DESC
		LIMIT ? OFFSET ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, email, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var trips []models.PayloadTrip
	var amount sql.NullFloat64
	var count int
	for rows.Next() {
		var trip models.PayloadTrip
		if err := rows.Scan(
			&trip.ID,
			&trip.UserEmail,
			&trip.CarLicensePlate,
			&trip.StartTime,
			&trip.EndTime,
			&trip.DrivingBehavior,
			&trip.Distance,
			&amount,
			&trip.PaymentMethod,
			&count,
		); err != nil {
			return nil, 0, err
		}

		if amount.Valid {
			trip.Amount = amount.Float64
		} else {
			trip.Amount = 0
		}

		trips = append(trips, trip)
	}

	return trips, count, nil
}

func (db *TripDB) GetActiveTrip(email string) (models.Trip, error) {
	query := `
		SELECT *
		FROM Trips
		WHERE user_email = ? AND end_time IS NULL
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var trip models.Trip

	err := db.DB.QueryRowContext(ctx, query, email).Scan(
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

func (db *TripDB) EndTrip(tx *sql.Tx, email string, distance, driving_behavior float64) error {
	query := `
		UPDATE Trips
		SET
			end_time = NOW(),
			distance = ?,
			driving_behavior = ?
		WHERE user_email = ? AND end_time IS NULL
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if tx != nil {
		_, err := tx.ExecContext(ctx, query, distance, driving_behavior, email)
		return err
	}

	_, err := db.DB.ExecContext(ctx, query, distance, driving_behavior, email)
	return err
}

func (db *TripDB) FindActiveTripCar(email string) (int, string, float64, error) {
	query := `
		SELECT trip_id, license_plate, cost_per_km
		FROM UserCarTrip
		WHERE email = ?
		AND end_time IS NULL
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var tripID int
	var licensePlate string
	var costPerKm float64
	err := db.DB.QueryRowContext(ctx, query, email).Scan(
		&tripID,
		&licensePlate,
		&costPerKm,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, "", 0, ErrCarNotFound
		}
		return 0, "", 0, err
	}

	return tripID, licensePlate, costPerKm, nil
}

func (db *TripDB) GetTripByID(id, email string) (models.Trip, float64, error) {
	query := `
			SELECT t.id, t.user_email, t.car_license_plate, t.start_time,
				t.end_time, t.driving_behavior, t.distance, c.cost_per_km
			FROM Trips t
			LEFT JOIN Cars c
			ON t.car_license_plate = c.license_plate
			WHERE t.id = ?
			AND t.user_email = ?
			GROUP BY t.id, t.user_email, t.car_license_plate, t.start_time,
				t.end_time, t.driving_behavior, t.distance, c.cost_per_km
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var trip models.Trip
	var costPerKm float64
	err := db.DB.QueryRowContext(ctx, query, id, email).Scan(
		&trip.ID,
		&trip.UserEmail,
		&trip.CarLicensePlate,
		&trip.StartTime,
		&trip.EndTime,
		&trip.DrivingBehavior,
		&trip.Distance,
		&costPerKm,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Trip{}, 0, ErrTripNotFound
		}
		return models.Trip{}, 0, err
	}

	return trip, costPerKm, nil
}

func (db *TripDB) GetTotalTripCountForUser(email string) (int, error) {
	var count int
	query := `
		SELECT COUNT(*)
		FROM trips
		WHERE user_email = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := db.DB.QueryRowContext(ctx, query, email).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}
