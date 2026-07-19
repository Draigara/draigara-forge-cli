# Forge MCP Contract v1

ADR-0013 defines the supported agent-facing interface: the local stdio MCP server started by `forge mcp`. It never emits terminal decoration, prompts, or child-process output on the protocol stream.

## Tools

- `forge_environment_inspect`
- `forge_marketplace_list`
- `forge_repository_inspect`
- `forge_repository_initialize`
- `forge_marketplace_candidates`
- `forge_installation_apply`
- `forge_status`

Every tool validates bounded input, resolves an explicit canonical repository root where applicable, and returns versioned structured content. Read-only and destructive MCP annotations are part of the contract. Stable errors use namespaced `FORGE_*` codes.

Candidate retrieval returns opaque IDs scoped to a short-lived in-memory evaluation. Apply accepts only candidate IDs from that evaluation, the same repository, explicit targets, and `confirmed: true`. Forge then asks APM to install the corresponding top-level package locators and verifies that APM produced repository state. Forge does not claim or reproduce APM's transitive plan.

Schemas live under `schemas/mcp/v1`; golden examples live under `fixtures/mcp/v1`. The Forge plugin declares its compatible contract range and contract-tests these fixtures.
