package usecase

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"workflow-automation/internal/modules/auth/domain"
	"workflow-automation/internal/modules/auth/util"
)

const (
	AccessTokenExpiry  = 10 * time.Minute
	RefreshTokenExpiry = 7 * 24 * time.Hour
)

type authUseCase struct {
	accRepo   domain.AccountRepository
	userFac   domain.UserProfileFacade
	sessRepo  domain.SessionRepository
	emailSvc  domain.EmailService
	jwtSecret string
}

func NewAuthUseCase(
	accRepo domain.AccountRepository,
	userFac domain.UserProfileFacade,
	sessRepo domain.SessionRepository,
	emailSvc domain.EmailService,
	jwtSecret string,
) domain.AuthUseCase {
	return &authUseCase{
		accRepo:   accRepo,
		userFac:   userFac,
		sessRepo:  sessRepo,
		emailSvc:  emailSvc,
		jwtSecret: jwtSecret,
	}
}

func (u *authUseCase) Register(ctx context.Context, email, password string) error {
	_, err := u.accRepo.GetByEmail(ctx, email)
	if err == nil {
		return domain.ErrEmailAlreadyExists
	}

	hashedPassword, err := util.HashPassword(password)
	if err != nil {
		return err
	}

	now := time.Now()
	account := &domain.Account{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: hashedPassword,
		IsVerified:   false, // Can be set to true if verification is skipped
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := u.accRepo.Create(ctx, account); err != nil {
		return err
	}

	// Trigger User Module to create profile
	if err := u.userFac.CreateUserForAccount(ctx, account.ID, email); err != nil {
		return err
	}

	return nil
}

func (u *authUseCase) Login(ctx context.Context, email, password, userAgent, ipAddress string) (*domain.TokenPair, error) {
	account, err := u.accRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	if !util.CheckPasswordHash(password, account.PasswordHash) {
		return nil, domain.ErrInvalidCredentials
	}

	// Generate Session & Tokens
	sessionID := uuid.New()

	rtPlain, err := util.GenerateSecureToken(32) // 256 bits
	if err != nil {
		return nil, err
	}

	rtHash := util.HashTokenSHA256(rtPlain)
	rtSend := sessionID.String() + "." + rtPlain
	now := time.Now()

	session := &domain.Session{
		ID:               sessionID,
		AccountID:        account.ID,
		RefreshTokenHash: rtHash,
		UserAgent:        userAgent,
		IPAddress:        ipAddress,
		CreatedAt:        now,
		LastUsedAt:       now,
		ExpiresAt:        now.Add(RefreshTokenExpiry),
		Revoked:          false,
	}

	if err := u.sessRepo.Create(ctx, session); err != nil {
		return nil, err
	}

	accessToken, err := util.GenerateJWT(account.ID, sessionID, "user", u.jwtSecret, AccessTokenExpiry)
	if err != nil {
		return nil, err
	}

	return &domain.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: rtSend,
	}, nil
}

func (u *authUseCase) RefreshToken(ctx context.Context, oldRefreshTokenPlain, userAgent, ipAddress string) (*domain.TokenPair, error) {
	parts := strings.Split(oldRefreshTokenPlain, ".")
	if len(parts) != 2 {
		return nil, domain.ErrUnauthorized
	}

	sessionID, err := uuid.Parse(parts[0])
	if err != nil {
		return nil, domain.ErrUnauthorized
	}

	oldHash := util.HashTokenSHA256(parts[1])

	session, err := u.sessRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, domain.ErrUnauthorized
	}

	if session.RefreshTokenHash != oldHash {
		// REPLAY ATTACK! Hash mismatch means they used an old token.
		_ = u.sessRepo.RevokeAllByAccountID(ctx, session.AccountID)
		return nil, domain.ErrReplayAttack
	}

	if !session.IsValid() {
		return nil, domain.ErrSessionExpired
	}

	// Generate New Tokens
	newRefreshTokenPlain, err := util.GenerateSecureToken(32)
	if err != nil {
		return nil, err
	}

	newHash := util.HashTokenSHA256(newRefreshTokenPlain)
	newRtSend := sessionID.String() + "." + newRefreshTokenPlain
	now := time.Now()

	// Update Session (Rotation)
	session.RefreshTokenHash = newHash
	session.LastUsedAt = now
	// Depending on policy, we might extend ExpiresAt here, but usually it keeps its original deadline or extends by a small amount.
	// For now, let's keep the original expiration but update the token hash.

	if err := u.sessRepo.Update(ctx, session); err != nil {
		return nil, err
	}

	accessToken, err := util.GenerateJWT(session.AccountID, session.ID, "user", u.jwtSecret, AccessTokenExpiry)
	if err != nil {
		return nil, err
	}

	return &domain.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: newRtSend,
	}, nil
}

func (u *authUseCase) Logout(ctx context.Context, refreshTokenPlain string) error {
	parts := strings.Split(refreshTokenPlain, ".")
	if len(parts) != 2 {
		return domain.ErrUnauthorized
	}

	sessionID, err := uuid.Parse(parts[0])
	if err != nil {
		return domain.ErrUnauthorized
	}

	session, err := u.sessRepo.GetByID(ctx, sessionID)
	if err != nil {
		return err // Or nil, since they are logging out anyway
	}

	session.Revoked = true
	return u.sessRepo.Update(ctx, session)
}

func (u *authUseCase) LogoutAll(ctx context.Context, accountID uuid.UUID) error {
	return u.sessRepo.RevokeAllByAccountID(ctx, accountID)
}

func (u *authUseCase) GetMe(ctx context.Context, accountID uuid.UUID) (*domain.Account, error) {
	acc, err := u.accRepo.GetByID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	return acc, nil
}

func (u *authUseCase) ChangePassword(ctx context.Context, accountID uuid.UUID, oldPassword, newPassword string) error {
	acc, err := u.accRepo.GetByID(ctx, accountID)
	if err != nil {
		return err
	}

	if !util.CheckPasswordHash(oldPassword, acc.PasswordHash) {
		return domain.ErrInvalidCredentials
	}

	newHash, err := util.HashPassword(newPassword)
	if err != nil {
		return err
	}

	acc.PasswordHash = newHash
	acc.UpdatedAt = time.Now()

	if err := u.accRepo.Update(ctx, acc); err != nil {
		return err
	}

	// Revoke all sessions on password change
	return u.sessRepo.RevokeAllByAccountID(ctx, accountID)
}

func (u *authUseCase) ForgotPassword(ctx context.Context, email string) error {
	// Implement Forgot Password logic
	// e.g., Generate reset token, store in cache/DB, send via u.emailSvc
	return nil
}

func (u *authUseCase) ResetPassword(ctx context.Context, token, newPassword string) error {
	// Implement Reset Password logic
	return nil
}

func (u *authUseCase) VerifyEmail(ctx context.Context, token string) error {
	// Implement Verify Email logic
	return nil
}

func (u *authUseCase) ResendVerification(ctx context.Context, email string) error {
	// Implement Resend Verification logic
	return nil
}
