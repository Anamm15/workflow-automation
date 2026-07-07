package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"workflow-automation/internal/modules/workspace/domain"
)

type workspaceUseCase struct {
	repo domain.WorkspaceRepository
}

func NewWorkspaceUseCase(repo domain.WorkspaceRepository) domain.WorkspaceUseCase {
	return &workspaceUseCase{repo: repo}
}

func (u *workspaceUseCase) CreateWorkspace(ctx context.Context, name string, creatorUserID uuid.UUID) (*domain.Workspace, error) {
	if name == "" {
		return nil, domain.ErrInvalidInput
	}

	workspaceID := uuid.New()
	baseSlug := slug.Make(name)
	uniqueSlug := fmt.Sprintf("%s-%s", baseSlug, workspaceID.String()[:8])
	now := time.Now()

	ws := &domain.Workspace{
		ID:          workspaceID,
		Name:        name,
		Slug:        uniqueSlug,
		OwnerUserID: creatorUserID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	member := &domain.WorkspaceMember{
		ID:          uuid.New(),
		WorkspaceID: workspaceID,
		UserID:      creatorUserID,
		Role:        domain.RoleOwner, // Default creator role as requested
		Status:      domain.StatusActive,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := u.repo.CreateWithMember(ctx, ws, member); err != nil {
		return nil, fmt.Errorf("creating workspace with member: %w", err)
	}

	return ws, nil
}

func (u *workspaceUseCase) AddWorkspaceMember(ctx context.Context, workspaceID, targetUserID, actionUserID uuid.UUID, role domain.WorkspaceRole) error {
	// 1. Verify actionUserID has permission (must be owner or admin)
	actionMember, err := u.repo.GetMember(ctx, workspaceID, actionUserID)
	if err != nil {
		return fmt.Errorf("checking authorization: %w", err)
	}

	if actionMember.Role != domain.RoleOwner && actionMember.Role != domain.RoleAdmin {
		return domain.ErrUnauthorizedAction
	}

	// 2. Idempotency Check / Prevent duplicate additions
	// (Though the database has a unique constraint, checking here allows for specific domain errors early)
	existing, err := u.repo.GetMember(ctx, workspaceID, targetUserID)
	if err == nil && existing != nil {
		return domain.ErrUserAlreadyMember
	}

	// 3. Add Member
	now := time.Now()
	newMember := &domain.WorkspaceMember{
		ID:          uuid.New(),
		WorkspaceID: workspaceID,
		UserID:      targetUserID,
		Role:        role,
		Status:      domain.StatusActive, // Automatically active or invited depending on future requirements
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := u.repo.AddMember(ctx, newMember); err != nil {
		return fmt.Errorf("adding member to workspace: %w", err)
	}

	return nil
}

func (u *workspaceUseCase) UpdateWorkspaceMemberRole(ctx context.Context, workspaceID, targetUserID, actionUserID uuid.UUID, role domain.WorkspaceRole) error {
	// 1. Verify actionUserID has permission (must be owner or admin)
	actionMember, err := u.repo.GetMember(ctx, workspaceID, actionUserID)
	if err != nil {
		return fmt.Errorf("checking authorization: %w", err)
	}

	if actionMember.Role != domain.RoleOwner && actionMember.Role != domain.RoleAdmin {
		return domain.ErrUnauthorizedAction
	}

	// 2. Prevent changing owner role if you're not an owner
	if actionMember.Role == domain.RoleAdmin && role == domain.RoleOwner {
		return domain.ErrUnauthorizedAction
	}

	// 3. Update Member Role
	if err := u.repo.UpdateMemberRole(ctx, workspaceID, targetUserID, role); err != nil {
		return fmt.Errorf("updating member role: %w", err)
	}

	return nil
}

func (u *workspaceUseCase) GetWorkspaceDetails(ctx context.Context, workspaceID uuid.UUID) (*domain.Workspace, []*domain.WorkspaceMemberInfo, error) {
	ws, err := u.repo.GetByID(ctx, workspaceID)
	if err != nil {
		return nil, nil, fmt.Errorf("getting workspace details: %w", err)
	}

	members, err := u.repo.ListMembers(ctx, workspaceID, 50, 0) // Basic pagination for now
	if err != nil {
		return nil, nil, fmt.Errorf("listing workspace members: %w", err)
	}

	return ws, members, nil
}

func (u *workspaceUseCase) GetDashboardInfo(ctx context.Context, userID uuid.UUID) (*domain.DashboardInfo, error) {
	info, err := u.repo.GetDashboardInfo(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("getting dashboard info: %w", err)
	}

	return info, nil
}
