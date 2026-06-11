# AI Cloud Document Vault

> Snap it. Store it. Ask it anything.

A cloud-based document management app that lets you digitise physical documents (manuals, warranties, guides) and query them with AI. Never lose a manual again — and never flip through 60 pages to find one answer.

## What It Does

1. **Capture** — Photograph or upload any physical document
2. **Digitise** — AI-powered OCR extracts and structures the text
3. **Organise** — Auto-categorises by brand, product type, and document type
4. **Search** — Full-text and semantic search across all your documents
5. **Ask AI** — Natural language Q&A grounded in your stored documents
6. **Sync** — Cloud-native, accessible from any device

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI |
| Frontend | React, TypeScript, React Native |
| Database | PostgreSQL + pgvector |
| Cloud | AWS (ECS Fargate, S3, RDS, Cognito, CloudFront) |
| AI/ML | OpenAI (GPT-4o-mini, embeddings), AWS Textract |
| Infrastructure | Terraform, Docker, GitHub Actions |

## Project Structure

```
├── specs/              # Project specification documents
│   ├── REQUIREMENTS.md # Functional & non-functional requirements
│   ├── DESIGN.md       # Architecture, data model, API design
│   └── TASKS.md        # Sprint plan, milestones, risk register
├── backend/            # FastAPI application
├── frontend/           # React web application
├── mobile/             # React Native mobile app
├── terraform/          # Infrastructure as Code
└── README.md
```

## FYP Context

**Programme:** Software Design with AI for Cloud Computing (Level 8)  
**Institution:** TUS Athlone  
**Timeline:** 24 weeks (~408 hours)

---

See `specs/` for detailed requirements, design, and project plan.
