CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);

CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE workspace_member_status AS ENUM ('active', 'invited', 'disabled');

CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role workspace_role NOT NULL,
    status workspace_member_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, user_id)
);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
