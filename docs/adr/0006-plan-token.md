# ADR-0006: Bind approved selection to installation with a plan token

- **Status:** Accepted
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

The AI plugin presents a plan to the developer, then requests installation. Without binding, a malformed or manipulated caller could change the package set or act on stale marketplace state between those steps.

## Decision

`apm plan` issues a short-lived integrity-protected token binding repository, marketplace, selected top-level packages, APM plan digest, catalogue state, tool identity, and expiry. `apm install` accepts only a valid matching token and explicit confirmation.

## Consequences

The selected package set cannot change invisibly. Planning must be repeated when state changes. Key management for local token integrity must be designed carefully; an opaque server is not required.

## Alternatives considered

Passing package names again during install is vulnerable to mismatch. A plain plan file can be edited. Trusting the model's narrative confirmation is insufficient.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
