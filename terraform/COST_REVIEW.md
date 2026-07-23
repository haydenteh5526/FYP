# Terraform Cost & Demo-Readiness Review

**Reviewed:** 2026-07-23 · **Scope:** `terraform/` (no deploy performed, no `terraform apply`/`destroy` run)
**Region assumed:** `eu-west-1`

This is a static review of the infrastructure code. Figures are rough monthly
estimates for a single always-on environment and will vary by region and usage.

---

## What the Terraform provisions

| Module | Resource | Notes |
|--------|----------|-------|
| networking | VPC, 2 public + 2 private subnets, Internet Gateway, public route table | **No NAT gateway** (see below) |
| database | RDS PostgreSQL 16, `db.t3.micro`, 20 GB, single-AZ, private | `skip_final_snapshot = true` |
| compute | ECS Fargate cluster + 1 API service (0.5 vCPU / 1 GB), CloudWatch logs (14d) | Runs in **public** subnets with public IP |
| storage | S3 bucket (AES256, public access blocked) | No `force_destroy` |
| auth | Cognito user pool + client | **Currently unused by the app** |

## Estimated monthly cost (always-on)

| Item | Estimate |
|------|----------|
| RDS `db.t3.micro` (on-demand) | ~$12 (or **$0** under 12-month Free Tier) |
| RDS storage (20 GB gp2) | ~$2.50 |
| Fargate (0.5 vCPU + 1 GB, 1 task) | ~$16 |
| S3 + CloudWatch Logs + Cognito | ~$1–2 (Cognito free < 50k MAU) |
| NAT gateway | **$0 — none provisioned** |
| Application Load Balancer | **$0 — none provisioned** |
| **Total** | **~$30–32/mo** (~$18/mo if RDS is Free-Tier eligible) |

The two most common AWS cost traps for this kind of stack — **NAT gateways
(~$32/mo each)** and an **ALB (~$16/mo)** — are both absent. That keeps the bill
low, but has functional consequences (below).

## Cost-smart choices already made ✅

- **No NAT gateway.** RDS sits in private subnets (no internet needed); the ECS
  task runs in a public subnet with `assign_public_ip = true`, reaching the
  internet via the Internet Gateway. This is the single biggest saving.
- **Single-AZ RDS** on `db.t3.micro` — no Multi-AZ doubling.
- **`skip_final_snapshot = true`** — teardown is fast with no lingering snapshot storage.
- **CloudWatch log retention capped at 14 days** — avoids unbounded log cost.

## ⚠️ Functional gaps (deployment is a skeleton, not the full app)

The Terraform provisions core infra but does **not** match the current running
system. Deploying as-is would give a degraded app:

1. **No ARQ worker service** — only the API task is defined. Background OCR/AI
   processing would fall back to inline request processing (the app supports
   this, but uploads would block).
2. **No Redis / ElastiCache** — caching and the job queue fall back to in-memory;
   fine functionally, but no shared cache across tasks.
3. **No embedding provider configured** — the task env sets only `DATABASE_URL`,
   `S3_BUCKET`, `OCR_BACKEND=textract`. With no `OLLAMA_URL`, `GEMINI_API_KEY`, or
   `GROQ_API_KEY`, embeddings fall back to **zero vectors** → search and RAG would
   not work. Q&A generation would hit the dev fallback.
4. **`JWT_SECRET` not set** → the API would boot on the insecure default (the app
   now warns about this at startup).
5. **Unused Cognito module** — the app moved to custom JWT + direct Google OAuth,
   so the Cognito user pool is vestigial from the original design. Harmless
   (free) but misleading; either wire it up or remove it.

## ⚠️ Security / correctness notes

- **Secrets as plaintext env** — `db_password` and (if added) API keys are passed
  directly in the task definition. Use **AWS Secrets Manager / SSM Parameter
  Store** with `secrets` in the container definition instead.
- **No HTTPS / stable endpoint** — with no ALB, the task is reached by its public
  IP on port 8000, which changes on redeploy. The `api_url` output is a
  placeholder, not a real resolvable URL. A real demo needs an ALB (+TLS) or at
  minimum a documented way to find the current task IP.
- **ECS security group allows `0.0.0.0/0` on 8000** — acceptable for a public API
  but there's no WAF/rate-limiting at the edge (app-level rate limiting exists).

## ⚠️ Teardown gotcha

- The S3 bucket has **no `force_destroy = true`**, so `terraform destroy` will
  **fail if any documents have been uploaded**. Empty the bucket first, or add
  `force_destroy = true` for demo environments.

## Recommendations

### To keep cost near zero for FYP demos
1. **Tear down between demos:** `terraform destroy` (everything is reproducible).
   Add `force_destroy = true` to the S3 bucket so destroy doesn't stall.
2. **Or scale to zero:** set ECS `desired_count = 0` and stop/start RDS when idle
   (RDS can be stopped for up to 7 days at a time).
3. **Set an AWS Budget alert** (e.g. $10) on day one — the single most important
   guardrail.
4. Prefer **Fargate Spot** for the demo task (~70% cheaper) if brief interruptions
   are acceptable.

### To make it a *working* deployment (if you demo live on AWS)
5. Add a **worker** ECS service (same image, `arq` command) and an
   **ElastiCache Redis** (or a small Redis task) and wire `REDIS_URL`.
6. Add the **AI env** (`GEMINI_API_KEY` / `GROQ_API_KEY`, `EMBEDDING_PROVIDER`)
   and `JWT_SECRET` via Secrets Manager — otherwise search/RAG/auth are broken or
   insecure.
7. Add an **ALB + ACM certificate** for a stable HTTPS endpoint, or accept the
   ephemeral public-IP approach and document it.

### Bottom line
The Terraform is a **cost-conscious teaching skeleton** — great for demonstrating
IaC structure (modules, VPC, RDS, ECS, S3, IAM least-privilege) at ~$30/mo or
less, and it tears down cleanly. It is **not** a turnkey deployment of the current
app: to run the real thing on AWS you'd need the worker, Redis, AI configuration,
and secrets wiring above. For the FYP, the honest framing is *"infrastructure
modules demonstrating a production-shaped AWS deployment"* rather than *"the app
runs in production on this."*
