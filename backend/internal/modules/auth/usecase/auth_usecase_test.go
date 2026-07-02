package usecase

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"workflow-automation/internal/modules/auth/domain"
)

// --- Manual Mocks ---
type mockAccRepo struct {
	accounts map[string]*domain.Account // key: email
}
func (m *mockAccRepo) Create(ctx context.Context, a *domain.Account) error {
	m.accounts[a.Email] = a
	return nil
}
func (m *mockAccRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Account, error) {
	for _, v := range m.accounts {
		if v.ID == id {
			return v, nil
		}
	}
	return nil, domain.ErrAccountNotFound
}
func (m *mockAccRepo) GetByEmail(ctx context.Context, email string) (*domain.Account, error) {
	if acc, ok := m.accounts[email]; ok {
		return acc, nil
	}
	return nil, domain.ErrAccountNotFound
}
func (m *mockAccRepo) Update(ctx context.Context, a *domain.Account) error {
	m.accounts[a.Email] = a
	return nil
}

type mockUsrRepo struct{}
func (m *mockUsrRepo) Create(ctx context.Context, u *domain.User) error { return nil }
func (m *mockUsrRepo) GetByAccountID(ctx context.Context, id uuid.UUID) (*domain.User, error) { return nil, nil }
func (m *mockUsrRepo) Update(ctx context.Context, u *domain.User) error { return nil }

type mockSessRepo struct {
	sessions map[uuid.UUID]*domain.Session
}
func (m *mockSessRepo) Create(ctx context.Context, s *domain.Session) error {
	m.sessions[s.ID] = s
	return nil
}
func (m *mockSessRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Session, error) {
	if s, ok := m.sessions[id]; ok {
		return s, nil
	}
	return nil, domain.ErrSessionNotFound
}
func (m *mockSessRepo) GetByRefreshTokenHash(ctx context.Context, hash string) (*domain.Session, error) {
	for _, v := range m.sessions {
		if v.RefreshTokenHash == hash {
			return v, nil
		}
	}
	return nil, domain.ErrSessionNotFound
}
func (m *mockSessRepo) Update(ctx context.Context, s *domain.Session) error {
	m.sessions[s.ID] = s
	return nil
}
func (m *mockSessRepo) RevokeAllByAccountID(ctx context.Context, accID uuid.UUID) error {
	for _, v := range m.sessions {
		if v.AccountID == accID {
			v.Revoked = true
		}
	}
	return nil
}

type mockEmail struct{}
func (m *mockEmail) SendVerificationEmail(ctx context.Context, toEmail, token string) error { return nil }
func (m *mockEmail) SendPasswordResetEmail(ctx context.Context, toEmail, token string) error { return nil }

// --- Tests ---
func TestRegisterAndLoginFlow(t *testing.T) {
	uc := NewAuthUseCase(
		&mockAccRepo{accounts: make(map[string]*domain.Account)},
		&mockUsrRepo{},
		&mockSessRepo{sessions: make(map[uuid.UUID]*domain.Session)},
		&mockEmail{},
		"secret",
	)

	ctx := context.Background()

	// 1. Register
	err := uc.Register(ctx, "test@example.com", "Password123!")
	if err != nil {
		t.Fatalf("Expected nil, got %v", err)
	}

	// 2. Login
	tokens, err := uc.Login(ctx, "test@example.com", "Password123!", "Agent", "127.0.0.1")
	if err != nil {
		t.Fatalf("Expected nil, got %v", err)
	}
	if tokens.AccessToken == "" || tokens.RefreshToken == "" {
		t.Fatalf("Expected tokens to be populated")
	}

	// 3. Refresh Rotation
	_, err = uc.RefreshToken(ctx, tokens.RefreshToken, "Agent", "127.0.0.1")
	if err != nil {
		t.Fatalf("Expected nil, got %v", err)
	}

	// 4. Replay Attack (using old token again)
	_, err = uc.RefreshToken(ctx, tokens.RefreshToken, "Agent", "127.0.0.1")
	if err != domain.ErrReplayAttack {
		t.Fatalf("Expected ErrReplayAttack, got %v", err)
	}
}
