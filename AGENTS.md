# AGENTS.md

## Project Overview
Single-file static website (`index.html`) for DocuFast India — a document services landing page. No build step, no backend, no dependencies.

## Running the App
- Served via nginx (Alpine) in `docker-compose.base44.yml` on host port 3000.
- The `index.html` file is bind-mounted read-only into the nginx container.
- Start: `docker compose -f docker-compose.base44.yml up -d`

## External Service: Web3Forms
- The contact form posts to `https://api.web3forms.com/submit`.
- The access key is embedded as a hidden input in `index.html` with placeholder value `YOUR_WEB3FORMS_KEY`.
- The site loads fine without a real key; only form submission is blocked (shows a toast warning).
- To enable form submission, replace `YOUR_WEB3FORMS_KEY` in `index.html` with a real Web3Forms access key from https://web3forms.com.

## Editing
- Edits to `index.html` are reflected immediately (bind mount). Call `reload_preview` after changes since nginx serves the file directly with no live-reload.
