# AGENTS.md

## Project Overview
DocuFast India — a full-stack document services platform. React frontend with Vite, Express.js backend with SQLite, user authentication, application tracking, and multiple pages.

## Architecture
- **Frontend** (`/frontend`): React 18 + Vite + React Router. Served on port 5173 (mapped to host 3000). Proxies `/api` to backend.
- **Backend** (`/backend`): Express.js with better-sqlite3. Runs on port 4000 (internal). JWT auth with bcryptjs password hashing.
- **Database**: SQLite at `/tmp/docufast.db` (auto-created on first boot, seeded with services and blog posts).

## Running the App
- Start: `docker compose -f docker-compose.base44.yml up -d`
- Frontend: `http://localhost:3000`
- API health: `http://localhost:3000/api/health`
- Both services use `node:22-slim` with source bind-mounted; `npm install` runs on container startup.

## Key Features
- User registration and login (JWT-based)
- Service listing and detail pages (12 services)
- Application submission with tracking ID generation
- Order tracking page with status stages
- User dashboard showing application history
- Blog with seeded posts
- Contact form (saves to DB)
- Protected routes (dashboard requires auth)

## API Routes
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/services`, `GET /api/services/:slug`
- `POST /api/applications` (auth), `GET /api/applications` (auth)
- `GET /api/track/:trackingId`
- `GET /api/blog`, `GET /api/blog/:slug`
- `POST /api/contact`

## Editing
- Frontend changes hot-reload via Vite HMR.
- Backend changes require `docker compose restart backend` (uses `node --watch` so should auto-reload).
- The old `index.html` at repo root is the original static version, preserved for reference.

## Tech Stack
- React 18, React Router 6, Vite 5
- Express 4, better-sqlite3, bcryptjs, jsonwebtoken
- Docker Compose with node:22-slim base images
