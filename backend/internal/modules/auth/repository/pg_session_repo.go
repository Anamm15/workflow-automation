package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"workflow-automation/internal/modules/auth/domain"
)

type pgSessionRepo struct {
	db *pgxpool.Pool
}

func NewPGSessionRepository(db *pgxpool.Pool) domain.SessionRepository {
	return &pgSessionRepo{db: db}
}

func (r *pgSessionRepo) Create(ctx context.Context, session *domain.Session) error {
	query := `INSERT INTO sessions (id, account_id, refresh_token_hash, user_agent, ip_address, created_at, last_used_at, expires_at, revoked) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	
	_, err := r.db.Exec(ctx, query, session.ID, session.AccountID, session.RefreshTokenHash, session.UserAgent, session.IPAddress, session.CreatedAt, session.LastUsedAt, session.ExpiresAt, session.Revoked)
	return err
}

func (r *pgSessionRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Session, error) {
	query := `SELECT id, account_id, refresh_token_hash, user_agent, ip_address, created_at, last_used_at, expires_at, revoked 
			  FROM sessions WHERE id = $1`
	
	var sess domain.Session
	err := r.db.QueryRow(ctx, query, id).Scan(
		&sess.ID, &sess.AccountID, &sess.RefreshTokenHash, &sess.UserAgent, &sess.IPAddress, 
		&sess.CreatedAt, &sess.LastUsedAt, &sess.ExpiresAt, &sess.Revoked,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrSessionNotFound
		}
		return nil, err
	}
	return &sess, nil
}

func (r *pgSessionRepo) GetByRefreshTokenHash(ctx context.Context, hash string) (*domain.Session, error) {
	query := `SELECT id, account_id, refresh_token_hash, user_agent, ip_address, created_at, last_used_at, expires_at, revoked 
			  FROM sessions WHERE refresh_token_hash = $1`
	
	var sess domain.Session
	err := r.db.QueryRow(ctx, query, hash).Scan(
		&sess.ID, &sess.AccountID, &sess.RefreshTokenHash, &sess.UserAgent, &sess.IPAddress, 
		&sess.CreatedAt, &sess.LastUsedAt, &sess.ExpiresAt, &sess.Revoked,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrSessionNotFound
		}
		return nil, err
	}
	return &sess, nil
}

func (r *pgSessionRepo) Update(ctx context.Context, session *domain.Session) error {
	query := `UPDATE sessions 
			  SET refresh_token_hash = $1, last_used_at = $2, expires_at = $3, revoked = $4 
			  WHERE id = $5`
	
	_, err := r.db.Exec(ctx, query, session.RefreshTokenHash, session.LastUsedAt, session.ExpiresAt, session.Revoked, session.ID)
	return err
}

func (r *pgSessionRepo) RevokeAllByAccountID(ctx context.Context, accountID uuid.UUID) error {
	query := `UPDATE sessions SET revoked = TRUE WHERE account_id = $1`
	
	_, err := r.db.Exec(ctx, query, accountID)
	return err
}
