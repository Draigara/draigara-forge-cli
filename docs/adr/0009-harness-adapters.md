# ADR-0009: Use explicit harness adapters

- **Status:** Accepted
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

Harnesses differ in installation formats, plugin manifests, paths, compatibility, and verification. Generic file copying would be unsafe and brittle.

## Decision

Define a small harness adapter contract and implement GitHub Copilot CLI first. A harness is supported only after documented installation semantics and end-to-end tests exist.

## Consequences

The CLI can add harnesses incrementally without polluting core logic. There is repeated adapter work, but it makes assumptions visible and testable.

## Alternatives considered

A universal generic adapter was rejected. Letting the plugin install itself was rejected because machine setup and artifact verification belong in the trusted CLI.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
