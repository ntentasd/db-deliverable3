package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/ntentasd/db-deliverable3/internal/models"
)

type DamageDB struct {
	DB *sql.DB
}

// NewDamageDB initializes the DamageDB struct
func NewDamageDB(db *sql.DB) *DamageDB {
	return &DamageDB{DB: db}
}

// GetDamagesByLicensePlate retrieves all damages for a specific car
func (db *DamageDB) GetDamages(licensePlate string, page, pageSize int) ([]models.Damage, int, error) {
	offset := (page - 1) * pageSize

	query := `
		SELECT id, description, reported_date, repair_cost, repaired,
		COUNT(*) OVER() as damage_count
		FROM Damages
		WHERE car_license_plate = ?
		LIMIT ? OFFSET ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, licensePlate, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var damages []models.Damage
	var repairedBit []byte
	var count int
	for rows.Next() {
		var damage models.Damage
		if err := rows.Scan(
			&damage.ID,
			&damage.Description,
			&damage.ReportedDate,
			&damage.RepairCost,
			&repairedBit,
			&count,
		); err != nil {
			return nil, 0, err
		}

		damage.Repaired = repairedBit[0] == 1

		damages = append(damages, damage)
	}

	return damages, count, nil
}

// AddDamage adds a new damage entry to the database
func (db *DamageDB) AddDamage(damage models.Damage) error {
	query := `
		INSERT INTO Damages
		(car_license_plate, description, reported_date, repair_cost, repaired)
		VALUES (?, ?, ?, ?, ?)
	`

	repairedValue := 0
	if damage.Repaired {
		repairedValue = 1
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, query,
		damage.CarLicensePlate,
		damage.Description,
		damage.ReportedDate,
		damage.RepairCost,
		repairedValue,
	)
	return err
}

// AddDamage adds a new damage entry to the database
func (db *DamageDB) EditDamageState(license_plate string, repaired bool) error {
	query := `
		UPDATE Damages
		SET repaired = ?
		WHERE car_license_plate = ?
	`

	var repairedValue []byte
	if repaired {
		repairedValue = []byte{1}
	} else {
		repairedValue = []byte{0}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, query, repairedValue, license_plate)
	return err
}
