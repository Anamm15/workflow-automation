package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"workflow-automation/internal/modules/workspace/domain"
)

type pgWorkspaceRepo struct {
	db *pgxpool.Pool
}

func NewPGWorkspaceRepository(db *pgxpool.Pool) domain.WorkspaceRepository {
	return &pgWorkspaceRepo{db: db}
}

func (r *pgWorkspaceRepo) CreateWithMember(ctx context.Context, ws *domain.Workspace, member *domain.WorkspaceMember) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Create Workspace
	queryWs := `INSERT INTO workspaces (id, name, slug, owner_user_id, created_at, updated_at) 
				VALUES ($1, $2, $3, $4, $5, $6)`
	_, err = tx.Exec(ctx, queryWs, ws.ID, ws.Name, ws.Slug, ws.OwnerUserID, ws.CreatedAt, ws.UpdatedAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" { // unique_violation
			return fmt.Errorf("workspace slug already exists: %w", err)
		}
		return fmt.Errorf("inserting workspace: %w", err)
	}

	// 2. Create Member
	queryMem := `INSERT INTO workspace_members (id, workspace_id, user_id, role, status, created_at, updated_at) 
				 VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err = tx.Exec(ctx, queryMem, member.ID, member.WorkspaceID, member.UserID, member.Role, member.Status, member.CreatedAt, member.UpdatedAt)
	if err != nil {
		return fmt.Errorf("inserting workspace member: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *pgWorkspaceRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Workspace, error) {
	query := `SELECT id, name, slug, owner_user_id, created_at, updated_at FROM workspaces WHERE id = $1`
	var ws domain.Workspace
	err := r.db.QueryRow(ctx, query, id).Scan(&ws.ID, &ws.Name, &ws.Slug, &ws.OwnerUserID, &ws.CreatedAt, &ws.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrWorkspaceNotFound
		}
		return nil, fmt.Errorf("querying workspace by id: %w", err)
	}
	return &ws, nil
}

func (r *pgWorkspaceRepo) GetBySlug(ctx context.Context, slug string) (*domain.Workspace, error) {
	query := `SELECT id, name, slug, owner_user_id, created_at, updated_at FROM workspaces WHERE slug = $1`
	var ws domain.Workspace
	err := r.db.QueryRow(ctx, query, slug).Scan(&ws.ID, &ws.Name, &ws.Slug, &ws.OwnerUserID, &ws.CreatedAt, &ws.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrWorkspaceNotFound
		}
		return nil, fmt.Errorf("querying workspace by slug: %w", err)
	}
	return &ws, nil
}

func (r *pgWorkspaceRepo) AddMember(ctx context.Context, member *domain.WorkspaceMember) error {
	query := `INSERT INTO workspace_members (id, workspace_id, user_id, role, status, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.Exec(ctx, query, member.ID, member.WorkspaceID, member.UserID, member.Role, member.Status, member.CreatedAt, member.UpdatedAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" { // unique_violation
			return domain.ErrUserAlreadyMember
		}
		return fmt.Errorf("inserting workspace member: %w", err)
	}
	return nil
}

func (r *pgWorkspaceRepo) GetMember(ctx context.Context, workspaceID, userID uuid.UUID) (*domain.WorkspaceMember, error) {
	query := `SELECT id, workspace_id, user_id, role, status, created_at, updated_at 
			  FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`
	var m domain.WorkspaceMember
	err := r.db.QueryRow(ctx, query, workspaceID, userID).Scan(&m.ID, &m.WorkspaceID, &m.UserID, &m.Role, &m.Status, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrWorkspaceNotFound // Or a specific member not found
		}
		return nil, fmt.Errorf("querying workspace member: %w", err)
	}
	return &m, nil
}

func (r *pgWorkspaceRepo) ListMembers(ctx context.Context, workspaceID uuid.UUID, limit, offset int) ([]*domain.WorkspaceMember, error) {
	query := `SELECT id, workspace_id, user_id, role, status, created_at, updated_at 
			  FROM workspace_members WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
	rows, err := r.db.Query(ctx, query, workspaceID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("querying workspace members: %w", err)
	}
	defer rows.Close()

	var members []*domain.WorkspaceMember
	for rows.Next() {
		var m domain.WorkspaceMember
		if err := rows.Scan(&m.ID, &m.WorkspaceID, &m.UserID, &m.Role, &m.Status, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scanning workspace member: %w", err)
		}
		members = append(members, &m)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating workspace members: %w", err)
	}

	return members, nil
}
