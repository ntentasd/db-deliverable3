package models

import (
	_ "github.com/go-playground/validator/v10"
)

type SubscriptionName string

const (
	OneMonth    SubscriptionName = "1_MONTH"
	ThreeMonths SubscriptionName = "3_MONTHS"
	OneYear     SubscriptionName = "1_YEAR"
)

type Subscription struct {
	Name          SubscriptionName `json:"name" validate:"required,oneof=1_MONTH 3_MONTHS 1_YEAR"`
	PricePerMonth float64          `json:"price_per_month" validate:"required,gt=0"`
	Description   string           `json:"description,omitempty" validate:"omitempty,max=16777215"`
}
