package database

import (
	"context"
	"database/sql"
	"time"
)

type PaymentDB struct {
	DB *sql.DB
}

func NewPaymentDB(db *sql.DB) *PaymentDB {
	return &PaymentDB{DB: db}
}

func (db *PaymentDB) CreatePayment(tx *sql.Tx, tripID int, amount float64, payment_method string) error {
	query := `
		INSERT INTO Payments (trip_id, amount, payment_method, payment_time)
		VALUES (?, ?, ?, NOW())
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if tx != nil {
		_, err := tx.ExecContext(ctx, query, tripID, amount, payment_method)
		return err
	}

	_, err := db.DB.ExecContext(ctx, query, tripID, amount, payment_method)
	return err
}
