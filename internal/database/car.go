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
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"

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

func (db *CarDB) GetAllCars(ctx context.Context, page, pageSize int) ([]models.Car, int, error) {
	tracer := otel.Tracer("database")
	_, span := tracer.Start(ctx, "GetAllCarsQuery")
	defer span.End()

	cacheKey := fmt.Sprintf("cars:page=%d:size=%d", page, pageSize)

	if cachedData, err := db.Cache.Get(cacheKey); err == nil {
		var cachedResult struct {
			Cars  []models.Car
			Count int
		}
		if err := json.Unmarshal(cachedData, &cachedResult); err == nil {
			return cachedResult.Cars, cachedResult.Count, nil
		}
		span.AddEvent("Cache hit", trace.WithAttributes(
			attribute.String("cache.key", cacheKey),
		))
	} else {
		span.AddEvent("Cache miss", trace.WithAttributes(
			attribute.String("cache.key", cacheKey),
		))
	}

	offset := (page - 1) * pageSize

	query := `
		SELECT *,
		COUNT(*) OVER() as total_cars
		FROM Cars
		LIMIT ? OFFSET ?
	`

	span.SetAttributes(
		attribute.String("query", query),
		attribute.Int("query.page", page),
		attribute.Int("query.page_size", pageSize),
	)

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		span.RecordError(err)
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
			span.RecordError(err)
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
		span.AddEvent("Failed to set cache", trace.WithAttributes(attribute.String("error", err.Error())))
	} else {
		span.AddEvent("Data cached successfully")
	}

	return cars, count, nil
}

func (db *CarDB) GetAllAvailableCars(ctx context.Context, page, pageSize int) ([]models.Car, int, error) {
	tracer := otel.Tracer("database")
	ctx, span := tracer.Start(ctx, "GetAllAvailableCarsQuery")
	defer span.End()

	cacheKey := fmt.Sprintf("availCars:page=%d:size=%d", page, pageSize)

	if cachedData, err := db.Cache.Get(cacheKey); err == nil {
		var cachedResult struct {
			Cars  []models.Car
			Count int
		}
		if err := json.Unmarshal(cachedData, &cachedResult); err == nil {
			return cachedResult.Cars, cachedResult.Count, nil
		}
		span.AddEvent("Cache hit", trace.WithAttributes(
			attribute.String("cache.key", cacheKey),
		))
	} else {
		span.AddEvent("Cache miss", trace.WithAttributes(
			attribute.String("cache.key", cacheKey),
		))
	}

	offset := (page - 1) * pageSize

	query := `
		SELECT *,
		COUNT(*) OVER() as total_available_cars
		FROM Cars
		WHERE status = 'AVAILABLE'
		LIMIT ? OFFSET ?
	`

	span.SetAttributes(
		attribute.String("query", query),
		attribute.Int("query.page", page),
		attribute.Int("query.page_size", pageSize),
	)

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		span.RecordError(err)
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
			span.RecordError(err)
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
		span.AddEvent("Failed to set cache", trace.WithAttributes(attribute.String("error", err.Error())))
	} else {
		span.AddEvent("Data cached successfully", trace.WithAttributes(
			attribute.String("cache.key", cacheKey),
		))
	}

	return cars, count, nil
}

func (db *CarDB) GetAllRentedCars(ctx context.Context, page, pageSize int) ([]models.Car, int, error) {
	tracer := otel.Tracer("database")
	ctx, span := tracer.Start(ctx, "GetAllRentedCarsQuery")
	defer span.End()

	offset := (page - 1) * pageSize

	query := `
		SELECT *,
		COUNT(*) OVER() as total_available_cars
		FROM Cars
		WHERE status = 'RENTED'
		LIMIT ? OFFSET ?
	`

	span.SetAttributes(
		attribute.String("query", query),
		attribute.Int("query.page", page),
		attribute.Int("query.page_size", pageSize),
	)

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		span.RecordError(err)
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
			span.RecordError(err)
			return nil, 0, err
		}
		cars = append(cars, car)
	}
	return cars, count, nil
}

func (db *CarDB) GetAllMaintenanceCars(ctx context.Context, page, pageSize int) ([]models.Car, int, error) {
	tracer := otel.Tracer("database")
	ctx, span := tracer.Start(ctx, "GetAllMaintenanceCarsQuery")
	defer span.End()

	offset := (page - 1) * pageSize

	query := `
		SELECT *,
		COUNT(*) OVER() as total_available_cars
		FROM Cars
		WHERE status = 'MAINTENANCE'
		LIMIT ? OFFSET ?
	`

	span.SetAttributes(
		attribute.String("query", query),
		attribute.Int("query.page", page),
		attribute.Int("query.page_size", pageSize),
	)

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, pageSize, offset)
	if err != nil {
		span.RecordError(err)
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
			span.RecordError(err)
			return nil, 0, err
		}
		cars = append(cars, car)
	}
	return cars, count, nil
}

func (db *CarDB) GetCarByLicensePlate(ctx context.Context, licensePlate string) (models.Car, error) {
	tracer := otel.Tracer("database")
	ctx, span := tracer.Start(ctx, "GetCarByLicensePlateQuery")
	defer span.End()

	query := `
    SELECT *
    FROM Cars
    WHERE license_plate = ?
  `

	span.SetAttributes(
		attribute.String("query", query),
		attribute.String("car.license_plate", licensePlate),
	)

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	row := db.DB.QueryRowContext(ctx, query, licensePlate)

	var car models.Car
	if err := row.Scan(
		&car.LicensePlate, &car.Make, &car.Model, &car.Status, &car.CostPerKm, &car.Location,
	); err != nil {
		if err == sql.ErrNoRows {
			span.RecordError(err)
			return models.Car{}, ErrCarNotFound
		}
		span.RecordError(err)
		return models.Car{}, err
	}
	return car, nil
}

func (db *CarDB) InsertCar(ctx context.Context, car models.Car) error {
	tracer := otel.Tracer("database")
	ctx, span := tracer.Start(ctx, "InsertCarQuery")
	defer span.End()

	query := `
		INSERT INTO
		Cars (license_plate, make, model, status, cost_per_km, location)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	span.SetAttributes(
		attribute.String("car.license_plate", car.LicensePlate),
		attribute.String("car.make", car.Make),
		attribute.String("car.model", car.Model),
		attribute.String("car.status", string(car.Status)),
		attribute.Float64("car.cost_per_km", *car.CostPerKm),
		attribute.String("car.location", car.Location),
	)

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, query, strings.ToUpper(car.LicensePlate), car.Make, car.Model, car.Status, car.CostPerKm, strings.ToUpper(car.Location))
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			span.RecordError(err)
			return ErrDuplicateLicensePlate
		}
		span.RecordError(err)
		return err
	}
	span.AddEvent("Car inserted successfully")
	return nil
}

func (db *CarDB) UpdateCarStatus(ctx context.Context, tx *sql.Tx, licensePlate, status string) error {
	tracer := otel.Tracer("database")
	ctx, span := tracer.Start(ctx, "UpdateCarStatusQuery")
	defer span.End()

	query := `
		UPDATE Cars
		SET status = ?
		WHERE license_plate = ?
	`

	span.SetAttributes(
		attribute.String("car.license_plate", licensePlate),
		attribute.String("car.status", status),
	)

	span.SetAttributes(attribute.String("db.statement", query))

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	if tx != nil {
		_, err := tx.ExecContext(ctx, query, status, strings.ToUpper(licensePlate))
		if err != nil {
			span.RecordError(err)
			return err
		}
		span.AddEvent("Car status updated in transaction")
		return nil
	}

	_, err := db.DB.ExecContext(ctx, query, status, strings.ToUpper(licensePlate))
	if err != nil {
		span.RecordError(err)
		return err
	}
	span.AddEvent("Updated car status successfully")
	return nil
}

func (db *CarDB) UpdateCar(ctx context.Context, car models.Car) (models.Car, error) {
	tracer := otel.Tracer("database")
	ctx, span := tracer.Start(ctx, "UpdateCarQuery")
	defer span.End()

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

	span.SetAttributes(
		attribute.String("car.license_plate", car.LicensePlate),
		attribute.String("car.status", string(car.Status)),
	)

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var prevStatus string
	err := db.DB.QueryRowContext(ctx, statusQuery, car.LicensePlate).Scan(&prevStatus)
	if err != nil {
		span.RecordError(err)
		return models.Car{}, err
	}

	if prevStatus == "RENTED" || car.Status == "RENTED" {
		span.RecordError(ErrInvalidStatusChange)
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
		span.RecordError(err)
		return models.Car{}, err
	}

	span.AddEvent("Car updated successfully")
	return models.Car{
		LicensePlate: car.LicensePlate,
		Make:         car.Make,
		Model:        car.Model,
		Status:       car.Status,
		CostPerKm:    car.CostPerKm,
		Location:     car.Location,
	}, err
}

func (db *CarDB) DeleteCar(ctx context.Context, licensePlate string) (models.Car, error) {
	tracer := otel.Tracer("database")
	ctx, span := tracer.Start(ctx, "DeleteCarQuery")
	defer span.End()

	var car models.Car
	query := `
		SELECT license_plate, make, model, cost_per_km, location
		FROM Cars
		WHERE license_plate = ?
	`

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	err := db.DB.QueryRowContext(ctx, query, strings.ToUpper(licensePlate)).Scan(&car.LicensePlate, &car.Make, &car.Model, &car.CostPerKm, &car.Location)
	if err != nil {
		if err == sql.ErrNoRows {
			span.RecordError(err)
			return models.Car{}, ErrCarNotFound
		}
		span.RecordError(err)
		return models.Car{}, err
	}

	deleteQuery := `
		DELETE FROM Cars
		WHERE license_plate = ?
	`
	_, err = db.DB.Exec(deleteQuery, strings.ToUpper(licensePlate))
	if err != nil {
		span.RecordError(err)
		return models.Car{}, err
	}

	span.AddEvent("Car deleted successfully")
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
				return fmt.Errorf("failed to delete cache key %s: %v", cacheKey, err)
			}
		} else {
			fmt.Printf("Cache invalidated for key: %s\n", cacheKey)
		}
	}
	return nil
}
