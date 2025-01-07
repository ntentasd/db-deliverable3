package database

import (
	"database/sql"
	"fmt"
)

type Database struct {
	UserDB         *UserDB
	CarDB          *CarDB
	DamageDB       *DamageDB
	ServiceDB      *ServiceDB
	TripDB         *TripDB
	SettingDB      *SettingDB
	ReviewDB       *ReviewDB
	PaymentDB      *PaymentDB
	SubscriptionDB *SubscriptionDB
}

func InitDB(db *sql.DB) (*Database, error) {
	if db == nil {
		return nil, fmt.Errorf("database connection cannot be nil")
	}

	return &Database{
		UserDB:         NewUserDatabase(db),
		CarDB:          NewCarDatabase(db),
		DamageDB:       NewDamageDB(db),
		ServiceDB:      NewServiceDB(db),
		TripDB:         NewTripDatabase(db),
		SettingDB:      NewSettingDB(db),
		ReviewDB:       NewReviewDB(db),
		PaymentDB:      NewPaymentDB(db),
		SubscriptionDB: NewSubscriptionDB(db),
	}, nil
}
