# ADR-0010: Sign, attest, and verify CLI releases

- **Status:** Accepted
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

The CLI can install plugins, access marketplace credentials, and invoke APM. A compromised binary or update channel has a large blast radius.

## Decision

Produce deterministic release artifacts with checksums, SBOMs, provenance, platform signatures, and macOS notarisation. Use protected GitHub environments for signing. Verify artifacts before publishing.

## Consequences

Release setup is more expensive, especially for personal Apple and Windows signing identities. The product earns appropriate platform trust and supports enterprise adoption.

## Alternatives considered

Unsigned archives are insufficient. Deferring signing until enterprise adoption was rejected because trust should be established from the first public stable release.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
