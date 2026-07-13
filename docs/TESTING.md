# MedVoice AI HMS — Testing Guide

Complete automated testing framework for backend (pytest), frontend (Vitest + React Testing Library), and end-to-end flows (Playwright).

## Overview

| Layer | Framework | Location | Coverage report |
|-------|-----------|----------|-----------------|
| Backend unit | pytest + pytest-asyncio | `backend/app/modules/*/tests/` | `backend/htmlcov/` |
| Backend integration | pytest + httpx ASGI client | `backend/tests/integration/` | `backend/htmlcov/` |
| Frontend unit/component | Vitest + RTL | `src/**/*.test.{ts,tsx}` | `coverage/` |
| E2E | Playwright | `e2e/*.spec.ts` | `playwright-report/` |

CI runs all suites on push/PR via [`.github/workflows/test.yml`](../.github/workflows/test.yml).

---

## Backend Tests

### Prerequisites

- Python 3.12+
- PostgreSQL 16 (for integration tests)

### Setup

```bash
cd backend
pip install -r requirements-dev.txt
cp .env.test.example .env   # optional — conftest sets defaults
createdb medvoice_test      # PostgreSQL
```

### Run tests

```bash
# All tests (unit + integration)
pytest

# Unit tests only (no database)
pytest app/modules/patients/tests -q

# Integration tests only
pytest tests/integration -m integration -q

# With coverage
pytest --cov=app --cov-report=html --cov-report=term-missing
```

Open `backend/htmlcov/index.html` for the HTML coverage report.

### Structure

```
backend/
├── tests/
│   ├── conftest.py          # DB bootstrap, AsyncClient, auth fixtures
│   ├── factories.py         # Factory Boy API payloads
│   ├── helpers.py           # Clinical workflow helpers
│   └── integration/
│       ├── test_auth.py
│       ├── test_rbac.py
│       ├── test_patients_api.py
│       └── … (all modules)
└── app/modules/patients/tests/   # Use-case unit tests with fakes
```

### Fixtures

| Fixture | Purpose |
|---------|---------|
| `client` | `httpx.AsyncClient` against FastAPI ASGI app |
| `admin_headers` | Bearer token for seeded admin user |
| `client_as_limited_user` | User with no permissions (403 tests) |

Integration tests auto-run `alembic upgrade head` and `python -m app.db.seed` once per session.

---

## Frontend Tests

### Setup

```bash
npm install
```

### Run tests

```bash
# Watch mode
npm test

# Single run
npm run test:run

# Coverage
npm run test:coverage
```

Open `coverage/index.html` for the HTML report.

### Structure

```
src/
├── test/
│   ├── setup.ts             # jsdom polyfills (ResizeObserver, matchMedia)
│   ├── test-utils.tsx       # renderWithProviders (Theme, Query, Router)
│   └── fixtures/authUser.ts
├── components/ui/ui-components.test.tsx
├── features/auth/
│   ├── schemas/login.schema.test.ts
│   ├── components/LoginForm.test.tsx
│   ├── components/ProtectedRoute.test.tsx
│   └── hooks/useAuth.test.tsx
└── features/patients/components/PatientTable.test.tsx
```

### Conventions

- Mock `useAuth` / `authApi` at module boundaries — no production code changes
- Use `renderWithProviders` for MUI + React Query + Router context
- Prefer role/label queries over `data-testid`

---

## End-to-End Tests (Playwright)

### Prerequisites

- Backend running on `:8000` with seeded database
- Frontend dev server on `:5173` (or set `PLAYWRIGHT_BASE_URL`)

### Run locally

```bash
# Terminal 1 — backend
cd backend && alembic upgrade head && python -m app.db.seed
uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
npm run dev

# Terminal 3 — E2E (auto-starts servers if not running)
npm run test:e2e
```

Playwright config starts both servers automatically when they are not already running.

### E2E coverage

| Spec | Flow |
|------|------|
| `login.spec.ts` | Login, invalid credentials, redirect |
| `patient-registration.spec.ts` | Register patient |
| `appointment-booking.spec.ts` | Appointment list + create form |
| `consultation.spec.ts` | Consultation list |
| `prescription.spec.ts` | Prescription list |
| `billing.spec.ts` | Invoice list |
| `notification.spec.ts` | Notification center |
| `search.spec.ts` | Global search dialog |

Authenticated tests use storage state from `e2e/auth.setup.ts` (admin user).

### Environment variables

| Variable | Default |
|----------|---------|
| `E2E_ADMIN_EMAIL` | `admin@medvoice.com` |
| `E2E_ADMIN_PASSWORD` | `Admin@123` |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173` |
| `PLAYWRIGHT_SKIP_WEBSERVER` | Set to skip auto-start servers |

---

## CI Pipeline

GitHub Actions workflow **Test** runs four jobs:

1. **backend-unit** — Patients use-case tests with coverage
2. **backend-integration** — Full API integration suite against PostgreSQL service
3. **frontend** — Vitest + coverage-v8
4. **e2e** — Playwright against bootstrapped backend + Vite dev server

Coverage artifacts are uploaded for each job.

---

## Adding New Tests

### Backend integration test

1. Add payload factory in `tests/factories.py` if needed
2. Create `tests/integration/test_{module}_api.py`
3. Mark with `pytestmark = pytest.mark.integration`
4. Use `client` + `admin_headers` fixtures

### Frontend component test

1. Co-locate `ComponentName.test.tsx` next to the component
2. Use `renderWithProviders` from `src/test/test-utils.tsx`
3. Mock hooks/API at the module boundary

### E2E flow

1. Add `e2e/{feature}.spec.ts`
2. Reuse admin storage state (default project)
3. Use accessible selectors (roles, labels)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Integration tests skipped | Ensure PostgreSQL is running and `medvoice_test` database exists |
| `MissingGreenlet` in tests | Do not use sync SQLAlchemy lazy loads in test setup |
| MUI DataGrid test flakes | Wrap grid in fixed `width`/`height` container |
| Playwright login fails | Run seed script; verify backend on port 8000 |
| Vitest `ResizeObserver` error | Already polyfilled in `src/test/setup.ts` |
