package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/ntentasd/db-deliverable3/internal/models"
)

type UserDB struct {
	DB *sql.DB
}

var (
	ErrUserNotFound       = fmt.Errorf("user not found")
	ErrInvalidCredentials = fmt.Errorf("invalid credentials")
	ErrDuplicateEmail     = fmt.Errorf("a user with this email address already exists")
	ErrDuplicateUsername  = fmt.Errorf("a user with this username already exists")
)

func NewUserDatabase(db *sql.DB) *UserDB {
	return &UserDB{db}
}

func (db *UserDB) GetUserByEmail(email string) (models.User, error) {
	var user models.User

	query := `
		SELECT email, password
		FROM Users
		WHERE email = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := db.DB.QueryRowContext(ctx, query, email).Scan(&user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, err
	}

	return user, nil
}

func (db *UserDB) GetUserDetails(email string) (models.User, error) {
	var user models.User

	query := `
		SELECT email, username, full_name, driving_behavior, created_at
		FROM Users
		WHERE email = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := db.DB.QueryRowContext(ctx, query, email).Scan(
		&user.Email,
		&user.UserName,
		&user.FullName,
		&user.DrivingBehavior,
		&user.CreatedAt,
	)
	if err != nil {
		return models.User{}, err
	}

	return user, nil
}

func (db *UserDB) UpdateUsername(email, username string) error {
	query := `
		UPDATE Users
		SET username = ?
		WHERE email = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, query, username, email)
	if err != nil {
		return err
	}

	return nil
}

func (db *UserDB) UpdateFullname(email, full_name string) error {
	query := `
		UPDATE Users
		SET full_name = ?
		WHERE email = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, query, full_name, email)
	if err != nil {
		return err
	}

	return nil
}

func (db *UserDB) UpdateDrivingBehavior(tx *sql.Tx, email string, drivingBehavior float64) error {
	var currentDrivingBehavior sql.NullFloat64
	var count int

	query := `
		SELECT u.driving_behavior, COALESCE(COUNT(t.id), 0)
		FROM Users u
		LEFT JOIN Trips t ON u.email = t.user_email AND t.end_time IS NOT NULL
		WHERE u.email = ?
		GROUP BY u.email, u.driving_behavior
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := db.DB.QueryRowContext(ctx, query, email).Scan(&currentDrivingBehavior, &count)
	if err != nil {
		if err == sql.ErrNoRows {
			return ErrUserNotFound
		}
		log.Printf("Query error: %v", err)
		return err
	}

	var updatedDrivingBehavior float64
	if currentDrivingBehavior.Valid {
		updatedDrivingBehavior = (currentDrivingBehavior.Float64*float64(count) + drivingBehavior) / float64(count+1)
	} else {
		updatedDrivingBehavior = drivingBehavior
	}

	updateQuery := `
		UPDATE Users
		SET driving_behavior = ?
		WHERE email = ?
	`

	if tx != nil {
		_, err := tx.ExecContext(ctx, updateQuery, updatedDrivingBehavior, email)
		return err
	}

	_, err = db.DB.ExecContext(ctx, updateQuery, updatedDrivingBehavior, email)
	return err
}

func (db *UserDB) CreateUser(email, username, full_name, password string) (models.User, error) {
	var user models.User

	// Check if email is already taken
	emailCheckQuery := `SELECT email FROM Users WHERE email = ?`
	err := db.DB.QueryRow(emailCheckQuery, email).Scan(&user.Email)
	if err == nil {
		return models.User{}, ErrDuplicateEmail
	} else if err != sql.ErrNoRows {
		return models.User{}, err
	}

	// Check if username is already taken
	usernameCheckQuery := `SELECT username FROM Users WHERE username = ?`
	err = db.DB.QueryRow(usernameCheckQuery, username).Scan(&user.UserName)
	if err == nil {
		return models.User{}, ErrDuplicateUsername
	} else if err != sql.ErrNoRows {
		return models.User{}, err
	}

	query := `
		INSERT INTO
		Users (email, username, full_name, password, driving_behavior, created_at)
		VALUES (?, ?, ?, ?, NULL, NOW())
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err = db.DB.ExecContext(ctx, query, email, username, full_name, password)
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			return models.User{}, ErrDuplicateEmail
		}
		return models.User{}, err
	}

	return models.User{
		Email:    email,
		UserName: username,
		FullName: full_name,
	}, nil
}

func (db *UserDB) DeleteUser(email string) error {
	query := `
		DELETE FROM Users
		WHERE email = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, query, email)
	if err != nil {
		return err
	}

	return nil
}
