package domain

import (
	"context"

	"github.com/google/uuid"
)

// UserRepository handles database operations for the User entity
type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetByAccountID(ctx context.Context, accountID uuid.UUID) (*User, error)
	Update(ctx context.Context, user *User) error
}

// UserUseCase defines the application logic for user profile management
type UserUseCase interface {
	GetProfile(ctx context.Context, accountID uuid.UUID) (*User, error)
	UpdateProfile(ctx context.Context, accountID uuid.UUID, name string, avatarURL *string, prefs []byte, tz string) (*User, error)
}

// UserFacade is the public contract for inter-module communication.
// Used by the Auth module to trigger user profile creation upon registration.
type UserFacade interface {
	CreateUserForAccount(ctx context.Context, accountID uuid.UUID, email string) error
}
