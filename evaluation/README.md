# Evaluation workspace

This folder holds anonymised, reproducible FYP measurements. The protocol is in
[`../specs/EVALUATION_PLAN.md`](../specs/EVALUATION_PLAN.md).

Recommended layout for each frozen run:

```text
evaluation/
  templates/              blank schemas committed to Git
  results/YYYY-MM-DD/     anonymised raw CSVs and generated summaries
  figures/                charts generated from committed results
```

Do not commit source documents, ground-truth text containing personal data,
participant consent, participant notes, credentials or provider responses that
contain sensitive document content.

Every result folder should include a short `RUN.md` recording commit SHA,
dataset version, hardware, provider/model versions, configuration, cache state,
protocol deviations and commands used. Failed runs remain part of the record.
