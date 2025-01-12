package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
	"github.com/ntentasd/db-deliverable3/config"
	"github.com/ntentasd/db-deliverable3/internal/memcached"
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

func InitDB(config config.DatabaseConfig, client *memcached.Client, ttl int32) (*sql.DB, *Database, error) {
	connectionString := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		config.User, config.Password, config.Host, config.Port, config.Name,
	)

	db, err := sql.Open("mysql", connectionString)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	return db, &Database{
		UserDB:         NewUserDatabase(db),
		CarDB:          NewCarDatabase(db, client, ttl),
		DamageDB:       NewDamageDB(db),
		ServiceDB:      NewServiceDB(db),
		TripDB:         NewTripDatabase(db),
		SettingDB:      NewSettingDB(db),
		ReviewDB:       NewReviewDB(db),
		PaymentDB:      NewPaymentDB(db),
		SubscriptionDB: NewSubscriptionDB(db),
	}, nil
}
