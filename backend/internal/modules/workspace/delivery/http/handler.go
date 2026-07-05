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
		protected.POST("", handler.CreateWorkspace)
		protected.GET("/:id", handler.GetWorkspaceDetails)
		protected.POST("/:id/members", handler.AddMember)
	}
}

func (h *WorkspaceHandler) CreateWorkspace(c *gin.Context) {
	var req CreateWorkspaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	usrCtx, _ := middleware.GetUserContext(c)

	ws, err := h.usecase.CreateWorkspace(c.Request.Context(), req.Name, usrCtx.AccountID)
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

	// Note: in a real application, you'd also want to verify the requesting user
	// is actually a member of this workspace before returning details. 
	// We assume standard zero-trust requires authorization here, but sticking to 
	// PRD requirements for now.
	
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
			ID:       m.ID,
			UserID:   m.UserID,
			Role:     m.Role,
			Status:   m.Status,
			JoinedAt: m.CreatedAt,
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

	err = h.usecase.AddWorkspaceMember(c.Request.Context(), workspaceID, req.UserID, usrCtx.AccountID, req.Role)
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
