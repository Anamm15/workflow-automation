# Agent Instructions - Backend

## 1. Core Objectives & Principles
- Build software that is maintainable, readable, scalable, testable, modular, and idiomatic Go.
- Prioritize: Simplicity, Readability, Explicitness, Loose Coupling, High Cohesion, Separation of Concerns.
- Never introduce unnecessary abstractions or over-engineer solutions.

## 2. Architecture & Folder Structure
- **Architecture**: Feature-Based Modular Monolith, Hexagonal Architecture, DDD Lite, Vertical Slice, Dependency Injection, SOLID.
- **Modules (`/modules`)**: Independent feature modules containing Domain, Use Cases, Repository, External Adapters, Transport Layer, DTOs, and Mappers. Modules communicate via Public Interfaces, Facades, or Domain Events.
- **Shared (`/shared`)**: Strictly for generic, reusable infrastructure (e.g., database, logger, cache). No business logic allowed.
- **Domain Layer**: Must contain only pure business logic (Entities, Value Objects, Business Rules, Repository Interfaces). No infrastructure, DB, or external SDK knowledge.
- **CRITICAL**: If any infrastructures, like external APIs or SDKs just use in one module, it should be placed in that module, not in the shared folder.

## 3. Dependency & Integration Rules
- Dependencies always point inward: Delivery -> Usecase -> Domain <- Repository/Adapter.
- Avoid directly importing another module's repositories.
- Use constructor dependency injection exclusively. No global variables or service locators.
- External integrations belong inside their respective owning module.

## 4. Coding Standards (Go)
- **Use Cases**: Each business action must have its own use case file and responsibility.
- **Repository**: Interfaces belong in Domain. Implementations belong in the Repository package. Business logic must never know SQL.
- **Error Handling**: Wrap all errors. Use typed domain errors. Do not swallow errors.
- **Logging**: Use structured logging containing Request ID, Trace ID, Module, Use Case, Error, and Duration.
- **Configuration**: Use Environment Variables or Config Files. Never hardcode credentials, URLs, or secrets.
- **DTOs**: Map DTOs at system boundaries. Never leak database models into Domain or HTTP layers.
- **Naming & Style**: Use descriptive business names. Avoid meaningless suffixes (`Manager`, `Util`, `Helper`). Prefer many small files and early returns. Favor clarity over cleverness.

## 5. Testing & Verification
- Prioritize Unit, Integration, Repository, and E2E Tests.
- Business logic must be testable without Database, HTTP, Redis, or Kafka. Mock only external dependencies.
- Ensure all endpoints respond with a consistent JSON format.

## 6. Agent Operations & Autonomy
- **Implementation Sequence**: Understand requirement -> Identify module -> Design domain -> Define interfaces -> Implement usecase -> Implement adapters -> Expose transport -> Add tests -> Verify boundaries.
- **Refactoring Rules**: Preserve behavior, reduce coupling, increase readability, remove duplication. Never refactor solely for stylistic reasons.
- **Autonomy**: Proactively improve project organization, naming, and readability. Remove dead code, extract components, add tests, and improve error/logging/performance.
- **Restrictions**: Never change business behavior, rewrite architecture unnecessarily, or add arbitrary dependencies without clear value.

## 7. Definition of Done
- Clean architecture boundaries and explicit dependencies.
- Unit-testable business logic in small, focused files.
- Readable, idiomatic Go with clear naming and no unnecessary abstractions.
- Proper error propagation, structured logging, and necessary documentation.