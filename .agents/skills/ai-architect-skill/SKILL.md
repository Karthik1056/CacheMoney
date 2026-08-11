---
name: ai-architect-skill
description: Designs and implements AI/ML/NLP-driven features for any application — classification, extraction, parsing, retrieval, agentic tool access, and LLM-generated summaries/narratives — following a deterministic-first, confidence-gated approach. Use this skill whenever a task involves adding, designing, or reviewing any AI, NLP, or LLM-driven capability, regardless of the specific project or domain.
---

# Skill: AI Feature Architecture

## Objective
Turn a raw AI feature request into a concrete, implementable design — what handles it, what the input/output contract is, and how failures or low-confidence results are handled — before writing any code.

## Rules of Engagement
- **Artifact handover**: save the architecture design (e.g. `production_artifacts/AI_Architecture.md`) before writing code, so it can be reviewed independently of implementation.
- **Data requirements**: if a field or table doesn't exist yet, write the requirement to a shared artifact for the database owner instead of assuming it exists.
- **Deterministic-first**: for every task, define the cheapest reliable non-AI path first (exact match, lookup table, regex, rule) and only invoke a model for what's left.
- **Confidence gating**: every AI output includes a confidence score and a defined threshold below which the system defers to a human instead of acting automatically.

## Instructions

### 1. Frame the Feature
1. Identify the trigger (user action, scheduled job, incoming event).
2. Identify the input (raw text, structured data, an image/document, a query).
3. Decide whether a deterministic pass can handle some or all cases before any model is involved.

### 2. Choose the Approach
1. Prefer the smallest/cheapest model or local/open-source model that can plausibly hit the required accuracy; only justify a larger or hosted model with a stated reason (e.g. accuracy gap, capability the smaller model lacks like audio transcription).
2. Force structured output (a typed JSON schema) from any model call — never rely on downstream regex-parsing of free text.
3. Decide sync vs. async: does this block a user action, or can it run in the background/on a schedule?

### 3. Define Failure Handling
1. Set an explicit confidence threshold for the task.
2. Define what happens below threshold — flag for review, ask the user, fall back to a simpler method — never silently guess and proceed as if certain.
3. Decide what happens on outright model/API failure (retry, fallback model, graceful error).

### 4. Separate Decision from Explanation
Where a model is used to explain a result to a human (a summary, an alert, a narrative), keep the underlying decision/detection logic deterministic wherever possible, and use the model only to phrase the explanation — this keeps the system auditable and predictable.

### 5. Hand Off
Produce: (a) the architecture doc covering trigger/input/approach/output-schema/thresholds for each feature, (b) working code implementing it, (c) any schema/data requirements sent to the database owner, (d) the contract (expected request/response shape) for anything else in the system that depends on this feature.