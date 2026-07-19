package domain

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
)

type WorkflowRepository interface {
	CreateWorkflow(ctx context.Context, wf *Workflow) error
	GetWorkflowByID(ctx context.Context, id uuid.UUID) (*Workflow, error)
	ListWorkflowsByWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]*Workflow, error)
	UpdateWorkflow(ctx context.Context, wf *Workflow) error
	DeleteWorkflow(ctx context.Context, id uuid.UUID) error

	CreateWorkflowVersion(ctx context.Context, version *WorkflowVersion) error
	GetWorkflowVersions(ctx context.Context, workflowID uuid.UUID) ([]*WorkflowVersion, error)
	GetWorkflowVersionByID(ctx context.Context, versionID uuid.UUID) (*WorkflowVersion, error)
	UpdateWorkflowVersionStatus(ctx context.Context, versionID uuid.UUID, status WorkflowVersionStatus) error

	CreateWorkflowTriggers(ctx context.Context, triggers []*WorkflowTrigger) error
	DeleteWorkflowTriggers(ctx context.Context, versionID uuid.UUID) error
	GetWorkflowTriggers(ctx context.Context, versionID uuid.UUID) ([]*WorkflowTrigger, error)
	
	PublishWorkflow(ctx context.Context, workflow *Workflow, version *WorkflowVersion) error
}

type WorkflowUseCase interface {
	CreateWorkflow(ctx context.Context, workspaceID uuid.UUID, name, description string) (*Workflow, error)
	GetWorkflows(ctx context.Context, workspaceID uuid.UUID) ([]*Workflow, error)
	GetWorkflowDetails(ctx context.Context, id uuid.UUID) (*Workflow, error)
	UpdateWorkflowDraft(ctx context.Context, id uuid.UUID, draftJSON json.RawMessage, name, description *string) error
	DeleteWorkflow(ctx context.Context, id uuid.UUID) error

	PublishWorkflow(ctx context.Context, id uuid.UUID) error
	GetWorkflowVersions(ctx context.Context, id uuid.UUID) ([]*WorkflowVersion, error)
	ActivateWorkflowVersion(ctx context.Context, id uuid.UUID) error
	PauseWorkflowVersion(ctx context.Context, id uuid.UUID) error

	ConfigureTriggers(ctx context.Context, id uuid.UUID, triggers []*WorkflowTrigger) error
	TestWorkflowExecution(ctx context.Context, id uuid.UUID, payload json.RawMessage) (json.RawMessage, error)
	TriggerWebhook(ctx context.Context, webhookID string, payload json.RawMessage) error
}
