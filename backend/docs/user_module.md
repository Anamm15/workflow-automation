# User Module

## Overview
The User module is responsible for managing the personal profiles, preferences, and display details of authenticated accounts. It operates independently of the Auth module to ensure a clean separation between authentication credentials and domain user data.

## Core Features
- **Profile Initialization**: Automatically sets up default profiles when a new account is registered.
- **Profile Management**: Allows users to read and update their display names, avatars, timezone, and UI preferences.
- **Decoupled Architecture**: Acts as an independent domain within the modular monolith, exposing a standard interface (Facade) for other modules to interact with.

## Inter-Module Relationship (with Auth)
The User module does not depend on the Auth module. Instead, it exposes a public contract: `UserProfileFacade`.
When the Auth module successfully registers a new account, it invokes `userFacade.CreateUserForAccount(accountID, email)`. This guarantees that every `account` has a corresponding `user` profile without the Auth module directly writing to the `users` table.

## Database Schema (`users`)
- `id` (UUID)
- `account_id` (UUID, Unique, FK to accounts)
- `name` (VARCHAR)
- `avatar_url` (VARCHAR)
- `ui_preferences` (JSONB)
- `timezone` (VARCHAR)

## Endpoints
- **`GET /api/v1/users/me`**: Fetches the authenticated user's profile information.
- **`PUT /api/v1/users/me`**: Updates the user's profile. Accepts `name`, `avatar_url`, `ui_preferences` (JSON block), and `timezone`.

*Note: All endpoints are protected by the JWT Middleware, which extracts the `account_id` from the Access Token.*
