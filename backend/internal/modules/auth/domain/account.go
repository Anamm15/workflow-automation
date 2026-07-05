package domain

import (
	"time"

	"github.com/google/uuid"
)

type Account struct {
	ID           uuid.UUID
	Email        string
	Username     string
	PasswordHash string
	IsVerified   bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
