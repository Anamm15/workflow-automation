package repository

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
	"workflow-automation/internal/modules/workspace/domain"
)

func setupTestDB(t *testing.T) (*pgxpool.Pool, func()) {
	ctx := context.Background()

	// 1. Start Postgres Container
	pgContainer, err := postgres.RunContainer(ctx,
		testcontainers.WithImage("postgres:15-alpine"),
		postgres.WithDatabase("testdb"),
		postgres.WithUsername("testuser"),
		postgres.WithPassword("testpassword"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).WithStartupTimeout(15*time.Second)),
	)
	if err != nil {
		t.Fatalf("failed to start postgres container: %v", err)
	}

	// 2. Get Connection String
	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		t.Fatalf("failed to get connection string: %v", err)
	}

	// 3. Connect via pgxpool
	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		t.Fatalf("failed to connect to db: %v", err)
	}

	// 4. Run basic schema (Accounts, Users, Workspaces, Members)
	// For integration testing, we need the prerequisite tables too.
	schema := `
	CREATE TABLE accounts (id UUID PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, is_verified BOOLEAN DEFAULT FALSE, created_at TIMESTAMP, updated_at TIMESTAMP);
	CREATE TABLE users (id UUID PRIMARY KEY, account_id UUID UNIQUE NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, avatar_url VARCHAR(255), ui_preferences JSONB, timezone VARCHAR(50), created_at TIMESTAMP, updated_at TIMESTAMP);
	
	CREATE TABLE workspaces (
		id UUID PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		slug VARCHAR(255) UNIQUE NOT NULL,
		owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);
	
	CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
	CREATE TYPE workspace_member_status AS ENUM ('active', 'invited', 'disabled');
	
	CREATE TABLE workspace_members (
		id UUID PRIMARY KEY,
		workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
		user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		role workspace_role NOT NULL,
		status workspace_member_status NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		UNIQUE (workspace_id, user_id)
	);
	`
	_, err = pool.Exec(ctx, schema)
	if err != nil {
		t.Fatalf("failed to execute schema: %v", err)
	}

	// Cleanup function
	cleanup := func() {
		pool.Close()
		if err := pgContainer.Terminate(ctx); err != nil {
			t.Fatalf("failed to terminate pgContainer: %v", err)
		}
	}

	return pool, cleanup
}

func TestPGWorkspaceRepository_CreateWithMember(t *testing.T) {
	// Skip if Docker is not available. testcontainers handles this mostly, but good practice.
	if os.Getenv("CI") == "true" {
		t.Skip("Skipping test in CI environment without docker setup")
	}

	pool, cleanup := setupTestDB(t)
	defer cleanup()

	repo := NewPGWorkspaceRepository(pool)
	ctx := context.Background()

	// Setup prerequisites (Account & User)
	accID := uuid.New()
	userID := uuid.New()
	_, err := pool.Exec(ctx, "INSERT INTO accounts (id, email, password_hash) VALUES ($1, $2, $3)", accID, "test@test.com", "hash")
	if err != nil {
		t.Fatalf("failed to insert mock account: %v", err)
	}
	_, err = pool.Exec(ctx, "INSERT INTO users (id, account_id, name) VALUES ($1, $2, $3)", userID, accID, "Test User")
	if err != nil {
		t.Fatalf("failed to insert mock user: %v", err)
	}

	// Run Test: Create Workspace with Member
	wsID := uuid.New()
	now := time.Now()
	
	ws := &domain.Workspace{
		ID:          wsID,
		Name:        "Int Test WS",
		Slug:        "int-test-ws",
		OwnerUserID: userID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	mem := &domain.WorkspaceMember{
		ID:          uuid.New(),
		WorkspaceID: wsID,
		UserID:      userID,
		Role:        domain.RoleOwner,
		Status:      domain.StatusActive,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Execute transactional method
	err = repo.CreateWithMember(ctx, ws, mem)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Verify Data is inserted (using GetByID)
	savedWs, err := repo.GetByID(ctx, wsID)
	if err != nil {
		t.Fatalf("Failed to retrieve saved workspace: %v", err)
	}
	if savedWs.Name != "Int Test WS" {
		t.Errorf("Expected Name 'Int Test WS', got %s", savedWs.Name)
	}

	// Verify foreign key constraints block invalid data
	invalidMem := &domain.WorkspaceMember{
		ID:          uuid.New(),
		WorkspaceID: wsID,
		UserID:      uuid.New(), // User doesn't exist
		Role:        domain.RoleEditor,
		Status:      domain.StatusActive,
	}
	err = repo.AddMember(ctx, invalidMem)
	if err == nil {
		t.Fatalf("Expected error when inserting member with non-existent user_id, got nil")
	}
}
