#!/bin/sh
set -eu

echo "[entrypoint] Waiting for PostgreSQL..."
until python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def probe() -> None:
    engine = create_async_engine('${DATABASE_URL}', pool_pre_ping=True)
    try:
        async with engine.connect() as conn:
            await conn.execute(text('SELECT 1'))
    finally:
        await engine.dispose()

asyncio.run(probe())
" 2>/dev/null; do
  sleep 2
done
echo "[entrypoint] PostgreSQL is ready."

echo "[entrypoint] Running database migrations..."
alembic upgrade head

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "[entrypoint] Seeding database (idempotent)..."
  python -m app.db.seed
fi

WORKERS="${UVICORN_WORKERS:-2}"
echo "[entrypoint] Starting uvicorn with ${WORKERS} worker(s)..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers "${WORKERS}" \
  --proxy-headers \
  --forwarded-allow-ips="*"
