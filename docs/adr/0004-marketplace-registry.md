# ADR-0004: Separate machine marketplace registrations from repository selection

- **Status:** Accepted
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

A developer may work for several companies and with Draigara Open. Repository identity must be committed, while endpoints and credentials are machine-specific.

## Decision

Store multiple marketplace registrations in machine-scoped user configuration. Store only a stable marketplace ID in `forge.yaml`. Resolve the ID exactly; never fall back to another registration.

## Consequences

Consultants can move between repositories without manual global context switching. Repositories remain portable across machines. A missing registration produces a setup action rather than ambiguous behaviour.

## Alternatives considered

One globally active marketplace is error-prone. Committing private endpoint/authentication details is inappropriate. Inferring marketplace from Git remotes is too indirect and fragile.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
