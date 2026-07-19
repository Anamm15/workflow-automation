package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"workflow-automation/internal/modules/workflow/domain"
)

type pgWorkflowRepo struct {
	db *pgxpool.Pool
}

func NewPGWorkflowRepository(db *pgxpool.Pool) domain.WorkflowRepository {
	return &pgWorkflowRepo{db: db}
}

func (r *pgWorkflowRepo) CreateWorkflow(ctx context.Context, wf *domain.Workflow) error {
	query := `INSERT INTO workflows (id, workspace_id, name, description, status, draft_json, current_version_id, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.Exec(ctx, query, wf.ID, wf.WorkspaceID, wf.Name, wf.Description, wf.Status, wf.DraftJSON, wf.CurrentVersionID, wf.CreatedAt, wf.UpdatedAt)
	if err != nil {
		return fmt.Errorf("inserting workflow: %w", err)
	}
	return nil
}

func (r *pgWorkflowRepo) GetWorkflowByID(ctx context.Context, id uuid.UUID) (*domain.Workflow, error) {
	query := `SELECT id, workspace_id, name, description, status, draft_json, current_version_id, created_at, updated_at 
			  FROM workflows WHERE id = $1`
	row := r.db.QueryRow(ctx, query, id)
	
	var wf domain.Workflow
	err := row.Scan(&wf.ID, &wf.WorkspaceID, &wf.Name, &wf.Description, &wf.Status, &wf.DraftJSON, &wf.CurrentVersionID, &wf.CreatedAt, &wf.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("workflow not found")
		}
		return nil, fmt.Errorf("querying workflow: %w", err)
	}
	return &wf, nil
}

func (r *pgWorkflowRepo) ListWorkflowsByWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]*domain.Workflow, error) {
	query := `SELECT id, workspace_id, name, description, status, draft_json, current_version_id, created_at, updated_at 
			  FROM workflows WHERE workspace_id = $1 ORDER BY created_at DESC`
	rows, err := r.db.Query(ctx, query, workspaceID)
	if err != nil {
		return nil, fmt.Errorf("querying workflows list: %w", err)
	}
	defer rows.Close()

	var workflows []*domain.Workflow
	for rows.Next() {
		var wf domain.Workflow
		err := rows.Scan(&wf.ID, &wf.WorkspaceID, &wf.Name, &wf.Description, &wf.Status, &wf.DraftJSON, &wf.CurrentVersionID, &wf.CreatedAt, &wf.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("scanning workflow row: %w", err)
		}
		workflows = append(workflows, &wf)
	}
	return workflows, nil
}

func (r *pgWorkflowRepo) UpdateWorkflow(ctx context.Context, wf *domain.Workflow) error {
	query := `UPDATE workflows SET name = $1, description = $2, status = $3, draft_json = $4, current_version_id = $5, updated_at = CURRENT_TIMESTAMP
			  WHERE id = $6`
	_, err := r.db.Exec(ctx, query, wf.Name, wf.Description, wf.Status, wf.DraftJSON, wf.CurrentVersionID, wf.ID)
	if err != nil {
		return fmt.Errorf("updating workflow: %w", err)
	}
	return nil
}

func (r *pgWorkflowRepo) DeleteWorkflow(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM workflows WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("deleting workflow: %w", err)
	}
	return nil
}

func (r *pgWorkflowRepo) CreateWorkflowVersion(ctx context.Context, version *domain.WorkflowVersion) error {
	query := `INSERT INTO workflow_versions (id, workflow_id, version_number, definition_json, status, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.db.Exec(ctx, query, version.ID, version.WorkflowID, version.VersionNumber, version.DefinitionJSON, version.Status, version.CreatedAt, version.UpdatedAt)
	if err != nil {
		return fmt.Errorf("inserting workflow version: %w", err)
	}
	return nil
}

func (r *pgWorkflowRepo) GetWorkflowVersions(ctx context.Context, workflowID uuid.UUID) ([]*domain.WorkflowVersion, error) {
	query := `SELECT id, workflow_id, version_number, definition_json, status, created_at, updated_at 
			  FROM workflow_versions WHERE workflow_id = $1 ORDER BY version_number DESC`
	rows, err := r.db.Query(ctx, query, workflowID)
	if err != nil {
		return nil, fmt.Errorf("querying workflow versions: %w", err)
	}
	defer rows.Close()

	var versions []*domain.WorkflowVersion
	for rows.Next() {
		var v domain.WorkflowVersion
		err := rows.Scan(&v.ID, &v.WorkflowID, &v.VersionNumber, &v.DefinitionJSON, &v.Status, &v.CreatedAt, &v.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("scanning workflow version row: %w", err)
		}
		versions = append(versions, &v)
	}
	return versions, nil
}

func (r *pgWorkflowRepo) GetWorkflowVersionByID(ctx context.Context, versionID uuid.UUID) (*domain.WorkflowVersion, error) {
	query := `SELECT id, workflow_id, version_number, definition_json, status, created_at, updated_at 
			  FROM workflow_versions WHERE id = $1`
	row := r.db.QueryRow(ctx, query, versionID)
	
	var v domain.WorkflowVersion
	err := row.Scan(&v.ID, &v.WorkflowID, &v.VersionNumber, &v.DefinitionJSON, &v.Status, &v.CreatedAt, &v.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("workflow version not found")
		}
		return nil, fmt.Errorf("querying workflow version: %w", err)
	}
	return &v, nil
}

func (r *pgWorkflowRepo) UpdateWorkflowVersionStatus(ctx context.Context, versionID uuid.UUID, status domain.WorkflowVersionStatus) error {
	query := `UPDATE workflow_versions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`
	_, err := r.db.Exec(ctx, query, status, versionID)
	if err != nil {
		return fmt.Errorf("updating workflow version status: %w", err)
	}
	return nil
}

func (r *pgWorkflowRepo) CreateWorkflowTriggers(ctx context.Context, triggers []*domain.WorkflowTrigger) error {
	if len(triggers) == 0 {
		return nil
	}
	
	// Fast bulk insert using copy from for large sets, or just batch insert. For simplicity, we use Batch
	batch := &pgx.Batch{}
	query := `INSERT INTO workflow_triggers (id, workflow_version_id, type, config_json, is_enabled, created_at, updated_at) 
			  VALUES ($1, $2, $3, $4, $5, $6, $7)`
	for _, t := range triggers {
		batch.Queue(query, t.ID, t.WorkflowVersionID, t.Type, t.ConfigJSON, t.IsEnabled, t.CreatedAt, t.UpdatedAt)
	}
	
	br := r.db.SendBatch(ctx, batch)
	defer br.Close()
	
	for i := 0; i < len(triggers); i++ {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("inserting workflow trigger batch item %d: %w", i, err)
		}
	}
	return nil
}

func (r *pgWorkflowRepo) DeleteWorkflowTriggers(ctx context.Context, versionID uuid.UUID) error {
	query := `DELETE FROM workflow_triggers WHERE workflow_version_id = $1`
	_, err := r.db.Exec(ctx, query, versionID)
	if err != nil {
		return fmt.Errorf("deleting workflow triggers: %w", err)
	}
	return nil
}

func (r *pgWorkflowRepo) GetWorkflowTriggers(ctx context.Context, versionID uuid.UUID) ([]*domain.WorkflowTrigger, error) {
	query := `SELECT id, workflow_version_id, type, config_json, is_enabled, created_at, updated_at 
			  FROM workflow_triggers WHERE workflow_version_id = $1`
	rows, err := r.db.Query(ctx, query, versionID)
	if err != nil {
		return nil, fmt.Errorf("querying workflow triggers: %w", err)
	}
	defer rows.Close()

	var triggers []*domain.WorkflowTrigger
	for rows.Next() {
		var t domain.WorkflowTrigger
		err := rows.Scan(&t.ID, &t.WorkflowVersionID, &t.Type, &t.ConfigJSON, &t.IsEnabled, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("scanning workflow trigger row: %w", err)
		}
		triggers = append(triggers, &t)
	}
	return triggers, nil
}

func (r *pgWorkflowRepo) PublishWorkflow(ctx context.Context, wf *domain.Workflow, version *domain.WorkflowVersion) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("beginning publish transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Insert version
	queryVersion := `INSERT INTO workflow_versions (id, workflow_id, version_number, definition_json, status, created_at, updated_at) 
			         VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err = tx.Exec(ctx, queryVersion, version.ID, version.WorkflowID, version.VersionNumber, version.DefinitionJSON, version.Status, version.CreatedAt, version.UpdatedAt)
	if err != nil {
		return fmt.Errorf("inserting new version in publish: %w", err)
	}

	// Update workflow
	queryWf := `UPDATE workflows SET current_version_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`
	_, err = tx.Exec(ctx, queryWf, version.ID, wf.Status, wf.ID)
	if err != nil {
		return fmt.Errorf("updating workflow in publish: %w", err)
	}

	err = tx.Commit(ctx)
	if err != nil {
		return fmt.Errorf("committing publish transaction: %w", err)
	}
	return nil
}
