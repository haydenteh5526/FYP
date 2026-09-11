# Evaluation Plan

This plan records evidence for the FYP without inventing results. Run each
exercise against a clean, configured environment and commit only anonymised
measurements, not source documents or user data.

## 1. Preflight

1. Copy `.env.example` to `.env` and use a strong, unique `JWT_SECRET`.
2. Start the stack with `docker compose up --build -d`.
3. Confirm `http://localhost:8000/health` returns `{"status":"ok"}` and
   `http://localhost:8000/health/ready` reports healthy dependencies.
4. Run the automated gate:

   ```powershell
   C:\venv\fyp\Scripts\python.exe -m pytest backend\tests -v
   npm --prefix frontend run lint
   npm --prefix frontend test
   npm --prefix frontend run build
   npm --prefix mobile run typecheck
   npm --prefix mobile run doctor
   ```

## 2. OCR accuracy benchmark

Use 20 representative documents: receipts, manuals, warranty cards, clean
prints, skewed phone photos, and at least two multi-page PDFs. For every item,
retain approved ground-truth text outside the repository.

Record the number of words in the ground truth, substitutions, insertions, and
deletions. Report word error rate as:

```text
WER = (substitutions + insertions + deletions) / ground-truth words
OCR accuracy = (1 - WER) × 100
```

Also record processing time, input type, and whether manual correction was
needed. Do not average away failure cases; report median and range.

## 3. RAG evaluation

Write 50 questions before seeing the answers. Balance factual lookups,
multi-step questions, negative/no-answer prompts, and documents with similar
terminology. For each response, two reviewers independently mark it as
correct, partial, wrong, or safely declined, and verify that its cited source
supports the answer.

Report answer accuracy, grounded-citation rate, safe-decline rate, median
latency, provider/model, embedding provider, and disagreements resolved.

## 4. Categorisation evaluation

Upload 30 labelled documents. For brand, model, and document type, report
exact-match accuracy separately, plus examples of ambiguous labels. Exclude
documents used to tune prompts from the final sample.

## 5. Performance and accessibility

With the stack running, execute a conservative load test first:

```powershell
cd backend
C:\venv\fyp\Scripts\locust.exe -f tests\locustfile.py --host http://localhost:8000
```

Record concurrent users, duration, request count, error rate, p50/p95 response
times, CPU/memory observations, and the database/Redis configuration. Increase
load gradually and stop if errors become sustained.

Run Lighthouse in Chrome against the web application in both desktop and mobile
emulation. Record Performance, Accessibility, Best Practices, and SEO scores,
then manually verify keyboard navigation, visible focus, Escape-to-close,
semantic labels, contrast, and screen-reader announcements for upload and
errors.

## 6. Usability study

Recruit five consenting participants. Give each the same tasks: register,
upload a document, find it through search, and ask a question. Record task
completion, time, observed issues, and the ten standard SUS responses.

SUS score: for odd questions subtract 1; for even questions subtract the
response from 5; sum the adjusted values and multiply by 2.5. Report the mean,
range, participant profile at a high level, and qualitative themes. Obtain
consent and keep raw responses outside version control.
