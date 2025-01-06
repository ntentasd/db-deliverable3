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

func NewReviewDB(db *sql.DB) *ReviewDB {
	return &ReviewDB{DB: db}
}

func (db *ReviewDB) GetAllReviewsForCar(licensePlate string, page, pageSize int) ([]models.Review, []string, int, error) {
	var count int
	offset := (page - 1) * pageSize

	query := `
		SELECT r.trip_id, r.rating, r.comment, r.created_at, t.user_email, COUNT(*) as review_count
		FROM Reviews r
		LEFT JOIN Trips t
		ON r.trip_id = t.id
		WHERE t.car_license_plate = ?
		GROUP BY r.trip_id, r.rating, r.comment, r.created_at, t.user_email
		LIMIT ? OFFSET ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, query, licensePlate, pageSize, offset)
	if err != nil {
		return nil, nil, 0, err
	}
	defer rows.Close()

	var reviews []models.Review
	var emails []string
	for rows.Next() {
		var review models.Review
		var email string
		if err := rows.Scan(
			&review.TripID, &review.Rating, &review.Comment, &review.CreatedAt, &email, &count,
		); err != nil {
			if err == sql.ErrNoRows {
				return nil, nil, 0, ErrCarNotFound
			}
			return nil, nil, 0, err
		}
		reviews = append(reviews, review)
		emails = append(emails, email)
	}
	return reviews, emails, count, nil
}
