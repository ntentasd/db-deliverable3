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
func (db *DamageDB) GetDamagesByLicensePlate(licensePlate string) ([]models.Damage, error) {
	query := `
		SELECT id, description, reported_date, repair_cost, repaired 
		FROM Damages 
		WHERE car_license_plate = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, licensePlate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var damages []models.Damage
	var repairedBit []byte
	for rows.Next() {
		var damage models.Damage
		if err := rows.Scan(
			&damage.ID,
			&damage.Description,
			&damage.ReportedDate,
			&damage.RepairCost,
			&repairedBit,
		); err != nil {
			return nil, err
		}

		damage.Repaired = repairedBit[0] == 1

		damages = append(damages, damage)
	}

	return damages, nil
}

// AddDamage adds a new damage entry to the database
func (db *DamageDB) AddDamage(damage models.Damage) error {
	query := `
		INSERT INTO Damages (car_license_plate, description, reported_date, repair_cost, repaired) 
		VALUES (?, ?, ?, ?, ?)
	`

	repairedValue := 0
	if damage.Repaired {
		repairedValue = 1
	}

	_, err := db.DB.Exec(query,
		damage.CarLicensePlate,
		damage.Description,
		damage.ReportedDate,
		damage.RepairCost,
		repairedValue,
	)

	return err
}
