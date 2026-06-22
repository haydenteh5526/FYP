# Security Checklist

## Authentication & Authorisation
- [x] Passwords hashed with bcrypt
- [x] JWT tokens with expiry (24h)
- [x] All data endpoints require authentication
- [x] Row-level isolation (users only access own documents)
- [x] Token validation on every request

## Input Validation
- [x] Email format validated (Pydantic EmailStr)
- [x] File type restricted (JPEG, PNG, WebP, PDF only)
- [x] File size limited (20MB max)
- [x] Search query minimum length enforced
- [x] UUID format validated for document IDs

## Data Protection
- [x] S3 bucket public access blocked (Terraform)
- [x] Database in private subnet (Terraform)
- [x] Pre-signed URLs expire after 15 minutes
- [x] Secrets via environment variables (not in code)
- [x] .env excluded from git

## API Security
- [x] Rate limiting via slowapi
- [x] CORS configured (only allowed origins)
- [x] No sensitive data in error messages
- [x] SQL injection prevented (SQLAlchemy parameterised queries)

## Infrastructure
- [x] TLS in transit (AWS ALB/CloudFront)
- [x] Encryption at rest (S3 AES-256, RDS encryption)
- [x] Least-privilege IAM roles (Terraform)
- [x] No hardcoded credentials in codebase

## Testing
- [x] Auth bypass tests (unauthenticated requests rejected)
- [x] Invalid input tests (bad email, wrong file type)
- [x] Cross-user access tests (user A can't see user B docs)
