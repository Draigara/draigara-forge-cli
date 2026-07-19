# ADR-0003: Keep committed repository configuration minimal

- **Status:** Accepted
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

The repository must select its organisational marketplace, but inferred repository facts become stale and installed package state already belongs to APM.

## Decision

Define schema v1 as `schemaVersion` plus `marketplace.id`. Do not persist detected technologies, model summaries, recommendations, installed package lists, credentials, or lock state.

## Consequences

Configuration remains understandable and stable in Git. `/forge evaluate` must recompute context. Future additions require a schema decision and must represent durable human intent.

## Alternatives considered

Persisting a repository profile would create synchronisation problems. Developer-local marketplace selection would make team behaviour inconsistent. Duplicating APM state would create conflicting sources of truth.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
