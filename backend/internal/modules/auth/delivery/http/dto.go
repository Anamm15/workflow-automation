package http

import (
	"time"
	"github.com/google/uuid"
)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,containsany=ABCDEFGHIJKLMNOPQRSTUVWXYZ,containsany=abcdefghijklmnopqrstuvwxyz,containsany=0123456789,containsany=!@#$%^&*()_+-=[]{}|;':,./<>?"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8,containsany=ABCDEFGHIJKLMNOPQRSTUVWXYZ,containsany=abcdefghijklmnopqrstuvwxyz,containsany=0123456789,containsany=!@#$%^&*()_+-=[]{}|;':,./<>?"`
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
}

type ProfileResponse struct {
	AccountID   uuid.UUID `json:"account_id"`
	Email       string    `json:"email"`
	IsVerified  bool      `json:"is_verified"`
	PhoneNumber *string   `json:"phone_number"`
	AvatarURL   *string   `json:"avatar_url"`
	JoinedAt    time.Time `json:"joined_at"`
}
