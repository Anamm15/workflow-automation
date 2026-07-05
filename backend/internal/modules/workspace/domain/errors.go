package domain

import "errors"

var (
	ErrWorkspaceNotFound  = errors.New("workspace not found")
	ErrUnauthorizedAction = errors.New("unauthorized action in workspace")
	ErrUserAlreadyMember  = errors.New("user is already a member of the workspace")
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidInput       = errors.New("invalid input")
)
