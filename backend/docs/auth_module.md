# Authentication & Authorization Module (Auth)

## Overview
The Auth module is responsible for managing authentication credentials, secure session handling, dual-token generation, and account verification. It is built strictly using Hexagonal Architecture within a Modular Monolith paradigm.

## Core Features
- **Account Management**: Registration, Login, and Password modifications.
- **Dual-Token Flow**: Implements strict and secure JWT access tokens and opaque refresh tokens.
- **Refresh Token Rotation**: Enhances security by rotating refresh tokens on every use.
- **Replay Attack Detection**: Automatically revokes all sessions if a compromised/old refresh token is detected.
- **Session Management**: Tracks user agents, IP addresses, and allows revoking individual or all sessions.

## Authentication Flow

- **`POST /api/v1/auth/register`**: 
  - Accepts `email`, `username`, `password`, `name`, `timezone`.
  - Creates the authentication `accounts` record and delegates to the User module to create the `users` profile.
- **`POST /api/v1/auth/login`**: 
  - Accepts `email` and `password`.
  - Returns a short-lived `access_token` (JWT) in the response body.
  - Sets a long-lived `refresh_token` in a secure `HttpOnly` cookie.
- **`GET /api/v1/auth/search`**:
  - Searches accounts using the `?q=` parameter (matches against `username` or `email` using partial `ILIKE`).
  - Returns a list of public `AccountResponse` objects.

### 2. Login (`POST /api/v1/auth/login`)
- Verifies credentials against the `accounts` table.
- Generates a `session_id` and records the login details (User-Agent, IP).
- **Access Token (JWT)**: Generated with a short lifespan (10 minutes). Contains `sub` (account_id), `session_id`, and `role`. Sent in the JSON response body.
- **Refresh Token (Opaque)**: A 256-bit cryptographically secure token. The plaintext token is concatenated with the `session_id` and sent to the client via a highly restricted Cookie (`HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/auth/refresh`). The database only stores a SHA256 hash of this token.

### 3. Token Refresh Rotation (`POST /api/v1/auth/refresh`)
- The client sends the Opaque Refresh Token via cookies.
- The system splits the token to extract the `session_id` and the raw random string.
- The raw string is hashed (SHA256) and compared against the stored `refresh_token_hash` in the database.
- **Success**: A new Access Token and a new Refresh Token are generated. The DB is updated with the new hash.
- **Replay Attack Detection**: If the extracted hash does *not* match the database hash, the system identifies a potential replay attack (an attacker reusing an old token). The system immediately executes `RevokeAllByAccountID`, invalidating all active sessions for that user.

### 4. Logout (`POST /api/v1/auth/logout`)
- Invalidates the specific session using the provided Refresh Token.

## Database Schema (`accounts` & `sessions`)
### `accounts`
- `id` (UUID, Primary Key)
- `email` (VARCHAR, 255, Unique)
- `username` (VARCHAR, 50, Unique)
- `password_hash` (VARCHAR, 255)
- `is_verified` (BOOLEAN)

### `sessions`
- Stores `id`, `account_id`, `refresh_token_hash`, `user_agent`, `ip_address`, `expires_at`, `revoked`.

## Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/me` (Returns account details only)
- `PUT /api/v1/auth/change-password`

## Security Posture
- Secrets (Passwords, Refresh Tokens) are never stored in plaintext.
- JWTs do not contain sensitive PII.
- Access tokens rely on short expiry windows to limit the blast radius of token theft.
