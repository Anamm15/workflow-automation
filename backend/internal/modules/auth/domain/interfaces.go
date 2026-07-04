package domain

import (
	"context"

	"github.com/google/uuid"
)

// AccountRepository handles database operations for Account
type AccountRepository interface {
	Create(ctx context.Context, account *Account) error
	GetByID(ctx context.Context, id uuid.UUID) (*Account, error)
	GetByEmail(ctx context.Context, email string) (*Account, error)
	Update(ctx context.Context, account *Account) error
}


// SessionRepository handles database operations for Session
type SessionRepository interface {
	Create(ctx context.Context, session *Session) error
	GetByID(ctx context.Context, id uuid.UUID) (*Session, error)
	GetByRefreshTokenHash(ctx context.Context, hash string) (*Session, error)
	Update(ctx context.Context, session *Session) error
	RevokeAllByAccountID(ctx context.Context, accountID uuid.UUID) error
}

// EmailService represents the shared email service interface
type EmailService interface {
	SendVerificationEmail(ctx context.Context, toEmail, token string) error
	SendPasswordResetEmail(ctx context.Context, toEmail, token string) error
}

// TokenPair represents the access and refresh token returned to user
type TokenPair struct {
	AccessToken  string
	RefreshToken string // plaintext, only sent once
}

// AuthUseCase defines the application logic for authentication
type AuthUseCase interface {
	Register(ctx context.Context, email, password, name, timezone string) error
	Login(ctx context.Context, email, password, userAgent, ipAddress string) (*TokenPair, error)
	RefreshToken(ctx context.Context, refreshToken, userAgent, ipAddress string) (*TokenPair, error)
	Logout(ctx context.Context, refreshToken string) error
	LogoutAll(ctx context.Context, accountID uuid.UUID) error
	GetMe(ctx context.Context, accountID uuid.UUID) (*Account, error)
	
	ChangePassword(ctx context.Context, accountID uuid.UUID, oldPassword, newPassword string) error
	ForgotPassword(ctx context.Context, email string) error
	ResetPassword(ctx context.Context, token, newPassword string) error
	VerifyEmail(ctx context.Context, token string) error
	ResendVerification(ctx context.Context, email string) error
}

// UserProfileFacade is used to communicate with the User module
type UserProfileFacade interface {
	CreateUserForAccount(ctx context.Context, accountID uuid.UUID, email, name, timezone string) error
}
