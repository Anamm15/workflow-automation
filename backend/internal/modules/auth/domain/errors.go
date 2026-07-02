package domain

import "errors"

var (
	ErrAccountNotFound    = errors.New("account not found")
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrSessionNotFound    = errors.New("session not found")
	ErrSessionExpired     = errors.New("session has expired")
	ErrSessionRevoked     = errors.New("session is revoked")
	ErrInvalidToken       = errors.New("invalid token")
	ErrReplayAttack       = errors.New("refresh token reuse detected (replay attack)")
	ErrUnauthorized       = errors.New("unauthorized")
)
