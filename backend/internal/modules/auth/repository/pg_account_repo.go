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
	query := `INSERT INTO accounts (id, email, username, password_hash, is_verified, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7)`
	
	_, err := r.db.Exec(ctx, query, account.ID, account.Email, account.Username, account.PasswordHash, account.IsVerified, account.CreatedAt, account.UpdatedAt)
	return err
}

func (r *pgAccountRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Account, error) {
	query := `SELECT id, email, username, password_hash, is_verified, created_at, updated_at FROM accounts WHERE id = $1`
	
	var acc domain.Account
	err := r.db.QueryRow(ctx, query, id).Scan(&acc.ID, &acc.Email, &acc.Username, &acc.PasswordHash, &acc.IsVerified, &acc.CreatedAt, &acc.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrAccountNotFound
		}
		return nil, err
	}
	return &acc, nil
}

func (r *pgAccountRepo) GetByEmail(ctx context.Context, email string) (*domain.Account, error) {
	query := `SELECT id, email, username, password_hash, is_verified, created_at, updated_at FROM accounts WHERE email = $1`
	
	var acc domain.Account
	err := r.db.QueryRow(ctx, query, email).Scan(&acc.ID, &acc.Email, &acc.Username, &acc.PasswordHash, &acc.IsVerified, &acc.CreatedAt, &acc.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrAccountNotFound
		}
		return nil, err
	}
	return &acc, nil
}

func (r *pgAccountRepo) Update(ctx context.Context, account *domain.Account) error {
	query := `UPDATE accounts SET email = $1, username = $2, password_hash = $3, is_verified = $4, updated_at = $5 WHERE id = $6`
	
	_, err := r.db.Exec(ctx, query, account.Email, account.Username, account.PasswordHash, account.IsVerified, account.UpdatedAt, account.ID)
	return err
}

func (r *pgAccountRepo) SearchAccount(ctx context.Context, searchQuery string) ([]*domain.Account, error) {
	query := `SELECT id, email, username, password_hash, is_verified, created_at, updated_at 
			  FROM accounts 
			  WHERE email ILIKE $1 OR username ILIKE $1
			  LIMIT 50`
	
	likeQuery := searchQuery + "%"
	rows, err := r.db.Query(ctx, query, likeQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var accounts []*domain.Account
	for rows.Next() {
		var acc domain.Account
		if err := rows.Scan(&acc.ID, &acc.Email, &acc.Username, &acc.PasswordHash, &acc.IsVerified, &acc.CreatedAt, &acc.UpdatedAt); err != nil {
			return nil, err
		}
		accounts = append(accounts, &acc)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return accounts, nil
}
