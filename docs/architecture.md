# Architecture

Forge is a strict TypeScript ESM package published as `@draigara/forge` for Node.js 22 and 24. Commander composes commands, Clack provides human interaction, static Chafa-generated artwork provides the branded opener, Zod validates untrusted data, and the official Model Context Protocol SDK serves the hidden stdio integration boundary.

The public machine workflow is `forge setup`. Repository initialization belongs to the Forge plugin and calls the internal MCP server. The CLI keeps deterministic inspection and machine-local state; APM remains authoritative for targets, marketplace registrations, package state, and dependency resolution.

## Boundaries

- `src/commands` composes human commands without owning package semantics.
- `src/apm` is the sole mapping to documented, structured APM invocations.
- `src/processes` guarantees argument-list execution, bounded output, timeouts, and cancellation.
- `src/state` owns the Forge marketplace ledger and recovery journal.
- `src/mcp` exposes versioned, schema-tested plugin tools over stdio.
- `src/repository` performs deterministic, non-executing inspection and create-only `forge.yaml` writes.
- `src/interaction` owns branded output and prompt behavior.

No layer parses human APM output, mutates harness internals, calls a model, or constructs a parallel package graph.
