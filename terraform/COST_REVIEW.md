# Terraform Cost & Demo-Readiness Review

**Reviewed:** 2026-07-23 · **Updated:** 2026-07-24 (gaps filled) · **Scope:** `terraform/`
**Verification:** `terraform validate` + `terraform fmt -check` pass (run via the
`hashicorp/terraform:1.9` Docker image). **No `apply`/`destroy` was run** — this
remains a static review; figures are rough monthly estimates for a single
always-on environment in `eu-west-1` and will vary by region and usage.

---

## What the Terraform provisions

| Module | Resource | Notes |
|--------|----------|-------|
| networking | VPC, 2 public + 2 private subnets, Internet Gateway, public route table | **No NAT gateway** (see below) |
| database | RDS PostgreSQL 16, `db.t3.micro`, 20 GB, single-AZ, private | `skip_final_snapshot = true` |
| compute | ECS Fargate cluster + **API** service + **worker** service (each 0.5 vCPU / 1 GB), ElastiCache Redis, Secrets Manager, CloudWatch logs (14d) | Tasks run in **public** subnets with public IP; Redis in private subnets |
| storage | S3 bucket (AES256, public access blocked, `force_destroy`) | |
| auth | Cognito user pool + client | **Currently unused by the app** |

## Estimated monthly cost (always-on)

| Item | Estimate |
|------|----------|
| RDS `db.t3.micro` (on-demand) | ~$12 (or **$0** under 12-month Free Tier) |
| RDS storage (20 GB gp2) | ~$2.50 |
| Fargate — API (0.5 vCPU + 1 GB) | ~$16 |
| Fargate — worker (0.5 vCPU + 1 GB) | ~$16 |
| ElastiCache `cache.t3.micro` (1 node) | ~$12 |
| Secrets Manager (1 secret) | ~$0.40 |
| S3 + CloudWatch Logs + Cognito | ~$1–2 (Cognito free < 50k MAU) |
| NAT gateway | **$0 — none provisioned** |
| Application Load Balancer | **$0 — none provisioned** |
| **Total** | **~$60/mo** (~$48/mo if RDS is Free-Tier eligible) |

The two most common AWS cost traps for this kind of stack — **NAT gateways
(~$32/mo each)** and an **ALB (~$16/mo)** — are still deliberately absent, which
keeps the bill roughly half of a "typical" ECS + RDS + Redis setup.

## Cost-smart choices ✅

- **No NAT gateway.** RDS and Redis sit in private subnets (no internet needed);
  the ECS tasks run in public subnets with `assign_public_ip = true`, reaching
  the internet (Textract, Gemini, S3) via the Internet Gateway. Biggest saving.
- **Single-AZ RDS** on `db.t3.micro` and a single-node `cache.t3.micro` Redis.
- **`skip_final_snapshot`** on RDS and **`force_destroy`** on S3 → fast, clean teardown.
- **CloudWatch log retention capped at 14 days.**

## ✅ Gaps closed (2026-07-24)

The IaC now deploys the *real* app rather than an API-only skeleton:

1. **ARQ worker service added** — a second Fargate service runs
   `arq app.worker.WorkerSettings` with the same image and env, so background
   OCR / categorisation / embedding / the warranty cron run properly (no reliance
   on the inline fallback).
2. **Redis via ElastiCache** — `cache.t3.micro` in private subnets, reachable only
   from the ECS security group; `REDIS_URL` is wired into both services.
3. **AI + secrets wired via Secrets Manager** — `DATABASE_URL`, `JWT_SECRET`,
   `GEMINI_API_KEY`, `GROQ_API_KEY`, `MISTRAL_API_KEY`, `RESEND_API_KEY`, and the
   Google OAuth pair are stored in one secret and injected as container `secrets`
   (never plaintext in the task definition). `EMBEDDING_PROVIDER=gemini` is set
   because Ollama isn't deployed on AWS, so embeddings use Gemini.
4. **Textract IAM** — the task role now has `textract:DetectDocumentText` /
   `AnalyzeDocument` (the task defs set `OCR_BACKEND=textract`).
5. **S3 via IAM task role** — the S3 client (app code) now falls back to the
   default credential chain and the deployment region when no explicit endpoint /
   keys are set, so on AWS it uses the task role instead of static keys. Local
   MinIO behaviour is unchanged (docker-compose still provides the env).
6. **S3 `force_destroy = true`** — `terraform destroy` no longer stalls on a
   non-empty bucket.

## ⚠️ Remaining caveats

- **No HTTPS / stable endpoint.** With no ALB, a task is reached by its public IP
  on port 8000, which changes on redeploy. The `api_url` output is a placeholder,
  not a resolvable URL. For a real public demo add an **ALB + ACM certificate**
  (~$16/mo) or document how to find the current task IP. *(Left out intentionally
  to keep cost down; it's the main thing standing between this and a "real" URL.)*
- **Unused Cognito module.** The app uses custom JWT + direct Google OAuth, so the
  Cognito user pool is vestigial. Harmless (free) but misleading — wire it up or
  remove it.
- **ECS security group allows `0.0.0.0/0` on 8000** — fine for a public API; edge
  protection relies on app-level rate limiting (no WAF).
- **`db_password` still flows through Terraform state** (used to build
  `DATABASE_URL`). Keep the state backend private/encrypted.

## Recommendations

### Keep cost low for FYP demos
1. **Tear down between demos:** `terraform destroy` (fully reproducible; S3
   `force_destroy` and RDS `skip_final_snapshot` make this clean).
2. **Or scale to zero:** set both ECS services' `desired_count = 0` and stop RDS
   when idle (RDS can be stopped up to 7 days). ElastiCache can be deleted/re-created.
3. **Set an AWS Budget alert** (e.g. $20) on day one — the most important guardrail.
4. Consider **Fargate Spot** for the worker (~70% cheaper) — brief interruptions
   are fine for background processing.

### Bottom line
The Terraform now describes a **working, production-shaped deployment** of the
full app — API + worker + Postgres + Redis + S3 with secrets in Secrets Manager
and least-privilege IAM — validated with `terraform validate`/`fmt`, at ~$60/mo
(≈$48 with RDS Free Tier) and clean teardown. The one remaining piece for a
"real" public demo is an ALB/TLS front door, deliberately omitted to keep cost
down. Deploying still requires user-supplied values (`db_password`, `jwt_secret`,
AI keys) via `terraform.tfvars` — see `terraform.tfvars.example`.
