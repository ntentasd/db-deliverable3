package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/ntentasd/db-deliverable3/internal/models"
)

type SubscriptionDB struct {
	DB *sql.DB
}

var (
	ErrInvalidSubscriptionName        = fmt.Errorf("invalid subscription name")
	ErrUserSubscriptionNotFound       = fmt.Errorf("no subscription found")
	ErrAlreadyActibeSubscriptionError = fmt.Errorf("there is an already active subscription")
	ErrActiveSubscriptionNotFound     = fmt.Errorf("there is no active subscription")
)

func NewSubscriptionDB(db *sql.DB) *SubscriptionDB {
	return &SubscriptionDB{DB: db}
}

func (db *SubscriptionDB) GetAllSubscriptions() ([]models.Subscription, error) {
	query := `
		SELECT *
		FROM Subscriptions
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subscriptions []models.Subscription
	for rows.Next() {
		var subscription models.Subscription
		if err := rows.Scan(
			&subscription.Name,
			&subscription.PricePerMonth,
			&subscription.Description,
		); err != nil {
			return nil, err
		}

		subscriptions = append(subscriptions, subscription)
	}

	return subscriptions, nil
}

func (db *SubscriptionDB) GetActiveSubscription(email string) (models.UserSubscription, error) {
	query := `
		SELECT id, subscription_name, start_date, end_date, is_cancelled
		FROM UserSubscriptions
		WHERE user_email = ?
		AND is_cancelled = 0
		AND end_date > NOW()
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var subscription models.UserSubscription
	var isCancelled []byte
	err := db.DB.QueryRowContext(ctx, query, email).Scan(
		&subscription.ID,
		&subscription.SubscriptionName,
		&subscription.StartDate,
		&subscription.EndDate,
		&isCancelled,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.UserSubscription{}, ErrUserSubscriptionNotFound
		}
		return models.UserSubscription{}, err
	}

	subscription.IsCancelled = isCancelled[0] == 1

	return subscription, nil
}

func (db *SubscriptionDB) BuySubscription(email, subscription_name string) (time.Time, error) {
	checkActiveQuery := `
		SELECT COUNT(*)
		FROM UserSubscriptions
		WHERE user_email = ?
		AND is_cancelled = 0
		AND end_date > NOW()
	`

	query := `
		INSERT INTO
		UserSubscriptions (user_email, start_date, end_date, is_cancelled)
		VALUES (?, ?, ?, ?)
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var activeCount int
	err := db.DB.QueryRowContext(ctx, checkActiveQuery, email).Scan(&activeCount)
	if err != nil {
		return time.Time{}, err
	}

	if activeCount > 0 {
		return time.Time{}, ErrAlreadyActibeSubscriptionError
	}

	startDate := time.Now().UTC().Truncate(24 * time.Hour)

	var endDate time.Time
	switch subscription_name {
	case string(models.OneMonth):
		endDate = startDate.AddDate(0, 1, 0)
	case string(models.ThreeMonths):
		endDate = startDate.AddDate(0, 3, 0)
	case string(models.OneYear):
		endDate = startDate.AddDate(1, 0, 0)
	default:
		return time.Time{}, ErrInvalidSubscriptionName
	}

	isCancelled := []byte{0}
	_, err = db.DB.ExecContext(ctx, query, email, startDate, endDate, isCancelled)
	if err != nil {
		return time.Time{}, err
	}

	return endDate, nil
}

func (db *SubscriptionDB) CancelSubscription(email string) error {
	checkActiveQuery := `
		SELECT COUNT(*)
		FROM UserSubscriptions
		WHERE user_email = ?
		AND is_cancelled = 0
		AND end_date > NOW()
	`

	query := `
		UPDATE UserSubscriptions
		SET is_cancelled = 1
		WHERE user_email = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var activeCount int
	err := db.DB.QueryRowContext(ctx, checkActiveQuery, email).Scan(&activeCount)
	if err != nil {
		return err
	}

	if activeCount == 0 {
		return ErrActiveSubscriptionNotFound
	}

	_, err = db.DB.ExecContext(ctx, query, email)
	return err
}
