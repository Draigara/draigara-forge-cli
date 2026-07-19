# Forge CLI npm Implementation Plan

**Status:** Approved implementation plan

## Milestone 0: Architecture and package skeleton

- Record the Node setup, APM 0.26 compatibility adapter, and marketplace adoption boundary in ADR-0013.
- Create strict TypeScript ESM packaging for `@draigara/forge`, Node.js `>=22`, Commander, Clack, Zod, tsdown, and Vitest.
- Preserve Chafa-generated branded wide, compact, and plain terminal profiles as static runtime assets.

## Milestone 1: Safe machine boundaries

- Implement cancellable, time-bounded argument-list process execution with independent bounded stdout/stderr.
- Implement platform paths, atomic Forge state, recovery journals, redaction, and documented harness detection.
- Implement a fake APM executable and structured-contract fixtures.

## Milestone 2: Setup and lifecycle

- Deliver the reconciling `forge setup` workflow, including npm PATH preflight, compatible APM detection, separately authorized APM installation when missing, explicit plans, global Forge installation, marketplace registration, target selection, global plugin install or refresh, and doctor.
- Deliver marketplace and plugin lifecycle commands through the APM adapter.
- Never parse human-oriented APM output or directly modify harness files.

## Milestone 3: MCP and plugin contract

- Expose the internal stdio `forge mcp` command with versioned, bounded tool schemas.
- Deliver environment/repository inspection, create-only `forge.yaml`, marketplace candidates, current-session evaluation binding, confirmed apply, and status tools.
- Contract-test the CLI with `draigara-forge-plugin` and publish the plugin through `draigara-openapm`.

## Milestone 4: Release

- Test packed and globally installed tarballs on Node.js 22 and 24 across Windows, macOS, and Linux.
- Publish with npm Trusted Publishing and provenance using `latest` and `next` dist-tags.
- Preview release requires a tagged Forge plugin, generated OpenAPM artifacts, and compatibility evidence against APM 0.26. Forge-native platform installers are out of scope.
