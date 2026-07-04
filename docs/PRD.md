# Workflow Automation Platform - Product Definition

## 1. Product Overview
The product is a B2B SaaS Workflow Automation Platform designed to orchestrate business processes through triggers, conditions, and actions. It facilitates system integration and task automation without requiring extensive coding. 

## 2. Architectural Principles
* **System Design:** Operations begin as a modular monolith before transitioning to a distributed microservices architecture.
* **Tenancy & Security:** The system enforces strict multi-tenant isolation, Role-Based Access Control (RBAC), and API key encryption at rest.
* **Execution Reliability:** The platform prioritizes consistent execution over complex visual builders. 
* **State & Idempotency:** Workflows are stateful and observable, while sensitive side-effect actions are idempotent by default to prevent duplicate executions during retries.

## 3. Execution Engine Mechanics
* **Workflow Definition:** Workflows are structured as JSON graphs requiring strict schema validation and backward compatibility.
* **State Management:** Executions represent discrete state transitions, isolating failures to specific nodes and persisting I/O data per step.
* **Control Flow:** The engine supports sequential execution, if/else conditions, switch cases, and boolean expressions.
* **Error Handling & Retries:** Retries utilize exponential backoff and are strictly limited to network timeouts or 5xx errors to prevent repetitive looping on logical errors. 
* **Dead-letter Queue:** Executions experiencing persistent failures are routed to a dead-letter state for manual review.
* **Observability:** The system requires structured logging, comprehensive tracing, and metrics tracking via Prometheus.

## 4. Platform Capabilities
* **Triggers:** Automated execution via webhooks, schedulers, and manual events.
* **Actions:** Execution nodes support HTTP requests, internal record updates, and external notifications.
* **Audit & Monitoring:** The platform maintains an immutable audit trail of user actions and tracks operational metrics like p95 execution duration and queue processing latency.

## 5. Domain Data Model
| Entity | Key Attributes |
| :--- | :--- |
| **Auth** | `id`, `email`, `password_hash / auth_provider`, `created_at`, `updated_at` |
| **User** | `id`, `name`, `avatar_url`, `ui_preferences`, `timezone`, `created_at`, `updated_at` |
| **Workspace** | `id`, `name`, `plan`, `owner_id`, `created_at`, `updated_at` |
| **WorkspaceMember** | `workspace_id`, `user_id`, `role`, `status` |
| **Workflow** | `id`, `workspace_id`, `name`, `description`, `status`, `current_version`, `created_by`, `created_at`, `updated_at` |
| **WorkflowVersion** | `id`, `workflow_id`, `version_number`, `definition_json`, `published_by`, `published_at` |
| **Trigger** | `id`, `workflow_version_id`, `type`, `config_json`, `status` |
| **Execution** | `id`, `workspace_id`, `workflow_id`, `workflow_version_id`, `status`, `trigger_type`, `input_payload`, `started_at`, `finished_at`, `duration_ms` |
| **ExecutionStep** | `id`, `execution_id`, `node_id`, `step_type`, `status`, `input_json`, `output_json`, `error_message`, `retry_count`, `started_at`, `finished_at` |
| **AuditLog** | `id`, `workspace_id`, `actor_user_id`, `action_type`, `resource_type`, `resource_id`, `metadata_json`, `created_at` |
| **Integration** | `id`, `workspace_id`, `provider`, `secret_ref`, `config_json`, `created_at` |