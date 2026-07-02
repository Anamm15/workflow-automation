package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"workflow-automation/internal/modules/auth/domain"
)

type pgAccountRepo struct {
	db *pgxpool.Pool
}

func NewPGAccountRepository(db *pgxpool.Pool) domain.AccountRepository {
	return &pgAccountRepo{db: db}
}

func (r *pgAccountRepo) Create(ctx context.Context, account *domain.Account) error {
	query := `INSERT INTO accounts (id, email, password_hash, is_verified, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6)`
	
	_, err := r.db.Exec(ctx, query, account.ID, account.Email, account.PasswordHash, account.IsVerified, account.CreatedAt, account.UpdatedAt)
	return err
}

func (r *pgAccountRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Account, error) {
	query := `SELECT id, email, password_hash, is_verified, created_at, updated_at FROM accounts WHERE id = $1`
	
	var acc domain.Account
	err := r.db.QueryRow(ctx, query, id).Scan(&acc.ID, &acc.Email, &acc.PasswordHash, &acc.IsVerified, &acc.CreatedAt, &acc.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrAccountNotFound
		}
		return nil, err
	}
	return &acc, nil
}

func (r *pgAccountRepo) GetByEmail(ctx context.Context, email string) (*domain.Account, error) {
	query := `SELECT id, email, password_hash, is_verified, created_at, updated_at FROM accounts WHERE email = $1`
	
	var acc domain.Account
	err := r.db.QueryRow(ctx, query, email).Scan(&acc.ID, &acc.Email, &acc.PasswordHash, &acc.IsVerified, &acc.CreatedAt, &acc.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrAccountNotFound
		}
		return nil, err
	}
	return &acc, nil
}

func (r *pgAccountRepo) Update(ctx context.Context, account *domain.Account) error {
	query := `UPDATE accounts SET email = $1, password_hash = $2, is_verified = $3, updated_at = $4 WHERE id = $5`
	
	_, err := r.db.Exec(ctx, query, account.Email, account.PasswordHash, account.IsVerified, account.UpdatedAt, account.ID)
	return err
}
