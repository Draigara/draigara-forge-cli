# ADR-0011: Scope Forge v1 as an APM wrapper

- **Status:** Partially superseded by ADR-0012
- **Date:** 2026-07-19
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`
- **Supersedes:** ADR-0002 for v1 delivery scope; ADR-0009

## Context

Microsoft APM owns marketplace registration, coding-host target discovery, package state, and global plugin lifecycle. Forge v1 needs a small, trustworthy onboarding surface without duplicating those responsibilities or coupling itself directly to harness internals.

## Decision

Ship Forge v1 as a standalone Native AOT executable that validates or installs a compatible APM release, delegates marketplace and global plugin operations to APM's documented structured protocols, and records only marketplace registrations that Forge created.

The general Forge bridge, repository inspection, `forge.yaml` workflows, REST registries, skill promotion, telemetry, self-update, shell completion, and direct harness adapters are deferred. APM is the only coding-host integration boundary in v1. Human-readable command output is the only v1 CLI surface; no unversioned JSON automation contract is introduced.

## Consequences

ADR-0002 remains the intended bridge design when that later phase begins, but it is not a v1 release requirement. ADR-0009's direct harness-adapter design is superseded: Forge discovers targets and installs the plugin only through APM's structured interfaces. Missing APM structured operations are upstream requirements or release blockers, never permission to parse human-oriented output.

## Release blockers

A stable release requires production Draigara Open and Forge plugin locators and digests, release signing keys, and official per-platform APM installer metadata. Placeholders must not enter a stable build.

## Review triggers

Review this decision when the bridge phase starts, APM changes its structured contracts, or a supported coding host cannot be served through documented APM mechanisms.
