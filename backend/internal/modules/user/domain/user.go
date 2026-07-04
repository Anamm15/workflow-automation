package domain

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID            uuid.UUID
	AccountID     uuid.UUID
	Name          string
	AvatarURL     *string
	UIPreferences []byte // Stored as JSONB in DB
	Timezone      string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}
