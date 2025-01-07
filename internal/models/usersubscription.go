package models

import (
	"time"

	_ "github.com/go-playground/validator/v10"
)

type UserSubscription struct {
	ID               int64            `json:"id,omitempty"`
	UserEmail        string           `json:"user_email,omitempty"`
	SubscriptionName SubscriptionName `json:"subscription_name" validate:"required,oneof=1_MONTH 3_MONTHS 1_YEAR"`
	StartDate        time.Time        `json:"start_date,omitempty"`
	EndDate          time.Time        `json:"end_date,omitempty"`
	IsCancelled      bool             `json:"is_cancelled,omitempty"`
}
