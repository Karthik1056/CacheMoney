---
name: tester-skill
description: Writes and runs tests, or produces a structured test report, for any frontend, backend, database, or AI/LLM-driven feature. Use whenever a task involves testing, verifying, QA-ing, or reviewing whether an implemented feature actually works as specified, regardless of project or layer.
---

# Skill: Cross-Layer Testing & QA

## Objective
Given a feature, change, or bug report, determine what needs testing, at what level, execute it, and produce a clear, evidence-based report of what passes, what fails, and why — without assuming correctness and without silently patching implementation code.

## Rules of Engagement
- **Spec-first**: locate and read the actual spec/artifact for the feature being tested before writing any test. If no spec exists, say so explicitly rather than inventing acceptance criteria.
- **Report, don't silently fix**: your default deliverable is a test report. Only modify implementation code if explicitly asked to.
- **Right-sized tests**: prefer the cheapest test level that would actually catch the class of bug you're worried about — don't default to end-to-end tests for logic a unit test could cover.
- **Non-deterministic outputs need different rules**: never test AI/LLM output for exact match; test schema validity, threshold behavior, and representative input coverage instead.

## Instructions

### 1. Scope the Test
1. Identify what layer(s) the feature touches: frontend, backend/API, database, AI/LLM, or a combination.
2. Pull the relevant spec/artifact (design doc, schema file, acceptance criteria, ticket description).
3. List the behaviors that must hold true — both the stated happy path and the edge cases implied by the domain (empty/null input, boundary values, concurrent access, invalid/malformed data, permission failures).

### 2. Choose Test Level(s)
- **Unit**: pure logic, calculations, parsers, validators, deterministic rules — fast, isolated, no real I/O.
- **Integration**: real interaction between two or more real components (API route + real database, service + real external call) — catches wiring bugs unit tests can't.
- **End-to-end**: a full user-facing flow through the real system — reserve for flows that genuinely need to be verified as a whole, not as a substitute for lower-level coverage.
- **Manual/structured**: for anything not yet automatable (visual layout, subjective UX judgment) — write the exact steps and expected outcome so the pass/fail is unambiguous even without automation.

### 3. Layer-Specific Checklists

**Backend/API**
- Valid input → correct response shape and status code.
- Invalid/malformed input → correct rejection, not a crash or silent pass-through.
- Auth/permission boundaries actually enforced, not just assumed.
- Claimed idempotency or uniqueness constraints actually hold under repeated/concurrent calls.

**Database**
- Constraints (not null, unique, check, foreign key) actually reject bad data when tested directly, not just declared in the schema file.
- Cascade/`ON DELETE` behavior matches what was specified.
- Migrations apply cleanly on a fresh database.

**Frontend**
- Component renders correctly across its documented prop/state variations, including loading, error, and empty states — not just the populated happy path.
- Form validation surfaces the right errors for the right invalid inputs.
- Keyboard navigation and basic labeling work for interactive elements.

**AI/LLM Features**
- Output always conforms to the declared JSON/schema shape, even when content varies across runs.
- Confidence-gating actually routes below-threshold cases to the documented fallback (human review, deterministic default) instead of silently applying a low-confidence result.
- Deterministic pre-passes (rules/regex/lookup) are covered by exact-match unit tests.
- Run a small representative + adversarial input set through the AI pass and check results against the schema and threshold logic — not against one hand-picked "it worked" example.

### 4. Report Results
For every failure: exact input/repro steps, expected behavior (cite the spec), actual behavior, and which layer/component is implicated. Separate genuine bugs (implementation doesn't match spec) from spec gaps (implementation matches an ambiguous or incomplete spec) — these route to different owners.

### 5. Re-Verify Fixes
When a fix is reported, re-run the exact previously-failing case before marking it resolved — don't just run a general smoke pass.

## Output
Deliver: (a) the tests themselves (code, or structured manual test steps) added to the project's test suite/docs, (b) `production_artifacts/Test_Report.md` — pass/fail summary, reproduction details for failures, and any coverage gaps or spec ambiguities found, (c) a clear routing note for who owns each open issue.