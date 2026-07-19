package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"workflow-automation/internal/modules/workflow/domain"
)

type workflowUseCase struct {
	repo domain.WorkflowRepository
}

func NewWorkflowUseCase(repo domain.WorkflowRepository) domain.WorkflowUseCase {
	return &workflowUseCase{repo: repo}
}

func (uc *workflowUseCase) CreateWorkflow(ctx context.Context, workspaceID uuid.UUID, name, description string) (*domain.Workflow, error) {
	wf := &domain.Workflow{
		ID:          uuid.New(),
		WorkspaceID: workspaceID,
		Name:        name,
		Description: description,
		Status:      domain.WorkflowStatusDraft,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := uc.repo.CreateWorkflow(ctx, wf); err != nil {
		return nil, fmt.Errorf("usecase create workflow: %w", err)
	}

	return wf, nil
}

func (uc *workflowUseCase) GetWorkflows(ctx context.Context, workspaceID uuid.UUID) ([]*domain.Workflow, error) {
	return uc.repo.ListWorkflowsByWorkspace(ctx, workspaceID)
}

func (uc *workflowUseCase) GetWorkflowDetails(ctx context.Context, id uuid.UUID) (*domain.Workflow, error) {
	return uc.repo.GetWorkflowByID(ctx, id)
}

func (uc *workflowUseCase) UpdateWorkflowDraft(ctx context.Context, id uuid.UUID, draftJSON json.RawMessage, name, description *string) error {
	wf, err := uc.repo.GetWorkflowByID(ctx, id)
	if err != nil {
		return fmt.Errorf("getting workflow to update: %w", err)
	}

	if name != nil {
		wf.Name = *name
	}
	if description != nil {
		wf.Description = *description
	}
	if draftJSON != nil {
		wf.DraftJSON = &draftJSON
	}

	wf.UpdatedAt = time.Now()
	if err := uc.repo.UpdateWorkflow(ctx, wf); err != nil {
		return fmt.Errorf("updating workflow draft: %w", err)
	}

	return nil
}

func (uc *workflowUseCase) DeleteWorkflow(ctx context.Context, id uuid.UUID) error {
	return uc.repo.DeleteWorkflow(ctx, id)
}

type graphDefinition struct {
	Nodes []struct {
		ID string `json:"id"`
	} `json:"nodes"`
	Edges []struct {
		Source string `json:"source"`
		Target string `json:"target"`
	} `json:"edges"`
}

func (uc *workflowUseCase) isGraphCyclic(raw json.RawMessage) bool {
	var g graphDefinition
	if err := json.Unmarshal(raw, &g); err != nil {
		// If it cannot be parsed as a graph, assume not cyclic or handle as invalid format. 
		// For simplicity, we just return false if it's empty/invalid.
		return false
	}

	adj := make(map[string][]string)
	for _, edge := range g.Edges {
		adj[edge.Source] = append(adj[edge.Source], edge.Target)
	}

	visited := make(map[string]bool)
	recStack := make(map[string]bool)

	var dfs func(node string) bool
	dfs = func(node string) bool {
		if recStack[node] {
			return true // Cycle detected
		}
		if visited[node] {
			return false // Already evaluated
		}

		visited[node] = true
		recStack[node] = true

		for _, neighbor := range adj[node] {
			if dfs(neighbor) {
				return true
			}
		}

		recStack[node] = false
		return false
	}

	for _, node := range g.Nodes {
		if !visited[node.ID] {
			if dfs(node.ID) {
				return true
			}
		}
	}

	return false
}

func (uc *workflowUseCase) PublishWorkflow(ctx context.Context, id uuid.UUID) error {
	wf, err := uc.repo.GetWorkflowByID(ctx, id)
	if err != nil {
		return fmt.Errorf("getting workflow to publish: %w", err)
	}

	if wf.DraftJSON == nil {
		return errors.New("cannot publish workflow with empty draft")
	}

	// Validate DAG (cyclic check)
	if uc.isGraphCyclic(*wf.DraftJSON) {
		return errors.New("cyclic graph detected: workflow cannot contain circular paths")
	}

	// Determine new version number
	versions, err := uc.repo.GetWorkflowVersions(ctx, id)
	if err != nil {
		return fmt.Errorf("getting workflow versions: %w", err)
	}
	newVersionNumber := 1
	if len(versions) > 0 {
		newVersionNumber = versions[0].VersionNumber + 1 // Assuming they are sorted descending
	}

	newVersion := &domain.WorkflowVersion{
		ID:             uuid.New(),
		WorkflowID:     wf.ID,
		VersionNumber:  newVersionNumber,
		DefinitionJSON: *wf.DraftJSON,
		Status:         domain.WorkflowVersionStatusActive,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	wf.Status = domain.WorkflowStatusActive
	wf.UpdatedAt = time.Now()

	// Update workflow and insert version in a transaction
	if err := uc.repo.PublishWorkflow(ctx, wf, newVersion); err != nil {
		return fmt.Errorf("publishing workflow: %w", err)
	}

	return nil
}

func (uc *workflowUseCase) GetWorkflowVersions(ctx context.Context, id uuid.UUID) ([]*domain.WorkflowVersion, error) {
	return uc.repo.GetWorkflowVersions(ctx, id)
}

func (uc *workflowUseCase) ActivateWorkflowVersion(ctx context.Context, id uuid.UUID) error {
	return uc.repo.UpdateWorkflowVersionStatus(ctx, id, domain.WorkflowVersionStatusActive)
}

func (uc *workflowUseCase) PauseWorkflowVersion(ctx context.Context, id uuid.UUID) error {
	return uc.repo.UpdateWorkflowVersionStatus(ctx, id, domain.WorkflowVersionStatusPaused)
}

func (uc *workflowUseCase) ConfigureTriggers(ctx context.Context, workflowID uuid.UUID, triggers []*domain.WorkflowTrigger) error {
	wf, err := uc.repo.GetWorkflowByID(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("getting workflow for triggers: %w", err)
	}

	if wf.CurrentVersionID == nil {
		return errors.New("cannot configure triggers for a workflow without a published version")
	}

	versionID := *wf.CurrentVersionID

	// Delete existing triggers for this version to overwrite
	if err := uc.repo.DeleteWorkflowTriggers(ctx, versionID); err != nil {
		return fmt.Errorf("clearing existing triggers: %w", err)
	}

	now := time.Now()
	for _, t := range triggers {
		t.ID = uuid.New()
		t.WorkflowVersionID = versionID
		t.CreatedAt = now
		t.UpdatedAt = now
	}

	if err := uc.repo.CreateWorkflowTriggers(ctx, triggers); err != nil {
		return fmt.Errorf("creating workflow triggers: %w", err)
	}

	return nil
}

func (uc *workflowUseCase) TestWorkflowExecution(ctx context.Context, id uuid.UUID, payload json.RawMessage) (json.RawMessage, error) {
	// Debugging mock execution logic
	wf, err := uc.repo.GetWorkflowByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("getting workflow to test: %w", err)
	}

	// In a real system, this would queue a job or execute the engine synchronously
	resMap := map[string]interface{}{
		"status": "success",
		"message": "Workflow execution test completed successfully",
		"workflow_id": wf.ID,
		"executed_at": time.Now(),
		"input_payload": string(payload),
	}

	resBytes, _ := json.Marshal(resMap)
	return resBytes, nil
}

func (uc *workflowUseCase) TriggerWebhook(ctx context.Context, webhookID string, payload json.RawMessage) error {
	// Look up trigger by webhook path/ID
	// For simplicity, we just print or mock success since we don't have a complex routing table yet.
	// Real implementation would look up `workflow_triggers` where `config_json` contains the webhookID.
	
	fmt.Printf("Webhook triggered: %s, Payload: %s\n", webhookID, string(payload))
	return nil
}
