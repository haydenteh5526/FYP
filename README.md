# AI Cloud Document Vault

> Snap it. Store it. Ask it anything.

A cloud-based document management app that lets you digitise physical documents (manuals, warranties, guides) and query them with AI. Never lose a manual again — and never flip through 60 pages to find one answer.

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- (Optional) OpenAI API key for AI features

### Run the app

```bash
# 1. Start the backend (API + database + storage)
docker compose up --build

# 2. Start the frontend
cd frontend && npm install && npm run dev
```

Open http://localhost:3000 — register an account and start uploading documents.

### Run the mobile app

```bash
cd mobile && npm install && npx expo start
```

Scan the QR code with Expo Go on your phone.

## Features

| Feature | Description |
|---------|-------------|
| 📷 Document Capture | Upload photos of physical documents (JPEG, PNG, WebP, PDF) |
| 🔍 OCR | Automatic text extraction via Tesseract (local) or AWS Textract (prod) |
| 🏷️ Auto-Categorisation | AI detects brand, model, and document type |
| 🔎 Semantic Search | Find documents by meaning, not just keywords |
| 💬 AI Q&A | Ask questions and get answers grounded in your documents |
| 🔒 Authentication | JWT-based auth with per-user data isolation |
| 📱 Cross-Platform | Web app + React Native mobile app |
| ☁️ Cloud-Ready | Terraform modules for AWS deployment |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  React Web App  │     │  React Native   │     │  API (FastAPI)   │
│   localhost:3000 │────▶│  Mobile App     │────▶│   localhost:8000  │
└─────────────────┘     └─────────────────┘     └────────┬─────────┘
                                                          │
                              ┌────────────────────────────┼──────────────┐
                              │                            │              │
                    ┌─────────▼─────┐        ┌─────────────▼──┐  ┌───────▼──────┐
                    │ PostgreSQL    │        │ MinIO (S3)      │  │ OpenAI API   │
                    │ + pgvector   │        │ Object Storage  │  │ GPT-4o-mini  │
                    └──────────────┘        └─────────────────┘  └──────────────┘
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login, get token |
| POST | `/api/v1/documents` | Upload document (OCR + AI) |
| GET | `/api/v1/documents` | List documents (filterable) |
| GET | `/api/v1/documents/{id}` | Get document detail |
| PATCH | `/api/v1/documents/{id}` | Update metadata |
| DELETE | `/api/v1/documents/{id}` | Delete document |
| POST | `/api/v1/documents/{id}/reprocess` | Re-run OCR + AI |
| GET | `/api/v1/search?q=` | Semantic search |
| POST | `/api/v1/ai/ask` | Ask a question (RAG) |
| GET | `/api/v1/categories` | List categories |
| POST | `/api/v1/categories` | Create category |
| GET | `/api/v1/warranties` | List warranties |
| POST | `/api/v1/warranties` | Add warranty |

Full Swagger docs at http://localhost:8000/docs

## Project Structure

```
├── backend/              # Python FastAPI application
│   ├── app/
│   │   ├── routers/      # API endpoint handlers
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── services/     # Business logic (OCR, AI, storage)
│   │   └── schemas/      # Pydantic request/response models
│   ├── alembic/          # Database migrations
│   └── tests/            # pytest test suite
├── frontend/             # React + TypeScript + shadcn/ui
│   ├── src/pages/        # Dashboard, Upload, Search, Ask AI
│   └── e2e/              # Playwright end-to-end tests
├── mobile/               # React Native + Expo
├── terraform/            # AWS infrastructure (VPC, RDS, ECS, S3)
├── specs/                # Requirements, Design, Tasks, Security
└── docker-compose.yml    # Local development environment
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic |
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Mobile | React Native, Expo |
| Database | PostgreSQL 16 + pgvector |
| Storage | AWS S3 (MinIO locally) |
| AI/ML | OpenAI GPT-4o-mini, text-embedding-3-small, Tesseract OCR |
| Infrastructure | Terraform, Docker, GitHub Actions CI/CD |
| Security | JWT auth, bcrypt, rate limiting, CORS |

## Configuration

Copy `.env.example` to `.env` and set:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `S3_ENDPOINT` | S3/MinIO endpoint | Yes |
| `S3_ACCESS_KEY` | S3 access key | Yes |
| `S3_SECRET_KEY` | S3 secret key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | For AI features |
| `JWT_SECRET` | Secret for token signing | Yes (production) |
| `OCR_BACKEND` | `tesseract` or `textract` | No (default: tesseract) |

## Testing

```bash
# Backend tests (run in CI or fresh container)
cd backend && pytest tests/ -v

# Backend tests with coverage
cd backend && pytest tests/ --cov=app --cov-report=term-missing

# Fast unit tests only (no DB required)
pytest tests/test_chunking.py tests/test_cache.py tests/test_retry.py -v

# Frontend unit tests (Vitest)
cd frontend && npm test

# Frontend type check + build
cd frontend && npm run build

# E2E tests
cd frontend && npx playwright test

# Load testing
cd backend && locust -f tests/locustfile.py --host http://localhost:8000
```

## Developer Experience

A `Makefile` wraps the common commands — run `make help` to list them:

| Command | Description |
|---------|-------------|
| `make up` / `make down` | Start / stop all services |
| `make build` | Rebuild the API image |
| `make test` | Run the backend test suite |
| `make test-unit` | Run fast unit tests (no DB) |
| `make cov` | Run tests with coverage |
| `make lint` / `make fmt` | Lint / auto-fix with ruff |
| `make health` | Check API readiness (DB/S3/AI/cache) |
| `make metrics` | Show Prometheus metrics |

Install pre-commit hooks (ruff, trailing whitespace, private-key detection):

```bash
pip install pre-commit && pre-commit install
```

## Observability

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness probe (fast, no dependencies) |
| `GET /health/ready` | Readiness — checks DB, S3, AI, and cache; returns 503 if degraded |
| `GET /metrics` | Prometheus metrics (request count + latency histograms) |
| `GET /api/v1/ai/status` | AI provider availability (OpenAI / Ollama / OCR backend) |

Requests are correlated via an `X-Request-ID` header (generated if absent) and surfaced in structured logs. Redis provides response/embedding caching with a graceful in-memory fallback when unavailable.

## Deployment (AWS)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform apply
```

## FYP Context

**Programme:** Software Design with AI for Cloud Computing (Level 8)  
**Institution:** TUS Athlone  
**Timeline:** September 2026 – May 2027

See `specs/` for detailed requirements, design, tasks, and security documentation.

## License

Academic project — all rights reserved.
