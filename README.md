# MedVoice AI HMS

Enterprise hospital management system with AI-assisted clinical documentation. React + TypeScript frontend, FastAPI backend, PostgreSQL database.

## Features

- Patient, doctor, appointment, and consultation workflows
- Voice recording and AI-powered transcription
- Prescriptions, laboratory, radiology, pharmacy, and billing modules
- Notifications, audit logging, and global search

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy .env.example .env          # configure DATABASE_URL, JWT_SECRET_KEY, OPENAI_API_KEY
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
npm install
npm run dev                     # http://localhost:5173 (proxies /api/v1 → backend)
```

Default admin after seed: `admin@medvoice.com` / `Admin@123`

---

## Production Deployment (Docker)

Start the complete application with one command:

```bash
cp .env.example .env
# Edit .env: JWT_SECRET_KEY, OPENAI_API_KEY, and rotate default passwords
docker compose up -d
```

Open **http://localhost** — Nginx serves the SPA and proxies `/api/v1` to the backend.

### Stack

| Component | Technology |
|-----------|------------|
| Reverse proxy | Nginx |
| Frontend | Vite + React (static) |
| Backend | FastAPI + Uvicorn |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (AOF) |
| Object storage | MinIO (S3-compatible) |

### Persistent data

Docker named volumes: `medvoice_postgres_data`, `medvoice_redis_data`, `medvoice_minio_data`, `medvoice_backend_storage`.

### Health check

```bash
curl http://localhost/health
# {"status":"ok"}
```

### Full documentation

See **[docs/DOCKER.md](docs/DOCKER.md)** for architecture, environment variables, operations, and production hardening.

---

## Testing

```bash
# Backend (from backend/)
pytest                              # unit + integration
pytest --cov=app --cov-report=html  # coverage → htmlcov/

# Frontend
npm run test:run                    # Vitest
npm run test:coverage               # coverage → coverage/
npm run test:e2e                    # Playwright (requires backend + DB)
```

See **[docs/TESTING.md](docs/TESTING.md)** for the complete testing guide, CI pipeline, and coverage reports.

---

## Project Structure

```
medvoice-ai/
├── src/                  # React frontend
├── backend/              # FastAPI backend
├── docker/               # Nginx, MinIO init scripts
├── docker-compose.yml    # Full production stack
├── Dockerfile            # Frontend image
└── docs/DOCKER.md        # Deployment guide
```

## License

Proprietary — MedVoice AI HMS.
