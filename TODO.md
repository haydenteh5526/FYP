# TODO — Priority Order

## 1. Setup (Do First)

- [ ] Set `OPENAI_API_KEY=sk-...` in `.env` file
- [ ] Run `docker compose up --build` and test the full app at http://localhost:3000
- [ ] Upload 5-10 real documents (manuals, receipts, guides) to verify everything works

## 2. Evaluation (Semester 1)

- [ ] **OCR accuracy benchmark** — Scan 20 documents, compare extracted vs actual, calculate %
- [ ] **RAG Q&A evaluation** — Write 50 questions, rate AI answers (correct/partial/wrong)
- [ ] **Categorisation accuracy** — Upload 30 docs, check brand/model/type detection %
- [ ] **Load testing** — Run `locust -f backend/tests/locustfile.py --host http://localhost:8000`, record results
- [ ] **Accessibility audit** — Run Lighthouse on frontend, document score

## 3. Literature Review (Semester 1)

- [ ] Research OCR techniques (Tesseract, Textract, PaddleOCR)
- [ ] Research RAG architectures (chunking strategies, embedding models, retrieval methods)
- [ ] Research cloud-native patterns (12-factor, IaC, containerisation)
- [ ] Review similar tools (Paperless-ngx, Quivr, Docling)
- [ ] Write up as a chapter

## 4. AWS Deployment (Semester 1)

- [ ] **Set an AWS Budget alert (e.g. $20) before anything else**
- [ ] Create AWS account (free tier)
- [ ] Run `cd terraform && cp terraform.tfvars.example terraform.tfvars` and fill values
- [ ] Run `terraform init && terraform apply`
- [ ] Set `frontend_url` in `terraform.tfvars` to `terraform output app_url`, then re-apply
      (CloudFront's domain isn't known until it exists; the API needs it for OAuth
      redirects and verification emails)
- [ ] Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to GitHub repo Secrets
- [ ] Add repo Variables: `FRONTEND_BUCKET` and `CLOUDFRONT_DISTRIBUTION_ID`
      (from `terraform output frontend_bucket` / `cloudfront_distribution_id`)
- [ ] Set `DEPLOY_ENABLED=true` in GitHub repo Settings > Variables
- [ ] Verify CD pipeline deploys successfully (API + worker + frontend)
- [ ] Run the smoke test against the deployed URL, then `terraform destroy` when done

## 5. Usability Testing (Semester 2)

- [ ] Recruit 5 participants
- [ ] Have them complete tasks: upload, search, ask AI
- [ ] Administer SUS (System Usability Scale) questionnaire
- [ ] Calculate and document SUS score

## 6. FYP Report (Semester 2)

- [ ] Introduction & problem statement
- [ ] Literature review chapter
- [ ] Design chapter (reference `specs/DESIGN.md`)
- [ ] Implementation chapter (key decisions, code snippets)
- [ ] Testing & evaluation chapter (all benchmark results from step 2 + 5)
- [ ] Conclusion & future work

## 7. Demo & Viva (Final Weeks)

- [ ] Record 5-min demo video (register → upload → OCR → search → ask AI → answer)
- [ ] Prepare viva slides (problem, architecture, AI approach, live demo, results)
- [ ] Rehearse presentation (at least twice)
- [ ] Prepare for questions: "Why not Supabase?", "How does RAG work?", "What would you do differently?"

## Future Work (mention in report only)

- Multi-page scanning UI flow
- Camera overlay alignment guide
- Push notifications for warranty expiry
- Family/household sharing
- AR overlay for appliance recognition
- Monetisation: freemium tiering (storage/AI-query quotas, priority processing, handwriting OCR, public API) with a payment provider — requires quota enforcement in the API and a billing data model
