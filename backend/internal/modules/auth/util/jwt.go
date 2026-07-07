package util

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// Define minimal payload as requested: sub, session_id, role, exp
type JWTPayload struct {
	Sub       uuid.UUID `json:"sub"`
	Uid       uuid.UUID `json:"uid"`
	SessionID uuid.UUID `json:"session_id"`
	Role      string    `json:"role"`
	jwt.RegisteredClaims
}

func GenerateJWT(accountID, userID, sessionID uuid.UUID, role, secret string, d time.Duration) (string, error) {
	claims := JWTPayload{
		Sub:       accountID,
		Uid:       userID,
		SessionID: sessionID,
		Role:      role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(d)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
