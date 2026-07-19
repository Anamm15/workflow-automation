package domain

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type WorkflowStatus string

const (
	WorkflowStatusDraft    WorkflowStatus = "draft"
	WorkflowStatusActive   WorkflowStatus = "active"
	WorkflowStatusPaused   WorkflowStatus = "paused"
	WorkflowStatusArchived WorkflowStatus = "archived"
)

type WorkflowVersionStatus string

const (
	WorkflowVersionStatusActive WorkflowVersionStatus = "active"
	WorkflowVersionStatusPaused WorkflowVersionStatus = "paused"
)

type WorkflowTriggerType string

const (
	TriggerTypeManual   WorkflowTriggerType = "manual"
	TriggerTypeWebhook  WorkflowTriggerType = "webhook"
	TriggerTypeSchedule WorkflowTriggerType = "schedule"
)

type Workflow struct {
	ID               uuid.UUID
	WorkspaceID      uuid.UUID
	Name             string
	Description      string
	Status           WorkflowStatus
	DraftJSON        *json.RawMessage
	CurrentVersionID *uuid.UUID
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

type WorkflowVersion struct {
	ID             uuid.UUID
	WorkflowID     uuid.UUID
	VersionNumber  int
	DefinitionJSON json.RawMessage
	Status         WorkflowVersionStatus
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type WorkflowTrigger struct {
	ID                uuid.UUID
	WorkflowVersionID uuid.UUID
	Type              WorkflowTriggerType
	ConfigJSON        json.RawMessage
	IsEnabled         bool
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
