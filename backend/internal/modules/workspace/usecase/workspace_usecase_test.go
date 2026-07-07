package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"workflow-automation/internal/modules/workspace/domain"
)

type mockWorkspaceRepo struct {
	workspaces map[uuid.UUID]*domain.Workspace
	members    map[string]*domain.WorkspaceMember // key: workspaceID_userID
}

func (m *mockWorkspaceRepo) CreateWithMember(ctx context.Context, ws *domain.Workspace, member *domain.WorkspaceMember) error {
	m.workspaces[ws.ID] = ws
	m.members[ws.ID.String()+"_"+member.UserID.String()] = member
	return nil
}

func (m *mockWorkspaceRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.Workspace, error) {
	if ws, ok := m.workspaces[id]; ok {
		return ws, nil
	}
	return nil, domain.ErrWorkspaceNotFound
}

func (m *mockWorkspaceRepo) GetBySlug(ctx context.Context, slug string) (*domain.Workspace, error) {
	for _, ws := range m.workspaces {
		if ws.Slug == slug {
			return ws, nil
		}
	}
	return nil, domain.ErrWorkspaceNotFound
}

func (m *mockWorkspaceRepo) AddMember(ctx context.Context, member *domain.WorkspaceMember) error {
	key := member.WorkspaceID.String() + "_" + member.UserID.String()
	if _, exists := m.members[key]; exists {
		return domain.ErrUserAlreadyMember
	}
	m.members[key] = member
	return nil
}

func (m *mockWorkspaceRepo) GetMember(ctx context.Context, workspaceID, userID uuid.UUID) (*domain.WorkspaceMember, error) {
	key := workspaceID.String() + "_" + userID.String()
	if member, ok := m.members[key]; ok {
		return member, nil
	}
	return nil, errors.New("member not found")
}

func (m *mockWorkspaceRepo) ListMembers(ctx context.Context, workspaceID uuid.UUID, limit, offset int) ([]*domain.WorkspaceMemberInfo, error) {
	var res []*domain.WorkspaceMemberInfo
	for _, mem := range m.members {
		if mem.WorkspaceID == workspaceID {
			res = append(res, &domain.WorkspaceMemberInfo{
				WorkspaceMember: *mem,
			})
		}
	}
	return res, nil
}

func (m *mockWorkspaceRepo) UpdateMemberRole(ctx context.Context, workspaceID, userID uuid.UUID, role domain.WorkspaceRole) error {
	key := workspaceID.String() + "_" + userID.String()
	if mem, ok := m.members[key]; ok {
		mem.Role = role
		return nil
	}
	return errors.New("member not found")
}

func (m *mockWorkspaceRepo) GetDashboardInfo(ctx context.Context, userID uuid.UUID) (*domain.DashboardInfo, error) {
	return &domain.DashboardInfo{}, nil
}

func TestWorkspaceUseCase_CreateWorkspace(t *testing.T) {
	repo := &mockWorkspaceRepo{
		workspaces: make(map[uuid.UUID]*domain.Workspace),
		members:    make(map[string]*domain.WorkspaceMember),
	}
	uc := NewWorkspaceUseCase(repo)

	ctx := context.Background()
	creatorID := uuid.New()

	ws, err := uc.CreateWorkspace(ctx, "My Workspace", creatorID)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if ws.Name != "My Workspace" {
		t.Errorf("Expected name 'My Workspace', got %v", ws.Name)
	}

	mem, err := repo.GetMember(ctx, ws.ID, creatorID)
	if err != nil {
		t.Fatalf("Expected member to be created, got error: %v", err)
	}
	if mem.Role != domain.RoleOwner {
		t.Errorf("Expected creator to be owner, got %v", mem.Role)
	}
}

func TestWorkspaceUseCase_AddWorkspaceMember(t *testing.T) {
	repo := &mockWorkspaceRepo{
		workspaces: make(map[uuid.UUID]*domain.Workspace),
		members:    make(map[string]*domain.WorkspaceMember),
	}
	uc := NewWorkspaceUseCase(repo)

	ctx := context.Background()
	ownerID := uuid.New()
	targetID := uuid.New()
	ws, _ := uc.CreateWorkspace(ctx, "Test WS", ownerID)

	// 1. Success (Owner adds Target)
	err := uc.AddWorkspaceMember(ctx, ws.ID, targetID, ownerID, domain.RoleEditor)
	if err != nil {
		t.Fatalf("Expected no error when owner adds member, got %v", err)
	}

	// 2. Fail (Target tries to add another user, but Target is Editor, not Admin)
	thirdID := uuid.New()
	err = uc.AddWorkspaceMember(ctx, ws.ID, thirdID, targetID, domain.RoleViewer)
	if err != domain.ErrUnauthorizedAction {
		t.Fatalf("Expected ErrUnauthorizedAction, got %v", err)
	}

	// 3. Fail (Idempotency check - Target is already member)
	err = uc.AddWorkspaceMember(ctx, ws.ID, targetID, ownerID, domain.RoleViewer)
	if err != domain.ErrUserAlreadyMember {
		t.Fatalf("Expected ErrUserAlreadyMember, got %v", err)
	}
}
