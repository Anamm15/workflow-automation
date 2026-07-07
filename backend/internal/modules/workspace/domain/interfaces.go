package domain

import (
	"context"

	"github.com/google/uuid"
)

// WorkspaceRepository handles database operations and transaction management
type WorkspaceRepository interface {
	// CreateWithMember must be executed in a single transaction
	CreateWithMember(ctx context.Context, ws *Workspace, member *WorkspaceMember) error
	
	GetByID(ctx context.Context, id uuid.UUID) (*Workspace, error)
	GetBySlug(ctx context.Context, slug string) (*Workspace, error)
	
	// Member operations
	AddMember(ctx context.Context, member *WorkspaceMember) error
	GetMember(ctx context.Context, workspaceID, userID uuid.UUID) (*WorkspaceMember, error)
	ListMembers(ctx context.Context, workspaceID uuid.UUID, limit, offset int) ([]*WorkspaceMemberInfo, error)
	UpdateMemberRole(ctx context.Context, workspaceID, userID uuid.UUID, role WorkspaceRole) error
	
	GetDashboardInfo(ctx context.Context, userID uuid.UUID) (*DashboardInfo, error)
}

// WorkspaceUseCase defines the business logic
type WorkspaceUseCase interface {
	CreateWorkspace(ctx context.Context, name string, creatorUserID uuid.UUID) (*Workspace, error)
	AddWorkspaceMember(ctx context.Context, workspaceID, targetUserID, actionUserID uuid.UUID, role WorkspaceRole) error
	UpdateWorkspaceMemberRole(ctx context.Context, workspaceID, targetUserID, actionUserID uuid.UUID, role WorkspaceRole) error
	GetWorkspaceDetails(ctx context.Context, workspaceID uuid.UUID) (*Workspace, []*WorkspaceMemberInfo, error)
	GetDashboardInfo(ctx context.Context, userID uuid.UUID) (*DashboardInfo, error)
}
