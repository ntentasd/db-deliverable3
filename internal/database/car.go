package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/bradfitz/gomemcache/memcache"
	"github.com/go-sql-driver/mysql"
	"github.com/ntentasd/db-deliverable3/internal/memcached"
	"github.com/ntentasd/db-deliverable3/internal/models"
)

type CarDB struct {
	DB       *sql.DB
	Cache    *memcached.Client
	CacheTTL int32
}

var (
	ErrCarNotFound           = fmt.Errorf("car not found")
	ErrInvalidPageNumber     = fmt.Errorf("invalid page number")
	ErrInvalidPageSize       = fmt.Errorf("invalid page size")
	ErrDuplicateLicensePlate = fmt.Errorf("car with this license plate already exists")
	ErrInvalidStatusChange   = fmt.Errorf("cannot change car's status to/from rented")
)

func NewCarDatabase(db *sql.DB, cache *memcached.Client, cacheTTL int32) *CarDB {
	return &CarDB{DB: db, Cache: cache, CacheTTL: cacheTTL}
}

func (db *CarDB) GetAllCars(page, pageSize int) ([]models.Car, int, error) {
	cacheKey := fmt.Sprintf("cars:page=%d:size=%d", page, pageSize)

	if cachedData, err := db.Cache.Get(cacheKey); err == nil {
		fmt.Printf("Cache hit for key: %s\n", cacheKey)
		var cachedResult struct {
			Cars  []models.Car
			Count int
		}
		if err := json.Unmarshal(cachedData, &cachedResult); err == nil {
			return cachedResult.Cars, cachedResult.Count, nil
		}
	} else {
		fmt.Printf("Cache miss for key: %s. Error: %v\n", cacheKey, err)
	}

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

	result := struct {
		Cars  []models.Car
		Count int
	}{
		Cars:  cars,
		Count: count,
	}
	cachedData, _ := json.Marshal(result)
	err = db.Cache.Set(cacheKey, cachedData, db.CacheTTL)
	if err != nil {
		fmt.Printf("Failed to set cache: %v\n", err)
	} else {
		fmt.Printf("Data cached successfully with key: %s\n", cacheKey)
	}

	return cars, count, nil
}

func (db *CarDB) GetAllAvailableCars(page, pageSize int) ([]models.Car, int, error) {
	cacheKey := fmt.Sprintf("availCars:page=%d:size=%d", page, pageSize)

	if cachedData, err := db.Cache.Get(cacheKey); err == nil {
		fmt.Printf("Cache hit for key: %s\n", cacheKey)
		var cachedResult struct {
			Cars  []models.Car
			Count int
		}
		if err := json.Unmarshal(cachedData, &cachedResult); err == nil {
			return cachedResult.Cars, cachedResult.Count, nil
		}
	} else {
		fmt.Printf("Cache miss for key: %s. Error: %v\n", cacheKey, err)
	}

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

	result := struct {
		Cars  []models.Car
		Count int
	}{
		Cars:  cars,
		Count: count,
	}
	cachedData, _ := json.Marshal(result)
	err = db.Cache.Set(cacheKey, cachedData, db.CacheTTL)
	if err != nil {
		fmt.Printf("Failed to set cache: %v\n", err)
	} else {
		fmt.Printf("Data cached successfully with key: %s\n", cacheKey)
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
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			return ErrDuplicateLicensePlate
		}
	}
	return nil
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
	statusQuery := `
    SELECT status
    FROM Cars
    WHERE license_plate = ?
  `

	query := `
		UPDATE Cars
		SET make = ?, model = ?, status = ?, cost_per_km = ?, location = ?
		WHERE license_plate = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var prevStatus string
	err := db.DB.QueryRowContext(ctx, statusQuery, car.LicensePlate).Scan(&prevStatus)
	if err != nil {
		return models.Car{}, err
	}

	if prevStatus == "RENTED" || car.Status == "RENTED" {
		return models.Car{}, ErrInvalidStatusChange
	}

	_, err = db.DB.ExecContext(ctx,
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

func (db *CarDB) InvalidateCars(page, pageSize int) error {
	cacheKeys := []string{
		fmt.Sprintf("cars:page=%d:size=%d", page, pageSize),
		fmt.Sprintf("availCars:page=%d:size=%d", page, pageSize),
	}

	for _, cacheKey := range cacheKeys {
		err := db.Cache.Delete(cacheKey)
		if err != nil {
			if err == memcache.ErrCacheMiss {
				fmt.Printf("Cache key %s not found\n", cacheKey)
			} else {
				return fmt.Errorf("failed to delete cache key %s: %v\n", cacheKey, err)
			}
		} else {
			fmt.Printf("Cache invalidated for key: %s\n", cacheKey)
		}
	}
	return nil
}
