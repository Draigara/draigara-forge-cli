# ADR-0002: Expose a versioned process bridge

- **Status:** Superseded for v1 by ADR-0011
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

The plugin operates inside an AI harness and needs deterministic workstation operations. Letting model-generated instructions invoke arbitrary CLI commands is unsafe, while parsing decorated human output is brittle.

## Decision

Expose `forge bridge v1` as a supported, schema-defined process API. Requests and responses are structured JSON/JSONL. The bridge supports protocol negotiation, stable error codes, bounded operations, and no interactive prompts.

## Consequences

The bridge becomes a public compatibility surface requiring schemas, fixtures, and semantic discipline. It creates a secure choke point and allows non-.NET plugins to integrate without embedding the CLI. Human UX can evolve independently.

## Alternatives considered

A local HTTP daemon adds lifecycle, port, authentication, and attack-surface complexity. An in-process SDK would couple language/runtime and bypass the installed binary. Parsing human CLI output is rejected.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
