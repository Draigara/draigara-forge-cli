# Forge MCP Contract v1

ADR-0012 supersedes the earlier process bridge. The supported agent-facing interface is the local stdio server started by `forge mcp`; it never emits terminal decoration, prompts, or child-process output on the protocol stream.

## Tools

- `forge_environment_inspect`
- `forge_repository_inspect`
- `forge_repository_initialize`
- `forge_marketplace_search`
- `forge_installation_plan`
- `forge_installation_apply`
- `forge_status`

Every tool validates bounded input, resolves an explicit canonical repository root where applicable, and returns versioned structured content. Read-only and destructive MCP annotations are part of the contract. Stable errors use namespaced `FORGE_*` codes.

Installation plans return short-lived integrity-protected tokens binding repository, marketplace, selected opaque package locators, APM state, Git state, and expiry. Apply refuses modified, stale, or expired plans.

Schemas live under `schemas/mcp/v1`; golden examples live under `fixtures/mcp/v1`. The Forge plugin declares its compatible contract range and contract-tests these fixtures.
