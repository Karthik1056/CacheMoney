---
name: db-architect-skill
description: Designs a normalized, production-ready relational database schema for any application — tables, constraints, indexes, relationships, and a migration path — following normalization-first, domain-aware modeling principles. Use this skill whenever a task involves designing, extending, or reviewing a database schema or data model, regardless of the specific project or domain.
---

# Skill: Database Schema Design

## Objective
Produce a normalized, well-constrained relational schema (in whatever schema/migration format the project uses — SQL DDL, an ORM schema, etc.) that correctly models the domain's data and supports the features it needs to serve.

## Rules of Engagement
- **Artifact handover**: save the final schema and a short design-decisions doc, so it can be reviewed and implemented independently.
- **Read dependencies first**: check the project's confirmed requirements and any data needs raised by other specialists (e.g. an AI feature needing a confidence-score column) before finalizing tables.
- **Domain-appropriate typing**: match column types to what the data actually represents — exact/decimal types for money, explicit timezone-aware timestamps for dates, enums for fixed value sets rather than free-text strings.

## Instructions

### 1. Identify Entities
1. List every entity implied by the project's requirements — don't invent speculative ones, but don't under-model either (e.g. a "status" that will clearly need more than two values later should be an enum, not a boolean).
2. For each entity, decide its core fields, whether it needs soft-delete (`deleted_at`) vs. hard-delete, and whether it needs audit fields (`created_at`, `updated_at`, or a full audit log for sensitive changes).

### 2. Define Relationships
1. State the cardinality of every relationship (1:1, 1:N, N:M) explicitly.
2. Choose an explicit `ON DELETE` policy for every foreign key (`CASCADE`, `RESTRICT`, `SET NULL`) based on whether losing the parent should destroy, block, or orphan the child.

### 3. Constrain and Index
1. Add indexes for every foreign key and every column used in common filters or sorts (dates, status flags, lookups).
2. Add check constraints for invariants the database itself should enforce (non-zero amounts, valid ranges, non-negative quantities).
3. Use enums/lookup tables instead of free-text strings for any fixed set of values.

### 4. Flag Sensitive Data
Identify any columns holding credentials, PII, financial data, or health data, and note what protection they need (encryption at rest, restricted access, exclusion from logs/exports) even if implementing that protection is someone else's task.

### 5. Produce a Migration Path
1. Generate the actual schema/migration file, not just a diagram.
2. Note any constraints that can't be expressed in the ORM/ODM layer and need raw migration SQL.
3. Document key design decisions (why a field is typed a certain way, why something is denormalized, why a cascade rule was chosen) in a short companion doc.

## Output
Deliver: (a) the schema/migration file, ready to run, (b) a short design-decisions doc, (c) confirmation to any dependent specialist (e.g. an AI feature owner) that their required fields are present, or a note on what couldn't be added and why.