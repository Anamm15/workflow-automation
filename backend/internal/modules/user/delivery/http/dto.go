package http

import (
	"encoding/json"
	"time"
)

type UpdateProfileRequest struct {
	Name          string          `json:"name" binding:"required,min=2,max=255"`
	AvatarURL     *string         `json:"avatar_url,omitempty" binding:"omitempty,url"`
	UIPreferences json.RawMessage `json:"ui_preferences,omitempty"`
	Timezone      string          `json:"timezone,omitempty" binding:"omitempty,timezone"`
}

type UserProfileResponse struct {
	Name          string          `json:"name"`
	AvatarURL     *string         `json:"avatar_url"`
	UIPreferences json.RawMessage `json:"ui_preferences"`
	Timezone      string          `json:"timezone"`
	CreatedAt     time.Time       `json:"created_at"`
}
