# Implementation Status

**Updated:** 2026-07-02  
**Status:** Feature-complete, pre-submission

This document maps the original design spec to what was actually implemented, noting additions, changes, and deferred items.

---

## Features Implemented (beyond original spec)

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-tag system | ✅ Done | M2M tags on documents, CRUD, assign/remove, UI editor |
| OCR version history | ✅ Done | Every text edit snapshots prior version; list + restore (reversible) |
| Background task queue (ARQ) | ✅ Done | Uploads return immediately; worker processes OCR/AI/embeddings; inline fallback |
| Push notifications | ✅ Done | Expo token registration, warranty-expiry daily cron + manual trigger |
| Dark mode | ✅ Done | Full oklch dark tokens, persists to localStorage, respects system preference |
| Prometheus metrics | ✅ Done | `/metrics` with request count + latency histograms (method/route/status) |
| Redis caching | ✅ Done | 2-tier embedding cache (L1 in-process, L2 Redis 24h TTL); graceful fallback |
| Conversation threads | ✅ Done | Ask AI sends last 6 turns of history for follow-up context |
| Bulk operations | ✅ Done | Multi-select + bulk delete/categorise on dashboard |
| Document sharing | ✅ Done | Time-limited presigned URLs (1h–7d) |
| Biometric auth (mobile) | ✅ Done | FaceID/TouchID gate via expo-local-authentication |
| Camera capture flow | ✅ Done | Preview → Retake/Upload → processing indicator |

## Architecture Changes from Original Design

| Aspect | Original Spec | Actual Implementation |
|--------|--------------|----------------------|
| Task queue | Celery + RabbitMQ | ARQ + Redis (simpler, reuses existing Redis) |
| Email provider | AWS SES / SMTP | Resend API (with console fallback) |
| AI provider | AWS Bedrock | OpenAI GPT-4o-mini + text-embedding-3-small |
| OCR | AWS Textract | Tesseract (local) with Textract as prod option |
| Object storage | AWS S3 | MinIO locally, S3 in prod (identical API) |
| Auth | AWS Cognito | Custom JWT + bcrypt + TOTP 2FA |
| Search | AWS OpenSearch | pgvector semantic + PostgreSQL full-text |
| Caching | ElastiCache | Redis 7 (docker-compose service) |

## Database Schema (8 migrations, all reversible)

| Migration | Table(s) | Purpose |
|-----------|----------|---------|
| 001 | users, documents, doc_chunks, categories, warranties | Initial schema |
| 002 | users.hashed_password | Password auth |
| 003 | users.is_verified, verification_token | Email verification |
| 004 | users.totp_secret | 2FA (TOTP) |
| 005 | tags, document_tags | Multi-tag system |
| 006 | document_versions | OCR edit version history |
| 007 | documents.processing_status | Background queue status |
| 008 | push_tokens | Push notification device tokens |

## API Endpoints (complete list)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login, get JWT |
| POST | `/api/v1/auth/reset-password` | Reset password |
| DELETE | `/api/v1/auth/account` | Delete account |
| POST | `/api/v1/auth/2fa/setup` | Set up TOTP 2FA |
| POST | `/api/v1/auth/2fa/verify` | Verify 2FA code on login |
| POST | `/api/v1/documents` | Upload (returns pending; worker processes) |
| GET | `/api/v1/documents` | List documents (filterable by brand/type/date) |
| GET | `/api/v1/documents/{id}` | Get document detail (includes tags) |
| PATCH | `/api/v1/documents/{id}` | Update metadata (snapshots text version) |
| DELETE | `/api/v1/documents/{id}` | Delete document + S3 files |
| POST | `/api/v1/documents/{id}/reprocess` | Re-run OCR + AI via worker |
| GET | `/api/v1/documents/{id}/versions` | List text edit history |
| POST | `/api/v1/documents/{id}/versions/{vid}/restore` | Restore prior version |
| GET | `/api/v1/documents/{id}/share` | Generate time-limited share link |
| POST | `/api/v1/documents/bulk/delete` | Bulk delete |
| POST | `/api/v1/documents/bulk/categorise` | Bulk re-categorise |
| GET | `/api/v1/search?q=` | Semantic + keyword hybrid search |
| POST | `/api/v1/ai/ask` | RAG Q&A (with conversation history) |
| GET | `/api/v1/ai/status` | AI provider availability |
| GET | `/api/v1/categories` | List categories |
| POST | `/api/v1/categories` | Create category |
| GET | `/api/v1/tags` | List tags |
| POST | `/api/v1/tags` | Create tag (idempotent) |
| DELETE | `/api/v1/tags/{id}` | Delete tag |
| PUT | `/api/v1/tags/documents/{docId}/tags/{tagId}` | Assign tag |
| DELETE | `/api/v1/tags/documents/{docId}/tags/{tagId}` | Remove tag |
| GET | `/api/v1/warranties` | List warranties |
| POST | `/api/v1/warranties` | Add warranty |
| GET | `/api/v1/warranties/expiring` | List expiring warranties |
| POST | `/api/v1/notifications/register` | Register push token |
| DELETE | `/api/v1/notifications/register` | Unregister push token |
| POST | `/api/v1/notifications/warranty-check` | Trigger warranty notification check |
| GET | `/health` | Liveness probe |
| GET | `/health/ready` | Readiness (DB, S3, AI, cache) |
| GET | `/metrics` | Prometheus metrics |

## Observability

- **Structured logging** with request-ID correlation (ContextVar)
- **Request metrics**: `docvault_requests_total{method,path,status}`, `docvault_request_latency_seconds{method,path}`
- **Readiness check** reports DB, S3, AI, and Redis cache status
- **Retry/backoff** on OpenAI + Resend API calls

## Testing

| Suite | Count | Coverage |
|-------|-------|----------|
| Backend unit tests (pure logic) | 24 | chunking, cache, retry, task queue, push |
| Backend integration tests | 11 | auth, upload, tags, categories, search, notifications, metrics |
| Frontend unit tests (Vitest) | 4 | cn utility |
| E2e tests (Playwright) | 4 | landing, login, dashboard, upload navigation |
| CI | GitHub Actions | lint + migrate + test with coverage on every push |

## Deferred / Future Work

| Item | Reason |
|------|--------|
| Mobile offline upload queue | Needs physical device testing |
| On-device push delivery | Needs EAS/dev build (backend fully wired, Expo API verified) |
| Full AWS deployment | Terraform modules ready; no live AWS account for CI |
| Celery/RabbitMQ migration | ARQ sufficient for this scale; would matter at >100 concurrent uploads |
| Search filters UI (date/category pills) | Design ready, deprioritised for queue work |

## Security Measures

- JWT RS256 tokens (configurable secret)
- bcrypt password hashing (passlib + bcrypt 4.0.1)
- TOTP 2FA (pyotp + QR setup)
- Email verification (Resend)
- Rate limiting (slowapi)
- CORS with configurable origins
- Per-user data isolation (all queries filter by user_id)
- No secrets in client responses
- Pre-commit hooks detect private keys
