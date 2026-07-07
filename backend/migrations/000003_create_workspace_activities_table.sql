CREATE TABLE IF NOT EXISTS workspace_activities (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_workspace_activities_workspace_id ON workspace_activities(workspace_id);
CREATE INDEX idx_workspace_activities_user_id ON workspace_activities(user_id);
