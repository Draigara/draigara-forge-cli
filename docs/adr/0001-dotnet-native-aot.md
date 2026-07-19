# ADR-0001: Use .NET 10, Spectre.Console, and Native AOT

- **Status:** Accepted
- **Date:** 2026-07-18
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`

## Context

The CLI must feel native, launch quickly, run without a preinstalled .NET runtime, and work across Windows, macOS, and Linux. The maintainer is experienced in .NET, and Spectre.Console provides a strong terminal UX. Distribution must not require users to understand runtime installation.

## Decision

Implement the CLI in C# on .NET 10 LTS. Use Spectre.Console for human-facing command rendering and prompts. Publish self-contained Native AOT binaries for supported RIDs from the first milestone. Use source-generated serialization and AOT-compatible libraries. Treat AOT warnings as build failures in production projects.

## Consequences

The codebase benefits from .NET tooling and type safety while producing standalone binaries. Library selection is constrained. Reflection-heavy frameworks and dynamic plugin loading are disfavoured. CI must test published native binaries, not only JIT builds.

## Alternatives considered

Rust or Go would offer straightforward static binaries but would move away from the maintainer's strongest ecosystem and complicate shared .NET expertise. Framework-dependent .NET would simplify some libraries but impose a runtime prerequisite. Single-file JIT publishing would not provide the same AOT properties.

## Review triggers

Review this decision when an upstream platform changes the assumptions, a security review finds the boundary insufficient, or an implementation proves the selected approach cannot meet the documented acceptance criteria.
