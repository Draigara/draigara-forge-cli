# ADR-0012: Distribute Forge through npm and expose a stdio MCP server

- **Status:** Superseded by ADR-0013
- **Date:** 2026-07-19
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`
- **Supersedes:** ADR-0001, ADR-0002, ADR-0010, and ADR-0011's Native AOT packaging decision

## Context

Forge's machine-scoped responsibility is now a focused onboarding and orchestration workflow. Its users already work in ecosystems where Node.js is a normal prerequisite, while npm provides portable installation, provenance, and an established `npx` bootstrap experience. The Forge plugin also needs a structured local interface that works across supported agent harnesses without parsing decorated terminal output.

## Decision

Implement Forge as a strict TypeScript ESM package for Node.js 22 or later and publish it as `@draigara/forge`. The canonical bootstrap is `npx @draigara/forge setup`; setup installs the exact invoked package version globally so subsequent commands use `forge` from `PATH`.

Use Commander for command composition and Clack/Chalk behind an interaction boundary for human presentation. Expose the agent-facing contract as the internal stdio command `forge mcp`, implemented with the official Model Context Protocol TypeScript SDK and versioned schemas. There is no public `forge init`; repository initialization is owned conversationally by the Forge plugin through `/forge init` and the MCP tools.

Use npm Trusted Publishing and provenance for Forge package releases. Forge does not introduce a second signed release manifest or ship a platform-specific Forge installer. Setup detects APM and verifies its structured identity. If APM is missing, Forge prints the official APM installation instructions and stops; v1 does not download or execute a platform installer.

Forge may detect installed harnesses using documented executable and configuration signals, but APM remains the sole deployment and package-management boundary. Forge never parses human-oriented APM output. Missing structured APM operations remain upstream requirements and stable-release blockers.

## Consequences

Node.js becomes an explicit prerequisite and the native archive/signing/notarisation pipeline is removed. npm, pnpm, and Yarn users can bootstrap the same package, while Forge uses npm for its own global installation. Forge claims support through tested Node.js and APM paths, not through Forge-native binaries. The stdio MCP server becomes a public, schema- and fixture-tested cross-repository contract. CI tests Node.js 22 and 24.

The retained decisions in ADR-0003 through ADR-0008 continue to apply. ADR-0009 remains superseded: APM deploys plugin primitives to harnesses, while Forge's target detection is advisory and never writes harness configuration directly.

## Review triggers

Review this decision if Node.js ceases to be a reasonable prerequisite, npm cannot meet release-integrity requirements, MCP loses broad harness support, or APM publishes a structured machine-discovery contract that should replace Forge-owned detection.
