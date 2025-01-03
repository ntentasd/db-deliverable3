package database

import (
	"context"
	"database/sql"
	"fmt"
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
		&user.DrivingBehaviour,
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

func (db *UserDB) CreateUser(email, username, full_name, password string) (models.User, error) {
	var user models.User

	// Check if email is already taken
	emailCheckQuery := `SELECT email FROM Users WHERE email = ?`
	err := db.DB.QueryRow(emailCheckQuery, email).Scan(&user.Email)
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			return models.User{}, ErrDuplicateEmail
		}
		return models.User{}, err
	}

	// Check if username is already taken
	usernameCheckQuery := `SELECT username FROM Users WHERE username = ?`
	err = db.DB.QueryRow(usernameCheckQuery, username).Scan(&user.UserName)
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			return models.User{}, ErrDuplicateUsername
		}
		return models.User{}, err
	}

	query := `
		INSERT INTO
		Users (email, username, full_name, password, driving_behavior, created_at)
		VALUES (?, ?, ?, ?, 0.00, NOW())
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
		CASCADE
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, query, email)
	if err != nil {
		return err
	}

	return nil
}
