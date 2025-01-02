package database

import (
	"database/sql"
	"fmt"
)

type Database struct {
	CarDB     *CarDB
	DamageDB  *DamageDB
	ServiceDB *ServiceDB
	TripDB    *TripDB
}

func InitDB(db *sql.DB) (*Database, error) {
	if db == nil {
		return nil, fmt.Errorf("database connection cannot be nil")
	}

	return &Database{
		CarDB:     NewCarDatabase(db),
		DamageDB:  NewDamageDB(db),
		ServiceDB: NewServiceDB(db),
		TripDB:    NewTripDatabase(db),
	}, nil
}
