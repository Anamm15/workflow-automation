package http

import (
	"time"
	"github.com/google/uuid"
)

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=255"`
	Username string `json:"username" binding:"required,min=3,max=50,alphanum"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Timezone string `json:"timezone" binding:"omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
}

type AccountResponse struct {
	AccountID   uuid.UUID `json:"account_id"`
	Email       string    `json:"email"`
	Username    string    `json:"username"`
	IsVerified  bool      `json:"is_verified"`
	JoinedAt    time.Time `json:"joined_at"`
}
