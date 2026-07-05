package domain

import (
	"time"

	"github.com/google/uuid"
)

type WorkspaceRole string

const (
	RoleOwner  WorkspaceRole = "owner"
	RoleAdmin  WorkspaceRole = "admin"
	RoleEditor WorkspaceRole = "editor"
	RoleViewer WorkspaceRole = "viewer"
)

type WorkspaceMemberStatus string

const (
	StatusActive   WorkspaceMemberStatus = "active"
	StatusInvited  WorkspaceMemberStatus = "invited"
	StatusDisabled WorkspaceMemberStatus = "disabled"
)

type Workspace struct {
	ID          uuid.UUID
	Name        string
	Slug        string
	OwnerUserID uuid.UUID
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type WorkspaceMember struct {
	ID          uuid.UUID
	WorkspaceID uuid.UUID
	UserID      uuid.UUID
	Role        WorkspaceRole
	Status      WorkspaceMemberStatus
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
