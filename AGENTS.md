# AGENTS.md

## Cursor Cloud specific instructions

MedVoice AI HMS is a voice-enabled Hospital Management System split into three co-located services:

| Service | Path | Stack | Port | Required? |
|---------|------|-------|------|-----------|
| Frontend SPA | `/workspace` (`src/`) | React 19 + Vite + MUI | 5173 | Yes |
| Core HMS API | `/workspace/backend` | FastAPI + SQLAlchemy async + PostgreSQL | 8000 | Yes |
| AI transcription engine | `/workspace/ai-engine` | FastAPI + faster-whisper | 8000 (default) | Optional |

The routed app (login → dashboard → patients) is fully exercised by just the frontend + backend + PostgreSQL. The voice/transcription components (`VoiceRecorder`, `ConsultationPage`) are **not wired into any route in `App.tsx`**, so the AI engine is optional.

### Environment / setup notes (persisted in the VM snapshot)
- PostgreSQL 16 runs locally; DB `medvoice-ai`, user/password `medvoice/medvoice`. Start it (if not running) with `sudo pg_ctlcluster 16 main start`.
- Python deps live in per-service virtualenvs: `backend/.venv` and `ai-engine/.venv`. The update script recreates/refreshes them.
- `backend/.env` (copied from `backend/.env.example`) and root `.env.local` are untracked config files created during setup; they persist in the snapshot.
- **Non-obvious frontend gotcha:** there is no Vite dev proxy and the API base URL defaults to the relative `/api/v1`. The root `.env.local` sets `VITE_API_BASE_URL=http://localhost:8000/api/v1` so the SPA reaches the backend directly. If you delete/regenerate it, re-add that line.

### Running the services (dev mode)
- Backend: from `backend/`, `source .venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Frontend: from repo root, `npm run dev -- --host` (Vite on 5173)
- First-time DB prep (only when the DB is empty): from `backend/` with the venv active, `alembic upgrade head` then `python -m app.db.seed`. The seed is idempotent.

### Seeded admin credentials
- Email `admin@medvoice.com`, password `Admin@123` (Administrator role, all permissions).

### Lint / test / build
- Frontend lint: `npm run lint` (oxlint). Build: `npm run build` (`tsc -b && vite build`). No frontend test runner is configured.
- Backend tests: from `backend/` with venv active, `python -m pytest` (pytest + pytest-asyncio).

### AI engine caveats (optional)
- `ai-engine/` has **no requirements file**; deps are `fastapi uvicorn[standard] faster-whisper python-multipart` (installed into `ai-engine/.venv`).
- It downloads the Whisper `base` model on first startup (needs network).
- **Port collision:** the AI engine defaults to port 8000, the same as the backend, and the frontend hardcodes the transcription call to `http://127.0.0.1:8000/transcribe`. If you run the AI engine, resolve the port/URL conflict first.
