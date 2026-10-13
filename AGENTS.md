# AGENTS.md

## Project Overview
Static HTML site for "DocuFast India" — a single `index.html` file served by nginx.

## Setup
- Served via `docker-compose.base44.yml` using `nginx:alpine` on host port 3000.
- The source is bind-mounted read-only into the container at `/usr/share/nginx/html`.
- No build step, no dependencies, no dev server framework — just static files.

## Known Quirk
- The repo root directory (`/app`) has `700` permissions by default in the sandbox. nginx workers run as non-root, so they get 403 Forbidden. Fix: `chmod 755 /app` before starting (or after any sandbox recreation).

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` should return `200`.
- The page title is "DocuFast India — India's Trusted Document Platform".
