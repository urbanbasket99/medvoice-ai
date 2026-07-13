# MedVoice AI HMS — Docker Deployment Guide

Production deployment for MedVoice AI HMS using Docker Compose. One command starts the full stack: frontend, backend API, PostgreSQL, Redis, MinIO, and an Nginx reverse proxy.

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │              nginx :80                   │
                    │  /          → frontend (SPA)            │
                    │  /api/v1/*  → backend (FastAPI)         │
                    │  /health    → backend liveness          │
                    └───────────────┬─────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
    ┌─────▼─────┐            ┌──────▼──────┐           ┌──────▼──────┐
    │ frontend  │            │   backend   │           │   (public)  │
    │  Nginx    │            │   Uvicorn   │           │   MinIO     │
    │  static   │            │   :8000     │           │ 9000/9001   │
    └───────────┘            └──────┬──────┘           └─────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              ┌─────▼─────┐  ┌──────▼──────┐ ┌─────▼─────┐
              │ postgres  │  │    redis    │ │   minio   │
              │   :5432   │  │    :6379    │ │  (internal)│
              └───────────┘  └─────────────┘ └───────────┘
```

All services communicate on the private bridge network `medvoice-net`. Only Nginx (HTTP) and MinIO (API + console) expose host ports by default.

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- 4 GB RAM minimum (8 GB recommended)
- OpenAI API key (required for AI transcription and clinical note features)

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit secrets (required before production)
#    - JWT_SECRET_KEY  → openssl rand -hex 32
#    - POSTGRES_PASSWORD, REDIS_PASSWORD, MINIO_ROOT_PASSWORD
#    - OPENAI_API_KEY
#    - Update REDIS_URL and S3_* keys if you change MinIO/Redis credentials

# 3. Start the full stack
docker compose up -d

# 4. Verify services
docker compose ps
curl http://localhost/health
```

Open **http://localhost** in your browser.

Default admin (when `SEED_DATABASE=true`):

| Field | Value |
|-------|-------|
| Email | `admin@medvoice.com` |
| Password | `Admin@123` |

Set `SEED_DATABASE=false` in `.env` after the first successful deployment.

## Services

| Service | Image / Build | Purpose | Host Port |
|---------|---------------|---------|-----------|
| **nginx** | `nginx:1.27-alpine` | Reverse proxy, single entry point | `${NGINX_HTTP_PORT}` (80) |
| **frontend** | Root `Dockerfile` | Vite build served by Nginx | internal |
| **backend** | `backend/Dockerfile` | FastAPI API, migrations on start | internal |
| **postgres** | `postgres:16-alpine` | Primary database | internal |
| **redis** | `redis:7.2-alpine` | Cache / queue (AOF persistence) | internal |
| **minio** | `minio/minio` | S3-compatible object storage | 9000, 9001 |
| **minio-init** | `minio/mc` | One-shot bucket bootstrap | — |

## Volumes (Persistent Storage)

| Volume | Mount | Data |
|--------|-------|------|
| `medvoice_postgres_data` | `/var/lib/postgresql/data` | Database |
| `medvoice_redis_data` | `/data` | Redis AOF |
| `medvoice_minio_data` | `/data` | Object storage |
| `medvoice_backend_storage` | `/app/storage` | Voice recordings, transcription audio, AI settings |

List volumes:

```bash
docker volume ls | grep medvoice
```

## Health Checks

| Service | Check |
|---------|-------|
| postgres | `pg_isready` |
| redis | `redis-cli ping` |
| minio | `GET /minio/health/live` |
| backend | `GET /health` |
| frontend | `GET /` |
| nginx | `GET /health` (proxied to backend) |

View health status:

```bash
docker compose ps
docker inspect --format='{{.State.Health.Status}}' medvoice-backend-1
```

## Environment Variables

### Root `.env.example`

Used by `docker compose`. Key groups:

- **Infrastructure**: `POSTGRES_*`, `REDIS_PASSWORD`, `MINIO_*`
- **Backend**: `APP_ENV`, `JWT_SECRET_KEY`, `CORS_ORIGINS`, `OPENAI_API_KEY`
- **Bootstrap**: `SEED_DATABASE`, `SEED_ADMIN_*`
- **Frontend build**: `VITE_API_BASE_URL=/api/v1` (same-origin via Nginx)

### `backend/.env.docker.example`

For running the API locally against Docker infrastructure services (Postgres/Redis/MinIO published or port-forwarded).

### `/.env.production.example`

Frontend-only Vite variables for production builds.

## Nginx Routing

Configuration: `docker/nginx/nginx.conf`

| Path | Upstream | Notes |
|------|----------|-------|
| `/` | `frontend:80` | SPA with client-side routing |
| `/api/v1/*` | `backend:8000` | REST API + auth cookies |
| `/health` | `backend:8000/health` | Liveness for load balancers |

Frontend static server config: `docker/nginx/frontend.conf` (embedded in frontend image).

Upload limit: **100 MB** (`client_max_body_size`).

## Container Startup Order

1. **postgres**, **redis**, **minio** start with health checks
2. **minio-init** creates buckets and exits
3. **backend** waits for Postgres, runs `alembic upgrade head`, optional seed, starts Uvicorn
4. **frontend** serves built SPA
5. **nginx** starts after backend and frontend are healthy

## Common Operations

```bash
# Build or rebuild images
docker compose build

# Start / stop
docker compose up -d
docker compose down

# Stop and remove volumes (destructive)
docker compose down -v

# Tail logs
docker compose logs -f backend nginx

# Run migrations manually
docker compose exec backend alembic upgrade head

# Re-seed (idempotent)
docker compose exec backend python -m app.db.seed

# Shell into backend
docker compose exec backend sh
```

## Production Hardening Checklist

- [ ] Generate unique `JWT_SECRET_KEY` (`openssl rand -hex 32`)
- [ ] Rotate all passwords in `.env` (Postgres, Redis, MinIO)
- [ ] Set `SEED_DATABASE=false` after first deploy
- [ ] Set `OPENAI_API_KEY` for AI features
- [ ] Terminate TLS at an external load balancer or add an HTTPS Nginx server block
- [ ] Set `REFRESH_TOKEN_COOKIE_SECURE=true` when serving over HTTPS
- [ ] Update `CORS_ORIGINS` to your production domain
- [ ] Restrict MinIO ports (`9000`/`9001`) to admin networks or remove host publishing
- [ ] Configure backups for `medvoice_postgres_data` and `medvoice_backend_storage`

## Redis & MinIO Integration Note

Redis and MinIO are fully provisioned with persistent storage, networking, health checks, and environment templates (`REDIS_URL`, `S3_*`). The application currently stores files on the local filesystem and does not consume Redis at runtime. These services are production-ready infrastructure for horizontal scaling and object storage migration without changing the Docker stack.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Backend restart loop | `docker compose logs backend` — check Postgres credentials and `DATABASE_URL` |
| 502 from Nginx | Wait for backend health; check `docker compose ps` |
| Login fails | Confirm `CORS_ORIGINS` matches browser URL; cookies require same-origin via Nginx |
| AI features unavailable | Set `OPENAI_API_KEY` in `.env` and restart backend |
| MinIO init failed | `docker compose logs minio-init`; re-run with `docker compose up minio-init` |

## File Reference

| File | Description |
|------|-------------|
| `docker-compose.yml` | Full stack definition |
| `Dockerfile` | Frontend multi-stage build |
| `backend/Dockerfile` | Backend API image |
| `backend/docker-entrypoint.sh` | Migrations + Uvicorn startup |
| `docker/nginx/nginx.conf` | Reverse proxy |
| `docker/nginx/frontend.conf` | SPA static server |
| `docker/minio/init.sh` | Bucket bootstrap |
| `.env.example` | Compose environment template |
