package domain

import (
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID               uuid.UUID
	AccountID        uuid.UUID
	RefreshTokenHash string
	UserAgent        string
	IPAddress        string
	CreatedAt        time.Time
	LastUsedAt       time.Time
	ExpiresAt        time.Time
	Revoked          bool
}

// IsValid checks if the session is active and not expired
func (s *Session) IsValid() bool {
	return !s.Revoked && time.Now().Before(s.ExpiresAt)
}
