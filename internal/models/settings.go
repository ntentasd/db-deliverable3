package models

import (
	_ "github.com/go-playground/validator/v10"
)

type DriveMode string

const (
	Comfort DriveMode = "COMFORT"
	Sport   DriveMode = "SPORT"
	Eco     DriveMode = "ECO"
)

type Settings struct {
	UserEmail              string     `json:"user_email" validate:"required,email,max=45"`
	SeatPositionHorizontal *float32   `json:"seat_position_horizontal,omitempty" validate:"omitempty,min=0,max=999.9"`
	SeatPositionVertical   *float32   `json:"seat_position_vertical,omitempty" validate:"omitempty,min=0,max=999.9"`
	SeatReclineAngle       *float32   `json:"seat_recline_angle,omitempty" validate:"omitempty,min=0,max=999.9"`
	SteeringWheelPosition  *float32   `json:"steering_wheel_position,omitempty" validate:"omitempty,min=0,max=999.9"`
	LeftMirrorAngle        *float32   `json:"left_mirror_angle,omitempty" validate:"omitempty,min=0,max=999.9"`
	RightMirrorAngle       *float32   `json:"right_mirror_angle,omitempty" validate:"omitempty,min=0,max=999.9"`
	RearviewMirrorAngle    *float32   `json:"rearview_mirror_angle,omitempty" validate:"omitempty,min=0,max=999.9"`
	CabinTemperature       *float32   `json:"cabin_temperature,omitempty" validate:"omitempty,min=-50,max=50"`
	DriveMode              *DriveMode `json:"drive_mode,omitempty" validate:"omitempty,oneof=COMFORT SPORT ECO"`
	SuspensionHeight       *float32   `json:"suspension_height,omitempty" validate:"omitempty,min=0,max=999.9"`
	EngineStartStop        *bool      `json:"engine_start_stop,omitempty" validate:"omitempty"`
	CruiseControl          *bool      `json:"cruise_control,omitempty" validate:"omitempty"`
}
