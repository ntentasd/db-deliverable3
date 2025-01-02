package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/ntentasd/db-deliverable3/internal/models"
)

type ReviewDB struct {
	DB *sql.DB
}

func NewReviewDatabase(db *sql.DB) *ReviewDB {
	return &ReviewDB{DB: db}
}

func (db *ReviewDB) GetAllReviewsForCar(licensePlate string) ([]models.Review, error) {
	// query1 := `SELECT id FROM Trips WHERE car_license_plate = ?`

	query := `SELECT * FROM Reviews WHERE trip_id = ?`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []models.Review
	for rows.Next() {
		var review models.Review
		if err := rows.Scan(
			&review.TripID, &review.Rating, &review.Comment, &review.CreatedAt,
		); err != nil {
			return nil, err
		}
		reviews = append(reviews, review)
	}
	return reviews, nil
}
