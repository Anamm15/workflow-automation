package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"workflow-automation/internal/modules/auth/domain"
)

type pgUserRepo struct {
	db *pgxpool.Pool
}

func NewPGUserRepository(db *pgxpool.Pool) domain.UserRepository {
	return &pgUserRepo{db: db}
}

func (r *pgUserRepo) Create(ctx context.Context, user *domain.User) error {
	query := `INSERT INTO users (id, account_id, phone_number, avatar_url, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6)`
	
	_, err := r.db.Exec(ctx, query, user.ID, user.AccountID, user.PhoneNumber, user.AvatarURL, user.CreatedAt, user.UpdatedAt)
	return err
}

func (r *pgUserRepo) GetByAccountID(ctx context.Context, accountID uuid.UUID) (*domain.User, error) {
	query := `SELECT id, account_id, phone_number, avatar_url, created_at, updated_at FROM users WHERE account_id = $1`
	
	var usr domain.User
	err := r.db.QueryRow(ctx, query, accountID).Scan(&usr.ID, &usr.AccountID, &usr.PhoneNumber, &usr.AvatarURL, &usr.CreatedAt, &usr.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return &usr, nil
}

func (r *pgUserRepo) Update(ctx context.Context, user *domain.User) error {
	query := `UPDATE users SET phone_number = $1, avatar_url = $2, updated_at = $3 WHERE id = $4`
	
	_, err := r.db.Exec(ctx, query, user.PhoneNumber, user.AvatarURL, user.UpdatedAt, user.ID)
	return err
}
