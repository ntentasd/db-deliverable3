package models

import (
	"time"

	_ "github.com/go-playground/validator/v10"
)

type PaymentMethod string

const (
	Sub    PaymentMethod = "SUBSCRIPTION"
	Card   PaymentMethod = "CARD"
	Crypto PaymentMethod = "CRYPTO"
)

type Payment struct {
	TripID        int           `json:"trip_id" validate:"required,gt=0"`
	Amount        float64       `json:"amount" validate:"required,gt=0,max=99999999.99"`
	PaymentTime   time.Time     `json:"payment_time" validate:"required"`
	PaymentMethod PaymentMethod `json:"payment_method" validate:"required,oneof=SUBSCRIPTION CARD CRYPTO"`
}
