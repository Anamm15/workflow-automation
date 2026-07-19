CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE workflow_version_status AS ENUM ('active', 'paused');
CREATE TYPE workflow_trigger_type AS ENUM ('manual', 'webhook', 'schedule');

CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status workflow_status NOT NULL DEFAULT 'draft',
    draft_json JSONB,
    current_version_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_workspace_id ON workflows(workspace_id);
CREATE INDEX idx_workflows_workspace_status ON workflows(workspace_id, status);

CREATE TABLE IF NOT EXISTS workflow_versions (
    id UUID PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    definition_json JSONB NOT NULL,
    status workflow_version_status NOT NULL DEFAULT 'paused',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workflow_id, version_number)
);

CREATE INDEX idx_workflow_versions_workflow_id ON workflow_versions(workflow_id);

ALTER TABLE workflows
    ADD CONSTRAINT fk_workflows_current_version
    FOREIGN KEY (current_version_id)
    REFERENCES workflow_versions(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS workflow_triggers (
    id UUID PRIMARY KEY,
    workflow_version_id UUID NOT NULL REFERENCES workflow_versions(id) ON DELETE CASCADE,
    type workflow_trigger_type NOT NULL,
    config_json JSONB,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_triggers_version_id ON workflow_triggers(workflow_version_id);
CREATE INDEX idx_workflow_triggers_type_enabled ON workflow_triggers(type, is_enabled);
