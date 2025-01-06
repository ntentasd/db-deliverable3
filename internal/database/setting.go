package database

import (
	"context"
	"database/sql"
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/ntentasd/db-deliverable3/internal/models"
)

type SettingDB struct {
	DB *sql.DB
}

func NewSettingDB(db *sql.DB) *SettingDB {
	return &SettingDB{DB: db}
}

var (
	ErrSettingsNotFound = fmt.Errorf("settings not found")
)

func (db *SettingDB) GetSettings(email string) (models.Settings, error) {
	var settings models.Settings

	query := `
		SELECT *
		FROM UserSettings
		WHERE user_email = ?
	`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var engineStartStop []byte
	var cruiseControl []byte
	err := db.DB.QueryRowContext(ctx, query, email).Scan(
		&settings.UserEmail,
		&settings.SeatPositionHorizontal,
		&settings.SeatPositionVertical,
		&settings.SeatReclineAngle,
		&settings.SteeringWheelPosition,
		&settings.LeftMirrorAngle,
		&settings.RightMirrorAngle,
		&settings.RearviewMirrorAngle,
		&settings.CabinTemperature,
		&settings.DriveMode,
		&settings.SuspensionHeight,
		&engineStartStop,
		&cruiseControl,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return models.Settings{}, ErrSettingsNotFound
		}
		return models.Settings{}, err
	}

	engineStartStopBool := engineStartStop[0] == 1
	settings.EngineStartStop = &engineStartStopBool

	cruiseControlBool := cruiseControl[0] == 1
	settings.CruiseControl = &cruiseControlBool

	return settings, nil
}

func (db *SettingDB) CreateSettings(email string, settings models.Settings) error {
	query := `
		INSERT INTO UserSettings (
			user_email, seat_position_horizontal, seat_position_vertical,
			seat_recline_angle, steering_wheel_position, left_mirror_angle, right_mirror_angle,
			rearview_mirror_angle, cabin_temperature, drive_mode, suspension_height, engine_start_stop, cruise_control
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	engine_start_stop := boolToInt(settings.EngineStartStop)
	cruise_control := boolToInt(settings.CruiseControl)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, query, email, settings.SeatPositionHorizontal, settings.SeatPositionVertical,
		settings.SeatReclineAngle, settings.SteeringWheelPosition, settings.LeftMirrorAngle, settings.RightMirrorAngle, settings.RearviewMirrorAngle,
		settings.CabinTemperature, settings.DriveMode, settings.SuspensionHeight, engine_start_stop, cruise_control)

	return err
}

func (db *SettingDB) UpdateSetting(email string, settings models.Settings) error {
	queryBuilder := strings.Builder{}
	queryBuilder.WriteString("UPDATE usersettings SET ")

	params := []interface{}{}

	val := reflect.ValueOf(settings)
	typ := reflect.TypeOf(settings)

	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		jsonTag := field.Tag.Get("json")
		if jsonTag == "" || jsonTag == "-" || jsonTag == "user_email" {
			continue
		}

		// Remove ",omitempty" from the tag if present
		columnName := strings.Split(jsonTag, ",")[0]
		fieldValue := val.Field(i).Interface()

		// Skip nil or default values
		if isZero(fieldValue) {
			continue
		}

		queryBuilder.WriteString(fmt.Sprintf("%s = ?, ", columnName))
		params = append(params, fieldValue)
	}

	// Remove trailing comma and space
	query := queryBuilder.String()
	if len(params) == 0 {
		return fmt.Errorf("no fields to update")
	}
	query = query[:len(query)-2]
	query += " WHERE user_email = ?"
	params = append(params, email)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, query, params...)
	if err != nil {
		return fmt.Errorf("failed to update settings: %v", err)
	}

	return nil
}

func boolToInt(b *bool) int {
	if b != nil && *b {
		return 1
	}
	return 0
}

func isZero(value interface{}) bool {
	return value == nil || reflect.DeepEqual(value, reflect.Zero(reflect.TypeOf(value)).Interface())
}
