## Notes App (Node.js)

A small notes application implemented with a minimal Node.js HTTP server (no Express). It serves a single-page frontend from `notes-app/public/` and exposes a tiny JSON file-backed API to create, list and delete notes persisted in `notes-app/data/notes.json`.

## Features

- Serve static frontend files (HTML, CSS, JS) from `/public/*`.
- API endpoints to list, create and delete notes.
- Notes are stored as JSON in `notes-app/data/notes.json` (simple file persistence).

## Requirements

- Node.js

## Run locally (PowerShell)

1. Open a PowerShell in the repository root (where `notes-app` folder is).
2. Run the server:

```powershell
node .\notes-app\server.js
```

3. Open the app in your browser:

```
http://localhost:3000/
```

## Development notes

- The app uses simple file-backed persistence. This is fine for demos but not suitable for production or concurrent writes. Consider migrating to a small database (SQLite, lowdb, or MongoDB) if you need reliability.
