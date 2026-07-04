package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"workflow-automation/internal/modules/user/domain"
)

type pgUserRepo struct {
	db *pgxpool.Pool
}

func NewPGUserRepository(db *pgxpool.Pool) domain.UserRepository {
	return &pgUserRepo{db: db}
}

func (r *pgUserRepo) Create(ctx context.Context, user *domain.User) error {
	query := `INSERT INTO users (id, account_id, name, avatar_url, ui_preferences, timezone, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	
	_, err := r.db.Exec(ctx, query, user.ID, user.AccountID, user.Name, user.AvatarURL, user.UIPreferences, user.Timezone, user.CreatedAt, user.UpdatedAt)
	return err
}

func (r *pgUserRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	query := `SELECT id, account_id, name, avatar_url, ui_preferences, timezone, created_at, updated_at FROM users WHERE id = $1`
	
	var usr domain.User
	err := r.db.QueryRow(ctx, query, id).Scan(&usr.ID, &usr.AccountID, &usr.Name, &usr.AvatarURL, &usr.UIPreferences, &usr.Timezone, &usr.CreatedAt, &usr.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &usr, nil
}

func (r *pgUserRepo) GetByAccountID(ctx context.Context, accountID uuid.UUID) (*domain.User, error) {
	query := `SELECT id, account_id, name, avatar_url, ui_preferences, timezone, created_at, updated_at FROM users WHERE account_id = $1`
	
	var usr domain.User
	err := r.db.QueryRow(ctx, query, accountID).Scan(&usr.ID, &usr.AccountID, &usr.Name, &usr.AvatarURL, &usr.UIPreferences, &usr.Timezone, &usr.CreatedAt, &usr.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &usr, nil
}

func (r *pgUserRepo) Update(ctx context.Context, user *domain.User) error {
	query := `UPDATE users SET name = $1, avatar_url = $2, ui_preferences = $3, timezone = $4, updated_at = $5 WHERE id = $6`
	
	_, err := r.db.Exec(ctx, query, user.Name, user.AvatarURL, user.UIPreferences, user.Timezone, user.UpdatedAt, user.ID)
	return err
}
