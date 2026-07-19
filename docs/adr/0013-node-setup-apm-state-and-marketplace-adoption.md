# ADR-0013: Use Node setup, APM-owned state, and explicit marketplace adoption

- **Status:** Accepted
- **Date:** 2026-07-19
- **Decision owners:** Draigara maintainers
- **Repository:** `draigara-forge-cli`
- **Supersedes:** ADR-0006 and ADR-0012

## Context

The Node and npm distribution decision remains correct, but Microsoft APM 0.26 does not expose structured lifecycle plans or JSON for every command. It does expose structured targets and stores marketplace registrations, `apm.yml`, and `apm.lock.yaml` as machine-readable state. Organisations may already have registered marketplaces before adopting Forge.

## Decision

Distribute Forge as `@draigara/forge` for Node.js 22 or later. The canonical machine bootstrap is `npx @draigara/forge setup`; repository onboarding is owned by the globally installed Forge plugin.

APM remains the only package manager. Forge invokes documented APM commands, treats their exit status as the operation result, and verifies effects using APM-owned structured state. For APM 0.26, Forge may strictly parse the documented version line and read the structured marketplace registry through a versioned, read-only compatibility adapter. Forge never parses human lifecycle output or writes APM state directly.

Forge confirms the exact top-level package IDs, marketplace, repository, and target scopes before one APM operation. It does not claim an exact transitive plan and does not issue an integrity token. A session-scoped evaluation identifier prevents a caller from substituting candidates between evaluation and apply.

Marketplace registrations record provenance. Forge-created registrations may be removed through APM after confirmation. An existing exact ID/source mapping may be explicitly adopted; removing an adopted mapping from Forge only stops tracking it and never removes the APM registration. A conflicting ID/source mapping is rejected.

APM installs the global Forge plugin. A narrow harness adapter is allowed only for a documented APM capability gap; v1 uses documented Copilot CLI JSON commands solely to reconcile the Forge MCP registration.

## Consequences

Forge can deliver an honest preview against APM 0.26 without duplicating its resolver or relying on unstable prose. Company marketplaces participate in the same low-friction onboarding flow while retaining ownership. A future APM structured command can replace the compatibility adapter without changing Forge's public MCP contract.

