package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"workflow-automation/internal/shared/response"
)

type UserContext struct {
	AccountID uuid.UUID
	UserID    uuid.UUID
	SessionID uuid.UUID
	Role      string
}

func JWTAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, http.StatusUnauthorized, "authorization header missing", "UNAUTHORIZED")
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			response.Error(c, http.StatusUnauthorized, "invalid authorization header format", "UNAUTHORIZED")
			return
		}

		tokenString := parts[1]

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			response.Error(c, http.StatusUnauthorized, "invalid or expired access token", "UNAUTHORIZED")
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			response.Error(c, http.StatusUnauthorized, "invalid token claims", "UNAUTHORIZED")
			return
		}

		accIDStr, ok := claims["sub"].(string)
		uidStr, ok3 := claims["uid"].(string)
		sessIDStr, ok2 := claims["session_id"].(string)
		if !ok || !ok2 || !ok3 {
			response.Error(c, http.StatusUnauthorized, "invalid token payload", "UNAUTHORIZED")
			return
		}

		accID, _ := uuid.Parse(accIDStr)
		uid, _ := uuid.Parse(uidStr)
		sessID, _ := uuid.Parse(sessIDStr)
		role, _ := claims["role"].(string)

		c.Set("user", UserContext{
			AccountID: accID,
			UserID:    uid,
			SessionID: sessID,
			Role:      role,
		})

		c.Next()
	}
}

// GetUserContext extracts UserContext from Gin context
func GetUserContext(c *gin.Context) (UserContext, bool) {
	usr, exists := c.Get("user")
	if !exists {
		return UserContext{}, false
	}
	ctx, ok := usr.(UserContext)
	return ctx, ok
}
