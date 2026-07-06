package http

import (
	"time"

	"github.com/google/uuid"
	"workflow-automation/internal/modules/workspace/domain"
)

type CreateWorkspaceRequest struct {
	Name string `json:"name" binding:"required,min=2,max=255"`
}

type WorkspaceResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	CreatedAt time.Time `json:"created_at"`
}

type AddWorkspaceMemberRequest struct {
	UserID uuid.UUID            `json:"user_id" binding:"required"`
	Role   domain.WorkspaceRole `json:"role" binding:"required,oneof=owner admin editor viewer"`
}

type WorkspaceMemberResponse struct {
	ID          uuid.UUID                    `json:"id"`
	UserID      uuid.UUID                    `json:"user_id"`
	UserEmail   string                       `json:"user_email"`
	UserUsername string                      `json:"user_username"`
	UserAvatar  *string                      `json:"user_avatar,omitempty"`
	Role        domain.WorkspaceRole         `json:"role"`
	Status      domain.WorkspaceMemberStatus `json:"status"`
	JoinedAt    time.Time                    `json:"joined_at"`
}

type WorkspaceDetailsResponse struct {
	Workspace WorkspaceResponse         `json:"workspace"`
	Members   []WorkspaceMemberResponse `json:"members"`
}

type UpdateWorkspaceMemberRoleRequest struct {
	Role domain.WorkspaceRole `json:"role" binding:"required,oneof=owner admin editor viewer"`
}
