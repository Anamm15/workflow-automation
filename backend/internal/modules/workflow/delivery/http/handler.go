package http

import (
	"encoding/json"
	"io"
	"net/http"

	"workflow-automation/internal/modules/workflow/domain"
	"workflow-automation/internal/shared/middleware"
	"workflow-automation/internal/shared/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WorkflowHandler struct {
	usecase domain.WorkflowUseCase
}

func NewWorkflowHandler(r *gin.RouterGroup, uc domain.WorkflowUseCase, jwtSecret string) {
	handler := &WorkflowHandler{usecase: uc}

	// Protected endpoints (requires authentication/JWT)
	protected := r.Group("/workflows").Use(middleware.JWTAuth(jwtSecret))
	{
		protected.POST("", handler.CreateWorkflow)
		protected.GET("", handler.GetWorkflows)
		protected.GET("/:id", handler.GetWorkflowDetails)
		protected.PATCH("/:id", handler.UpdateWorkflowDraft)
		protected.DELETE("/:id", handler.DeleteWorkflow)

		// Versions
		protected.POST("/:id/publish", handler.PublishWorkflow)
		protected.GET("/:id/versions", handler.GetWorkflowVersions)
		protected.PATCH("/:id/activate", handler.ActivateWorkflowVersion)
		protected.PATCH("/:id/pause", handler.PauseWorkflowVersion)

		// Triggers & Testing
		protected.POST("/:id/triggers", handler.ConfigureTriggers)
		protected.POST("/:id/test", handler.TestWorkflowExecution)
	}

	// Public endpoint for webhooks (no JWT)
	public := r.Group("/webhook")
	{
		public.POST("/:webhook_id", handler.TriggerWebhook)
	}
}

func (h *WorkflowHandler) CreateWorkflow(c *gin.Context) {
	var req CreateWorkflowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	wf, err := h.usecase.CreateWorkflow(c.Request.Context(), req.WorkspaceID, req.Name, req.Description)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create workflow", "INTERNAL_ERROR")
		return
	}

	res := WorkflowResponse{
		ID:          wf.ID,
		WorkspaceID: wf.WorkspaceID,
		Name:        wf.Name,
		Description: wf.Description,
		Status:      wf.Status,
		CreatedAt:   wf.CreatedAt,
		UpdatedAt:   wf.UpdatedAt,
	}

	response.JSON(c, http.StatusCreated, "Workflow created successfully", res, nil)
}

func (h *WorkflowHandler) GetWorkflows(c *gin.Context) {
	workspaceIDStr := c.Query("workspace_id")
	workspaceID, err := uuid.Parse(workspaceIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workspace_id query parameter", "INVALID_INPUT")
		return
	}

	workflows, err := h.usecase.GetWorkflows(c.Request.Context(), workspaceID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch workflows", "INTERNAL_ERROR")
		return
	}

	var res []WorkflowResponse
	for _, wf := range workflows {
		res = append(res, WorkflowResponse{
			ID:               wf.ID,
			WorkspaceID:      wf.WorkspaceID,
			Name:             wf.Name,
			Description:      wf.Description,
			Status:           wf.Status,
			DraftJSON:        wf.DraftJSON,
			CurrentVersionID: wf.CurrentVersionID,
			CreatedAt:        wf.CreatedAt,
			UpdatedAt:        wf.UpdatedAt,
		})
	}

	response.JSON(c, http.StatusOK, "Workflows fetched", res, nil)
}

func (h *WorkflowHandler) GetWorkflowDetails(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workflow ID", "INVALID_INPUT")
		return
	}

	wf, err := h.usecase.GetWorkflowDetails(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Workflow not found", "NOT_FOUND")
		return
	}

	res := WorkflowResponse{
		ID:               wf.ID,
		WorkspaceID:      wf.WorkspaceID,
		Name:             wf.Name,
		Description:      wf.Description,
		Status:           wf.Status,
		DraftJSON:        wf.DraftJSON,
		CurrentVersionID: wf.CurrentVersionID,
		CreatedAt:        wf.CreatedAt,
		UpdatedAt:        wf.UpdatedAt,
	}

	response.JSON(c, http.StatusOK, "Workflow details fetched", res, nil)
}

func (h *WorkflowHandler) UpdateWorkflowDraft(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workflow ID", "INVALID_INPUT")
		return
	}

	var req UpdateWorkflowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	var draft json.RawMessage
	if req.DraftJSON != nil {
		draft = *req.DraftJSON
	} else {
		draft = nil
	}

	if err := h.usecase.UpdateWorkflowDraft(c.Request.Context(), id, draft, req.Name, req.Description); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update workflow draft", "INTERNAL_ERROR")
		return
	}

	response.JSON(c, http.StatusOK, "Workflow draft updated", nil, nil)
}

func (h *WorkflowHandler) DeleteWorkflow(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workflow ID", "INVALID_INPUT")
		return
	}

	if err := h.usecase.DeleteWorkflow(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete workflow", "INTERNAL_ERROR")
		return
	}

	response.JSON(c, http.StatusOK, "Workflow deleted successfully", nil, nil)
}

func (h *WorkflowHandler) PublishWorkflow(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workflow ID", "INVALID_INPUT")
		return
	}

	if err := h.usecase.PublishWorkflow(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "PUBLISH_FAILED")
		return
	}

	response.JSON(c, http.StatusOK, "Workflow published successfully", nil, nil)
}

func (h *WorkflowHandler) GetWorkflowVersions(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workflow ID", "INVALID_INPUT")
		return
	}

	versions, err := h.usecase.GetWorkflowVersions(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to fetch workflow versions", "INTERNAL_ERROR")
		return
	}

	var res []WorkflowVersionResponse
	for _, v := range versions {
		res = append(res, WorkflowVersionResponse{
			ID:             v.ID,
			WorkflowID:     v.WorkflowID,
			VersionNumber:  v.VersionNumber,
			DefinitionJSON: v.DefinitionJSON,
			Status:         v.Status,
			CreatedAt:      v.CreatedAt,
			UpdatedAt:      v.UpdatedAt,
		})
	}

	response.JSON(c, http.StatusOK, "Workflow versions fetched", res, nil)
}

func (h *WorkflowHandler) ActivateWorkflowVersion(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid version ID", "INVALID_INPUT")
		return
	}

	if err := h.usecase.ActivateWorkflowVersion(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to activate workflow version", "INTERNAL_ERROR")
		return
	}

	response.JSON(c, http.StatusOK, "Workflow version activated", nil, nil)
}

func (h *WorkflowHandler) PauseWorkflowVersion(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid version ID", "INVALID_INPUT")
		return
	}

	if err := h.usecase.PauseWorkflowVersion(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to pause workflow version", "INTERNAL_ERROR")
		return
	}

	response.JSON(c, http.StatusOK, "Workflow version paused", nil, nil)
}

func (h *WorkflowHandler) ConfigureTriggers(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workflow ID", "INVALID_INPUT")
		return
	}

	var req ConfigureTriggersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	var triggers []*domain.WorkflowTrigger
	for _, t := range req.Triggers {
		triggers = append(triggers, &domain.WorkflowTrigger{
			Type:       t.Type,
			ConfigJSON: t.ConfigJSON,
			IsEnabled:  t.IsEnabled,
		})
	}

	if err := h.usecase.ConfigureTriggers(c.Request.Context(), id, triggers); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "BAD_REQUEST")
		return
	}

	response.JSON(c, http.StatusOK, "Workflow triggers configured", nil, nil)
}

func (h *WorkflowHandler) TestWorkflowExecution(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid workflow ID", "INVALID_INPUT")
		return
	}

	var req TestWorkflowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), "INVALID_INPUT")
		return
	}

	resPayload, err := h.usecase.TestWorkflowExecution(c.Request.Context(), id, req.Payload)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), "INTERNAL_ERROR")
		return
	}

	response.JSON(c, http.StatusOK, "Test execution successful", json.RawMessage(resPayload), nil)
}

func (h *WorkflowHandler) TriggerWebhook(c *gin.Context) {
	webhookID := c.Param("webhook_id")

	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Failed to read body", "INVALID_INPUT")
		return
	}

	var payload json.RawMessage
	if len(body) > 0 {
		payload = json.RawMessage(body)
	} else {
		payload = json.RawMessage(`{}`)
	}

	if err := h.usecase.TriggerWebhook(c.Request.Context(), webhookID, payload); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to process webhook", "INTERNAL_ERROR")
		return
	}

	response.JSON(c, http.StatusOK, "Webhook received and processed", nil, nil)
}
