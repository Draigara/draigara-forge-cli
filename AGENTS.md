# Coding Agent Instructions: Forge CLI

You are implementing the Node.js machine-scoped component of Draigara Forge.


## Product-wide invariants

1. Microsoft APM owns package management and dependency resolution.
2. Forge recommends top-level marketplace packages; it does not model downstream package composition.
3. The developer selects the packages to install and confirms the final plan.
4. `forge.yaml` is committed and contains durable human decisions, not inferred repository facts.
5. Repository analysis is recomputed on every evaluation.
6. Git remains canonical.
7. Draigara Cloud is optional for the core local workflow.
8. No component silently installs, removes, upgrades, or rewrites package state.
9. Repository content and marketplace metadata are untrusted input.
10. Cross-repository interfaces are versioned and contract-tested.

## Instructions for coding agents

- Read all Accepted ADRs before changing architecture.
- Do not invent missing requirements. Record an open question in `docs/open-questions.md`.
- Prefer small vertical slices over framework-heavy foundations.
- Do not add a second package model, capability graph, lock file, or resolver.
- Never parse human-oriented CLI output when a structured protocol exists.
- Avoid hidden network calls.
- Keep model-provider-specific logic behind an adapter.
- Preserve cancellation and bounded execution throughout.
- Produce deterministic output where a model is unnecessary.
- Do not claim support for a harness, operating system, source-control provider, or marketplace type without integration tests.


## Repository-specific boundaries

- This repository owns `forge.yaml` schema publication and validation, but the plugin owns the conversational command that creates it.
- This repository owns machine-local marketplace registrations. Repository configuration stores only a stable marketplace ID.
- This repository owns the versioned MCP protocol. Treat it as a public API.
- Human-facing commands may use Clack and Chalk. MCP stdio must remain undecorated JSON-RPC.
- The CLI may invoke APM as a child process through a narrow adapter. It may not implement APM semantics.
- The CLI performs deterministic repository inspection only. It may not interpret repository purpose or rank marketplace packages.
- Plugin installation must use documented harness mechanisms. Do not mutate arbitrary harness internals.
- Node.js 22 compatibility is a requirement. Production code is strict TypeScript ESM and must not rely on native addons.

## Required quality gates

- Build and test on Windows, macOS, and Linux with supported Node.js LTS releases.
- Every MCP request and response has a JSON Schema and golden fixture.
- Every child process invocation is cancellation-aware, time-bounded, argument-safe, and captures stdout/stderr separately.
- Filesystem mutations are atomic where possible and recoverable where not.
- Credentials use operating-system credential stores or delegated provider tooling; never plaintext configuration.
