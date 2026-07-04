package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"workflow-automation/internal/modules/user/domain"
	"workflow-automation/internal/shared/middleware"
	"workflow-automation/internal/shared/response"
)

type UserHandler struct {
	usecase domain.UserUseCase
}

func NewUserHandler(r *gin.RouterGroup, uc domain.UserUseCase, jwtSecret string) {
	handler := &UserHandler{usecase: uc}

	// Protected Routes
	protected := r.Group("/users").Use(middleware.JWTAuth(jwtSecret))
	{
		protected.GET("/me", handler.GetProfile)
		protected.PUT("/me", handler.UpdateProfile)
	}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	usrCtx, _ := middleware.GetUserContext(c)

	user, err := h.usecase.GetProfile(c.Request.Context(), usrCtx.AccountID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch user profile", "INTERNAL_ERROR")
		return
	}

	res := UserProfileResponse{
		Name:          user.Name,
		AvatarURL:     user.AvatarURL,
		UIPreferences: user.UIPreferences,
		Timezone:      user.Timezone,
		CreatedAt:     user.CreatedAt,
	}

	response.JSON(c, http.StatusOK, "Profile fetched", res, nil)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	usrCtx, _ := middleware.GetUserContext(c)

	user, err := h.usecase.UpdateProfile(c.Request.Context(), usrCtx.AccountID, req.Name, req.AvatarURL, req.UIPreferences, req.Timezone)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update profile", "INTERNAL_ERROR")
		return
	}

	res := UserProfileResponse{
		Name:          user.Name,
		AvatarURL:     user.AvatarURL,
		UIPreferences: user.UIPreferences,
		Timezone:      user.Timezone,
		CreatedAt:     user.CreatedAt,
	}

	response.JSON(c, http.StatusOK, "Profile updated", res, nil)
}
