# TODO — Items To Complete Manually

## Phase 1: Research

- [ ] Write literature review (OCR techniques, RAG architectures, cloud-native patterns, similar apps like Paperless-ngx/Quivr)

## Phase 6: Testing & Evaluation

- [ ] **OCR accuracy benchmark** — Scan 20 real documents, compare extracted text vs actual content, calculate character accuracy %
- [ ] **RAG Q&A evaluation** — Prepare 50 questions about your test documents, rate each AI answer as correct/partial/wrong, report % accuracy
- [ ] **Categorisation accuracy** — Upload 30 documents, check if brand/model/document_type are detected correctly, report %
- [ ] **Load testing** — Run `locust -f backend/tests/locustfile.py --host http://localhost:8000` with 50 users, record p95 response times
- [ ] **Usability testing** — Get 5 people to use the app, have them fill out SUS (System Usability Scale) questionnaire, calculate score
- [ ] **Accessibility audit** — Run Lighthouse audit on frontend, fix any critical WCAG issues, document results

## Phase 7: Documentation & Submission

- [ ] **FYP Report**
  - [ ] Introduction & problem statement
  - [ ] Literature review chapter
  - [ ] Design chapter (reference `specs/DESIGN.md`)
  - [ ] Implementation chapter (explain key technical decisions)
  - [ ] Testing & evaluation chapter (include benchmark results)
  - [ ] Conclusion & future work
- [ ] **Demo video** — 5 minute screencast: register → upload document → view OCR text → search → ask AI → get answer with sources
- [ ] **Viva presentation** — Slides covering: problem, architecture, AI approach, live demo, challenges, evaluation results
- [ ] **Viva rehearsal** — Practice the presentation at least twice

## Setup & Configuration

- [ ] **Set OpenAI API key** — Add `OPENAI_API_KEY=sk-...` to `.env` file (required for real AI features)
- [ ] **Set up AWS account** — Create account, configure credentials, run `cd terraform && terraform init && terraform apply`
- [ ] **Add AWS secrets to GitHub** — Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in repo Settings > Secrets (for CD pipeline)
- [ ] **Test end-to-end** — Upload real manuals (washing machine, router, etc.), verify OCR, search, and AI Q&A work correctly

## Future Work (mention in report, don't need to implement)

- Multi-page document scanning UI flow
- Camera overlay alignment guide
- Multi-column layout handling
- Push notifications for warranty expiry
- Family sharing / household accounts
- AR overlay (point phone at appliance, show relevant info)
