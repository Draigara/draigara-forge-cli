# ADR-0005: Delegate package management completely to APM

- **Status:** Accepted
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

APM already owns package manifests, search, dependencies, installation, lockfiles, and deployment. Reimplementing these capabilities would fragment the ecosystem and create divergent semantics.

## Decision

The CLI interacts with APM through a narrow versioned adapter. It may normalise transport output and enforce Forge safety checks, but must not resolve dependencies, edit APM state directly, or invent package semantics.

## Consequences

Forge remains focused on discovery and trusted orchestration. APM upgrades may require adapter changes. Some desired plan detail may be limited by APM's official interfaces.

## Alternatives considered

A Forge package manager or capability graph is explicitly rejected. Directly editing APM manifests/lockfiles is rejected except where an official APM contract requires it.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
