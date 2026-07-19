package http

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"workflow-automation/internal/modules/workflow/domain"
)

type CreateWorkflowRequest struct {
	WorkspaceID uuid.UUID `json:"workspace_id" binding:"required"`
	Name        string    `json:"name" binding:"required,min=2,max=255"`
	Description string    `json:"description"`
}

type UpdateWorkflowRequest struct {
	Name        *string          `json:"name,omitempty"`
	Description *string          `json:"description,omitempty"`
	DraftJSON   *json.RawMessage `json:"draft_json,omitempty"`
}

type ConfigureTriggersRequest struct {
	Triggers []TriggerConfig `json:"triggers" binding:"required"`
}

type TriggerConfig struct {
	Type       domain.WorkflowTriggerType `json:"type" binding:"required,oneof=manual webhook schedule"`
	ConfigJSON json.RawMessage            `json:"config_json"`
	IsEnabled  bool                       `json:"is_enabled"`
}

type TestWorkflowRequest struct {
	Payload json.RawMessage `json:"payload" binding:"required"`
}

type WorkflowResponse struct {
	ID               uuid.UUID             `json:"id"`
	WorkspaceID      uuid.UUID             `json:"workspace_id"`
	Name             string                `json:"name"`
	Description      string                `json:"description"`
	Status           domain.WorkflowStatus `json:"status"`
	DraftJSON        *json.RawMessage      `json:"draft_json,omitempty"`
	CurrentVersionID *uuid.UUID            `json:"current_version_id,omitempty"`
	CreatedAt        time.Time             `json:"created_at"`
	UpdatedAt        time.Time             `json:"updated_at"`
}

type WorkflowVersionResponse struct {
	ID             uuid.UUID                    `json:"id"`
	WorkflowID     uuid.UUID                    `json:"workflow_id"`
	VersionNumber  int                          `json:"version_number"`
	DefinitionJSON json.RawMessage              `json:"definition_json"`
	Status         domain.WorkflowVersionStatus `json:"status"`
	CreatedAt      time.Time                    `json:"created_at"`
	UpdatedAt      time.Time                    `json:"updated_at"`
}
