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

func (r *pgWorkspaceRepo) ListMembers(ctx context.Context, workspaceID uuid.UUID, limit, offset int) ([]*domain.WorkspaceMemberInfo, error) {
	query := `
		SELECT wm.id, wm.workspace_id, wm.user_id, wm.role, wm.status, wm.created_at, wm.updated_at,
		       a.email, a.username, u.avatar_url
		FROM workspace_members wm
		JOIN users u ON wm.user_id = u.id
		JOIN accounts a ON u.account_id = a.id
		WHERE wm.workspace_id = $1 
		ORDER BY wm.created_at DESC 
		LIMIT $2 OFFSET $3`
		
	rows, err := r.db.Query(ctx, query, workspaceID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("querying workspace members: %w", err)
	}
	defer rows.Close()

	var members []*domain.WorkspaceMemberInfo
	for rows.Next() {
		var m domain.WorkspaceMemberInfo
		if err := rows.Scan(
			&m.ID, &m.WorkspaceID, &m.UserID, &m.Role, &m.Status, &m.CreatedAt, &m.UpdatedAt,
			&m.UserEmail, &m.UserUsername, &m.UserAvatar,
		); err != nil {
			return nil, fmt.Errorf("scanning workspace member info: %w", err)
		}
		members = append(members, &m)
	}
	
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating workspace members: %w", err)
	}

	return members, nil
}

func (r *pgWorkspaceRepo) UpdateMemberRole(ctx context.Context, workspaceID, userID uuid.UUID, role domain.WorkspaceRole) error {
	query := `UPDATE workspace_members SET role = $1, updated_at = NOW() WHERE workspace_id = $2 AND user_id = $3`
	tag, err := r.db.Exec(ctx, query, role, workspaceID, userID)
	if err != nil {
		return fmt.Errorf("updating workspace member role: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrWorkspaceNotFound // Or member not found
	}
	return nil
}

func (r *pgWorkspaceRepo) GetDashboardInfo(ctx context.Context, userID uuid.UUID) (*domain.DashboardInfo, error) {
	var info domain.DashboardInfo
	info.RecentWorkspaces = make([]domain.DashboardWorkspace, 0)
	info.RecentActivities = make([]domain.WorkspaceActivity, 0)

	// 1. Total workspaces
	err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM workspace_members WHERE user_id = $1 AND status != 'disabled'", userID).Scan(&info.Metrics.TotalWorkspaces)
	if err != nil {
		return nil, fmt.Errorf("counting total workspaces: %w", err)
	}

	// 2. Active members across all user's workspaces
	err = r.db.QueryRow(ctx, `
		SELECT COUNT(DISTINCT wm.user_id) 
		FROM workspace_members wm 
		WHERE wm.workspace_id IN (
			SELECT workspace_id FROM workspace_members WHERE user_id = $1 AND status != 'disabled'
		) AND wm.status = 'active'
	`, userID).Scan(&info.Metrics.ActiveMembers)
	if err != nil {
		return nil, fmt.Errorf("counting active members: %w", err)
	}

	// 3. Pending invites
	err = r.db.QueryRow(ctx, "SELECT COUNT(*) FROM workspace_members WHERE user_id = $1 AND status = 'invited'", userID).Scan(&info.Metrics.PendingInvites)
	if err != nil {
		return nil, fmt.Errorf("counting pending invites: %w", err)
	}

	info.Metrics.ResourceUsage = 64 // Mock data for now since we don't have resource usage

	// 4. Recent Workspaces
	wsQuery := `
		SELECT w.id, w.name, w.slug, w.owner_user_id, w.created_at, w.updated_at, wm.role,
		       (SELECT COUNT(*) FROM workspace_members WHERE workspace_id = w.id AND status != 'disabled') as members_count
		FROM workspaces w
		JOIN workspace_members wm ON w.id = wm.workspace_id
		WHERE wm.user_id = $1 AND wm.status != 'disabled'
		ORDER BY w.updated_at DESC
		LIMIT 3
	`
	wsRows, err := r.db.Query(ctx, wsQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("querying recent workspaces: %w", err)
	}
	defer wsRows.Close()

	for wsRows.Next() {
		var w domain.DashboardWorkspace
		if err := wsRows.Scan(&w.ID, &w.Name, &w.Slug, &w.OwnerUserID, &w.CreatedAt, &w.UpdatedAt, &w.Role, &w.MembersCount); err != nil {
			return nil, fmt.Errorf("scanning recent workspace: %w", err)
		}
		info.RecentWorkspaces = append(info.RecentWorkspaces, w)
	}
	if err := wsRows.Err(); err != nil {
		return nil, fmt.Errorf("iterating recent workspaces: %w", err)
	}

	// 5. Recent Activities
	actQuery := `
		SELECT wa.id, wa.workspace_id, w.name, wa.user_id, u.name, wa.action, wa.created_at
		FROM workspace_activities wa
		JOIN workspaces w ON wa.workspace_id = w.id
		JOIN users u ON wa.user_id = u.id
		WHERE wa.workspace_id IN (
			SELECT workspace_id FROM workspace_members WHERE user_id = $1 AND status != 'disabled'
		)
		ORDER BY wa.created_at DESC
		LIMIT 4
	`
	actRows, err := r.db.Query(ctx, actQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("querying recent activities: %w", err)
	}
	defer actRows.Close()

	for actRows.Next() {
		var a domain.WorkspaceActivity
		if err := actRows.Scan(&a.ID, &a.WorkspaceID, &a.WorkspaceName, &a.UserID, &a.UserName, &a.Action, &a.CreatedAt); err != nil {
			return nil, fmt.Errorf("scanning recent activity: %w", err)
		}
		info.RecentActivities = append(info.RecentActivities, a)
	}
	if err := actRows.Err(); err != nil {
		return nil, fmt.Errorf("iterating recent activities: %w", err)
	}

	return &info, nil
}
