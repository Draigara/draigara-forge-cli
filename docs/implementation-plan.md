# Forge CLI npm Implementation Plan

**Status:** Approved implementation plan

## Milestone 0: Architecture and package skeleton

- Supersede the Native AOT and process-bridge decisions with ADR-0012.
- Create strict TypeScript ESM packaging for `@draigara/forge`, Node.js `>=22`, Commander, Clack/Chalk, Zod, tsdown, and Vitest.
- Preserve the branded wide, compact, and plain terminal profiles as static assets.

## Milestone 1: Safe machine boundaries

- Implement cancellable, time-bounded argument-list process execution with independent bounded stdout/stderr.
- Implement platform paths, atomic Forge state, recovery journals, redaction, and documented harness detection.
- Implement a fake APM executable and structured-contract fixtures.

## Milestone 2: Setup and lifecycle

- Deliver the convergent `forge setup` workflow, including npm PATH preflight, compatible APM bootstrap, explicit plans, global Forge installation, marketplace registration, target selection, global plugin deployment, and doctor.
- Deliver marketplace and plugin lifecycle commands through the APM adapter.
- Never parse human-oriented APM output or directly modify harness files.

## Milestone 3: MCP and plugin contract

- Expose the internal stdio `forge mcp` command with versioned, bounded tool schemas.
- Deliver environment/repository inspection, create-only `forge.yaml`, marketplace search, plan/apply token binding, and status tools.
- Contract-test the CLI with `draigara-forge-plugin` and publish the plugin through `draigara-openapm`.

## Milestone 4: Release

- Test packed and globally installed tarballs on Node.js 22 and 24 across Windows, macOS, and Linux.
- Publish with npm Trusted Publishing and provenance using `latest` and `next` dist-tags.
- Stable release is blocked until production marketplace/plugin locators, APM artifact metadata, and every required structured APM operation are available.
