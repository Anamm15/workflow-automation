package http

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"workflow-automation/internal/modules/auth/domain"
	"workflow-automation/internal/shared/middleware"
	"workflow-automation/internal/shared/response"
)

const RefreshCookieName = "refresh_token"

type AuthHandler struct {
	usecase domain.AuthUseCase
}

func NewAuthHandler(r *gin.RouterGroup, uc domain.AuthUseCase, jwtSecret string) {
	handler := &AuthHandler{usecase: uc}

	// Public Routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", handler.Register)
		auth.POST("/login", handler.Login)
		auth.POST("/refresh", handler.Refresh)
		
		// Optional (Not fully implemented in usecase yet)
		// auth.POST("/forgot-password", handler.ForgotPassword)
		// auth.POST("/reset-password", handler.ResetPassword)
		// auth.POST("/verify-email", handler.VerifyEmail)
		// auth.POST("/resend-verification", handler.ResendVerification)
	}

	// Protected Routes
	protected := r.Group("/auth").Use(middleware.JWTAuth(jwtSecret))
	{
		protected.POST("/logout", handler.Logout)
		protected.POST("/logout-all", handler.LogoutAll)
		protected.GET("/me", handler.GetMe)
		protected.POST("/change-password", handler.ChangePassword)
	}
}

func (h *AuthHandler) setRefreshCookie(c *gin.Context, token string) {
	c.SetCookie(
		RefreshCookieName,
		token,
		int(7*24*3600), // 7 days in seconds
		"/auth/refresh", // restrict path
		"",              // domain
		true,            // Secure (HTTPS only)
		true,            // HttpOnly
	)
	// For SameSite=Lax
	c.Writer.Header().Set("Set-Cookie", c.Writer.Header().Get("Set-Cookie")+"; SameSite=Lax")
}

func (h *AuthHandler) clearRefreshCookie(c *gin.Context) {
	c.SetCookie(RefreshCookieName, "", -1, "/auth/refresh", "", true, true)
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	if err := h.usecase.Register(c.Request.Context(), req.Email, req.Password); err != nil {
		if err == domain.ErrEmailAlreadyExists {
			response.Error(c, http.StatusConflict, err.Error(), "EMAIL_EXISTS")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to register user", "INTERNAL_ERROR")
		return
	}

	response.JSON(c, http.StatusCreated, "User registered successfully", nil, nil)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	userAgent := c.Request.UserAgent()
	ipAddress := c.ClientIP()

	tokens, err := h.usecase.Login(c.Request.Context(), req.Email, req.Password, userAgent, ipAddress)
	if err != nil {
		if err == domain.ErrInvalidCredentials {
			response.Error(c, http.StatusUnauthorized, err.Error(), "UNAUTHORIZED")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Login failed", "INTERNAL_ERROR")
		return
	}

	h.setRefreshCookie(c, tokens.RefreshToken)
	
	response.JSON(c, http.StatusOK, "Login successful", TokenResponse{AccessToken: tokens.AccessToken}, nil)
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	rt, err := c.Cookie(RefreshCookieName)
	if err != nil || rt == "" {
		response.Error(c, http.StatusUnauthorized, "Refresh token missing", "UNAUTHORIZED")
		return
	}

	userAgent := c.Request.UserAgent()
	ipAddress := c.ClientIP()

	tokens, err := h.usecase.RefreshToken(c.Request.Context(), rt, userAgent, ipAddress)
	if err != nil {
		h.clearRefreshCookie(c)
		response.Error(c, http.StatusUnauthorized, err.Error(), "UNAUTHORIZED")
		return
	}

	h.setRefreshCookie(c, tokens.RefreshToken)
	
	response.JSON(c, http.StatusOK, "Token refreshed", TokenResponse{AccessToken: tokens.AccessToken}, nil)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	rt, err := c.Cookie(RefreshCookieName)
	if err != nil {
		response.JSON(c, http.StatusOK, "Logged out successfully", nil, nil)
		return
	}

	_ = h.usecase.Logout(c.Request.Context(), rt)
	h.clearRefreshCookie(c)
	response.JSON(c, http.StatusOK, "Logged out successfully", nil, nil)
}

func (h *AuthHandler) LogoutAll(c *gin.Context) {
	usrCtx, _ := middleware.GetUserContext(c)
	
	if err := h.usecase.LogoutAll(c.Request.Context(), usrCtx.AccountID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to logout all devices", "INTERNAL_ERROR")
		return
	}

	h.clearRefreshCookie(c)
	response.JSON(c, http.StatusOK, "Logged out from all devices", nil, nil)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	usrCtx, _ := middleware.GetUserContext(c)

	acc, err := h.usecase.GetMe(c.Request.Context(), usrCtx.AccountID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch account", "INTERNAL_ERROR")
		return
	}

	res := AccountResponse{
		AccountID:   acc.ID,
		Email:       acc.Email,
		IsVerified:  acc.IsVerified,
		JoinedAt:    acc.CreatedAt,
	}

	response.JSON(c, http.StatusOK, "Account fetched", res, nil)
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	usrCtx, _ := middleware.GetUserContext(c)
	
	if err := h.usecase.ChangePassword(c.Request.Context(), usrCtx.AccountID, req.OldPassword, req.NewPassword); err != nil {
		if err == domain.ErrInvalidCredentials {
			response.Error(c, http.StatusUnauthorized, "Invalid old password", "UNAUTHORIZED")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to change password", "INTERNAL_ERROR")
		return
	}

	h.clearRefreshCookie(c)
	response.JSON(c, http.StatusOK, "Password changed successfully. Please login again.", nil, nil)
}
