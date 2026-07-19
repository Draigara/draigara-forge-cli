# ADR-0008: Use delegated authentication and OS credential stores

- **Status:** Accepted
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

Private marketplaces require authentication. Plaintext tokens in CLI configuration, repository files, or shell arguments are unacceptable.

## Decision

Prefer APM/provider delegated authentication. When Forge must hold a secret reference, use the operating-system credential store through an abstraction. Configuration stores only non-secret metadata.

## Consequences

Implementation and testing vary by OS. Headless Linux environments need a documented secure strategy. Credentials remain outside Git and support exports.

## Alternatives considered

Environment variables may be supported for ephemeral CI but not as the primary desktop store. Encrypted blobs with an application-managed key are rejected. Plaintext files are rejected.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
