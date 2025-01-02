package models

import (
	"time"

	_ "github.com/go-playground/validator/v10"
)

type UserSubscription struct {
	ID               int64            `json:"id" validate:"required,gt=0"`
	UserEmail        string           `json:"user_email" validate:"required,email,max=45"`
	SubscriptionName SubscriptionName `json:"subscription_name" validate:"required,oneof=1_MONTH 3_MONTHS 1_YEAR"`
	StartDate        time.Time        `json:"start_date" validate:"required"`
	EndDate          time.Time        `json:"end_date" validate:"required,gtfield=StartDate"`
	IsCancelled      bool             `json:"is_cancelled" validate:"required"`
}
