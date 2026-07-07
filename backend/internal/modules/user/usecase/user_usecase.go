package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"workflow-automation/internal/modules/user/domain"
)

type userUseCase struct {
	repo domain.UserRepository
}

func NewUserUseCase(repo domain.UserRepository) (domain.UserUseCase, domain.UserFacade) {
	uc := &userUseCase{repo: repo}
	return uc, uc // Implements both interfaces
}

// --- UserUseCase Implementation ---

func (u *userUseCase) GetProfile(ctx context.Context, accountID uuid.UUID) (*domain.User, error) {
	return u.repo.GetByAccountID(ctx, accountID)
}

func (u *userUseCase) UpdateProfile(ctx context.Context, accountID uuid.UUID, name string, avatarURL *string, prefs []byte, tz string) (*domain.User, error) {
	user, err := u.repo.GetByAccountID(ctx, accountID)
	if err != nil {
		return nil, err
	}

	user.Name = name
	user.AvatarURL = avatarURL
	user.UIPreferences = prefs
	user.Timezone = tz
	user.UpdatedAt = time.Now()

	if err := u.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// --- UserFacade Implementation ---

func (u *userUseCase) CreateUserForAccount(ctx context.Context, accountID uuid.UUID, email, name, timezone string) error {
	now := time.Now()
	user := &domain.User{
		ID:        accountID,
		AccountID: accountID,
		Name:      name,
		Timezone:  timezone,
		CreatedAt: now,
		UpdatedAt: now,
	}

	return u.repo.Create(ctx, user)
}

func (u *userUseCase) GetUserIDByAccountID(ctx context.Context, accountID uuid.UUID) (uuid.UUID, error) {
	user, err := u.repo.GetByAccountID(ctx, accountID)
	if err != nil {
		return uuid.Nil, err
	}
	return user.ID, nil
}
