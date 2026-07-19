# ADR-0007: Repository analysis is deterministic and non-executing

- **Status:** Accepted
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

Repository analysis occurs on untrusted code. Running builds, package restores, scripts, or hooks to improve detection could execute arbitrary code and leak credentials.

## Decision

The analyser reads bounded metadata and selected manifest structures only. It honours ignore rules, prevents symlink escape, excludes secret/generation paths, and never invokes repository-defined commands.

## Consequences

Some facts may be less complete than build-system introspection, but the model can ask the developer when necessary. Security and predictability improve substantially.

## Alternatives considered

Executing `dotnet`, `npm`, or project scripts was rejected. Relying solely on filename search was too weak; safe parsers provide richer evidence without execution.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
