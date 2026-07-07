package http

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"workflow-automation/internal/modules/workspace/domain"
	"workflow-automation/internal/shared/middleware"
	"workflow-automation/internal/shared/response"
)

type WorkspaceHandler struct {
	usecase domain.WorkspaceUseCase
}

func NewWorkspaceHandler(r *gin.RouterGroup, uc domain.WorkspaceUseCase, jwtSecret string) {
	handler := &WorkspaceHandler{usecase: uc}

	protected := r.Group("/workspaces").Use(middleware.JWTAuth(jwtSecret))
	{
		protected.GET("/dashboard", handler.GetDashboardInfo)
		protected.POST("", handler.CreateWorkspace)
		protected.GET("/:id", handler.GetWorkspaceDetails)
		protected.POST("/:id/members", handler.AddMember)
		protected.PUT("/:id/members/:userId", handler.UpdateMemberRole)
	}
}

func (h *WorkspaceHandler) CreateWorkspace(c *gin.Context) {
	var req CreateWorkspaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	usrCtx, _ := middleware.GetUserContext(c)

	ws, err := h.usecase.CreateWorkspace(c.Request.Context(), req.Name, usrCtx.UserID)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidInput) {
			response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to create workspace", "INTERNAL_ERROR")
		return
	}

	res := WorkspaceResponse{
		ID:        ws.ID,
		Name:      ws.Name,
		Slug:      ws.Slug,
		CreatedAt: ws.CreatedAt,
	}

	response.JSON(c, http.StatusCreated, "Workspace created successfully", res, nil)
}

func (h *WorkspaceHandler) GetWorkspaceDetails(c *gin.Context) {
	idStr := c.Param("id")
	workspaceID, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workspace ID format", "INVALID_INPUT")
		return
	}

	ws, members, err := h.usecase.GetWorkspaceDetails(c.Request.Context(), workspaceID)
	if err != nil {
		if errors.Is(err, domain.ErrWorkspaceNotFound) {
			response.Error(c, http.StatusNotFound, "Workspace not found", "NOT_FOUND")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to fetch workspace", "INTERNAL_ERROR")
		return
	}

	res := WorkspaceDetailsResponse{
		Workspace: WorkspaceResponse{
			ID:        ws.ID,
			Name:      ws.Name,
			Slug:      ws.Slug,
			CreatedAt: ws.CreatedAt,
		},
		Members: make([]WorkspaceMemberResponse, 0, len(members)),
	}

	for _, m := range members {
		res.Members = append(res.Members, WorkspaceMemberResponse{
			ID:           m.ID,
			UserID:       m.UserID,
			UserEmail:    m.UserEmail,
			UserUsername: m.UserUsername,
			UserAvatar:   m.UserAvatar,
			Role:         m.Role,
			Status:       m.Status,
			JoinedAt:     m.CreatedAt,
		})
	}

	response.JSON(c, http.StatusOK, "Workspace details fetched", res, nil)
}

func (h *WorkspaceHandler) AddMember(c *gin.Context) {
	idStr := c.Param("id")
	workspaceID, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workspace ID format", "INVALID_INPUT")
		return
	}

	var req AddWorkspaceMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	usrCtx, _ := middleware.GetUserContext(c)

	err = h.usecase.AddWorkspaceMember(c.Request.Context(), workspaceID, req.UserID, usrCtx.UserID, req.Role)
	if err != nil {
		if errors.Is(err, domain.ErrUnauthorizedAction) {
			response.Error(c, http.StatusForbidden, "You do not have permission to add members", "FORBIDDEN")
			return
		}
		if errors.Is(err, domain.ErrUserAlreadyMember) {
			response.Error(c, http.StatusConflict, "User is already a member", "CONFLICT")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to add member", "INTERNAL_ERROR")
		return
	}

	response.JSON(c, http.StatusCreated, "Member added successfully", nil, nil)
}

func (h *WorkspaceHandler) UpdateMemberRole(c *gin.Context) {
	workspaceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workspace ID", "INVALID_INPUT")
		return
	}

	targetUserID, err := uuid.Parse(c.Param("userId"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid user ID", "INVALID_INPUT")
		return
	}

	var req UpdateWorkspaceMemberRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	usrCtx, _ := middleware.GetUserContext(c)

	err = h.usecase.UpdateWorkspaceMemberRole(c.Request.Context(), workspaceID, targetUserID, usrCtx.UserID, req.Role)
	if err != nil {
		if errors.Is(err, domain.ErrUnauthorizedAction) {
			response.Error(c, http.StatusForbidden, "You do not have permission to modify roles", "FORBIDDEN")
			return
		}
		response.Error(c, http.StatusInternalServerError, "Failed to update member role", "INTERNAL_ERROR")
		return
	}

	response.JSON(c, http.StatusOK, "Member role updated successfully", nil, nil)
}

func (h *WorkspaceHandler) GetDashboardInfo(c *gin.Context) {
	usrCtx, _ := middleware.GetUserContext(c)

	info, err := h.usecase.GetDashboardInfo(c.Request.Context(), usrCtx.UserID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch dashboard info", "INTERNAL_ERROR")
		return
	}

	res := DashboardInfoResponse{
		Metrics: DashboardMetricsResponse{
			TotalWorkspaces: info.Metrics.TotalWorkspaces,
			ActiveMembers:   info.Metrics.ActiveMembers,
			PendingInvites:  info.Metrics.PendingInvites,
			ResourceUsage:   info.Metrics.ResourceUsage,
		},
		RecentWorkspaces: make([]DashboardWorkspaceResponse, 0, len(info.RecentWorkspaces)),
		RecentActivities: make([]WorkspaceActivityResponse, 0, len(info.RecentActivities)),
	}

	for _, w := range info.RecentWorkspaces {
		res.RecentWorkspaces = append(res.RecentWorkspaces, DashboardWorkspaceResponse{
			ID:           w.ID,
			Name:         w.Name,
			Slug:         w.Slug,
			Role:         w.Role,
			MembersCount: w.MembersCount,
			CreatedAt:    w.CreatedAt,
		})
	}

	for _, a := range info.RecentActivities {
		res.RecentActivities = append(res.RecentActivities, WorkspaceActivityResponse{
			ID:            a.ID,
			WorkspaceID:   a.WorkspaceID,
			WorkspaceName: a.WorkspaceName,
			UserID:        a.UserID,
			UserName:      a.UserName,
			Action:        a.Action,
			CreatedAt:     a.CreatedAt,
		})
	}

	response.JSON(c, http.StatusOK, "Dashboard info fetched", res, nil)
}
