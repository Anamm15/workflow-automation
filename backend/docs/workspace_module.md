# Workspace Module

## Overview
The Workspace module handles multi-tenancy for the Workflow Automation Platform. It provides isolated environments (workspaces) where teams can collaborate, and it manages the membership and role-based access control for these environments. The module strictly adheres to the Hexagonal Architecture and Domain-Driven Design (DDD) Lite principles.

## Core Features
- **Multi-Tenancy**: Allows users to create and manage multiple, separate workspaces.
- **Role-Based Access Control (RBAC)**: Supports specific roles within a workspace:
  - `owner`: Full control, billing, and destructive actions.
  - `admin`: Can add/remove members and manage configurations.
  - `editor`: Can create/edit workflows but cannot manage workspace settings.
  - `viewer`: Read-only access to the workspace assets.
- **Unique Slugs**: Automatically generates URL-friendly unique slugs for workspaces by combining the workspace name and a portion of a UUID.
- **Idempotency**: Prevents adding users to a workspace if they are already members.
- **Dashboard Analytics & Activity Feed**: Aggregates total workspaces, active members, pending invites, and an activity feed of recent actions across workspaces the user belongs to.

## Architectural Principles (DDD Lite)
- **Transaction Encapsulation**: Transactions (`pgx.Tx` or `sql.Tx`) never leak into the UseCase or Domain layers. Operations that modify multiple tables (e.g., creating a workspace and simultaneously adding the creator as an owner) use cohesive methods at the Repository layer (e.g., `CreateWithMember(ctx, workspace, member)`).
- **Domain Errors**: Uses explicitly typed errors such as `ErrWorkspaceNotFound`, `ErrUnauthorizedAction`, and `ErrUserAlreadyMember` to handle business rule violations cleanly.

## Database Schema
The module uses two core tables:

### `workspaces`
- `id` (UUID, Primary Key)
- `name` (VARCHAR, 255)
- `slug` (VARCHAR, 255, Unique)
- `owner_user_id` (UUID, Foreign Key -> `users(id)`)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `workspace_members`
- `id` (UUID, Primary Key)
- `workspace_id` (UUID, Foreign Key -> `workspaces(id)`, Cascade Delete)
- `user_id` (UUID, Foreign Key -> `users(id)`, Cascade Delete)
- `role` (ENUM: `owner`, `admin`, `editor`, `viewer`)
- `status` (ENUM: `active`, `invited`, `disabled`)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- *Constraint*: `UNIQUE(workspace_id, user_id)`

### `workspace_activities`
- `id` (UUID, Primary Key)
- `workspace_id` (UUID, Foreign Key -> `workspaces(id)`, Cascade Delete)
- `user_id` (UUID, Foreign Key -> `users(id)`, Cascade Delete)
- `action` (VARCHAR, 255)
- `created_at` (TIMESTAMP)

## Endpoints
*(Detailed API specs can be viewed via the Scalar interactive documentation at `/docs/workspace`)*

- **`GET /api/v1/workspaces/dashboard`**:
  - Retrieves aggregated metrics, recent workspaces, and an activity feed for the authenticated user.
- **`POST /api/v1/workspaces`**: 
  - Creates a new workspace.
  - Accepts `name`.
  - Automatically provisions the authenticated user as the `owner` inside `workspace_members`.
- **`GET /api/v1/workspaces/:id`**: 
  - Retrieves workspace metadata alongside a paginated list of its members.
- **`POST /api/v1/workspaces/:id/members`**: 
  - Adds a new member to an existing workspace.
  - Accepts `user_id` and `role`.
  - **Authorization**: Validates that the user making the request is currently an `owner` or `admin` of that workspace.

## Testing Strategy
- **Unit Testing**: Table-driven tests validate UseCase rules, such as RBAC validation and idempotency checks using mocked repositories.
- **Integration Testing**: Uses `testcontainers-go` to spin up an ephemeral PostgreSQL container, ensuring all raw SQL queries, `pgxpool.Begin` transactions, and foreign key constraints behave exactly as they would in production.
