package domain

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID          uuid.UUID
	AccountID   uuid.UUID
	PhoneNumber *string
	AvatarURL   *string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
