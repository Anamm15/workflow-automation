# Workflow Automation Platform

## Overview
A B2B SaaS platform designed to create, manage, and execute automated workflows based on predefined triggers, conditions, and actions. This system allows users to connect various applications, internal services, and events to automate business processes without the need for extensive hardcoding.

## Intent & Problem Statement
Many engineering and business operations rely on manual, repetitive tasks for data synchronization, notifications, and approval routing. Current solutions often involve automations embedded directly into application code, which are difficult to maintain and lack system-wide observability. Furthermore, critical execution mechanisms such as retries, idempotency, and audit trails are frequently inconsistent.

This project provides a centralized orchestration platform to define workflows, execute them reliably, and ensure comprehensive observability.

## Product Goals & Value Proposition
* **Reliability by Design:** Built-in execution history, automated retry mechanisms, dead-letter queues, and idempotency handling.
* **Multi-Tenant Architecture:** Engineered for SaaS environments, featuring strict data isolation, workspace management, and Role-Based Access Control (RBAC).
* **Observability:** Comprehensive visibility into execution metrics, payload I/O step-by-step logging, and tracing.
* **Modular Scalability:** Initially architected as a modular monolith to maintain domain boundaries, designed for a seamless transition to a microservices architecture as the system scales.

## Architecture Overview
The system architecture separates the orchestration logic, API transport layer, and background processing workers.

* **Frontend (Next.js):** A high-performance, aesthetically refined administrative UI featuring a dark-themed workflow builder. It utilizes a node-based drag-and-drop canvas for workflow visualization.
* **Backend (Go):** A high-throughput API server and execution engine handling branching logic, state persistence, and authentication.
* **Database (PostgreSQL):** Primary relational data store for users, multi-tenant workspaces, workflow definitions, and execution states.
* **Message Broker (Redis / RabbitMQ):** Manages asynchronous job queues for workflow execution, delayed jobs, and dead-letter handling.

## Key Workflows & Engine Semantics
1. **Workflow Definition:** Workflows are stored as JSON graph objects containing nodes, edges, versions, and environment settings. Schema validation ensures backward compatibility.
2. **Stateful Execution:** A single execution represents a discrete state transition. The engine sequentially processes nodes, persisting I/O payloads at each step.
3. **Fault Tolerance & Retries:** Failed external actions trigger an automatic exponential backoff retry policy. Repetitive logical errors are classified, and persistent failures are routed to a dead-letter queue.
4. **Idempotency:** The execution engine prevents duplicated side-effects on operational tasks through strict idempotency key validation.

## Local Development Setup

### Prerequisites
* Go (1.21+)
* Node.js (20+) & pnpm
* Docker & Docker Compose (for PostgreSQL and Redis/RabbitMQ)

### Backend (Go) Setup
   ```bash
   # Clone the repository and navigate to the backend directory:
   git clone https://github.com/Anamm15/workflow-automation.git
   cd backend

   # Copy the environment configuration and run migrations:
   cp .env.example .env

   # Start the API Server:
   go run cmd/api/main.go
   ```


### Frontend (Next.js) Setup
   ```bash
   # Navigate to the frontend directory:
   cd frontend

   # Install dependencies:
   npm install

   # Configure the environment variables to point to the local Go API:
   cp .env.example .env.local

   # Start the development server
   npm run dev
   ```