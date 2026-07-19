# Architecture Decision Records

Accepted ADRs are binding constraints for implementation. Proposed ADRs require explicit approval. Superseded ADRs remain for history.

- [ADR-0001: Use .NET 10, Spectre.Console, and Native AOT](./0001-dotnet-native-aot.md) — **Superseded by ADR-0012**
- [ADR-0002: Expose a versioned process bridge](./0002-bridge-protocol.md) — **Superseded by ADR-0012**
- [ADR-0003: Keep committed repository configuration minimal](./0003-minimal-forge-yaml.md) — **Accepted**
- [ADR-0004: Separate machine marketplace registrations from repository selection](./0004-marketplace-registry.md) — **Accepted**
- [ADR-0005: Delegate package management completely to APM](./0005-apm-delegation.md) — **Accepted**
- [ADR-0006: Bind approved selection to installation with a plan token](./0006-plan-token.md) — **Superseded by ADR-0013**
- [ADR-0007: Repository analysis is deterministic and non-executing](./0007-safe-analysis.md) — **Accepted**
- [ADR-0008: Use delegated authentication and OS credential stores](./0008-credential-storage.md) — **Accepted**
- [ADR-0009: Use explicit harness adapters](./0009-harness-adapters.md) — **Superseded by ADR-0011**
- [ADR-0010: Sign, attest, and verify CLI releases](./0010-release-integrity.md) — **Superseded by ADR-0012**
- [ADR-0011: Scope Forge v1 as an APM wrapper](./0011-apm-wrapper-v1.md) — **Partially superseded by ADR-0012**
- [ADR-0012: Distribute Forge through npm and expose a stdio MCP server](./0012-node-npm-cli-and-mcp.md) — **Superseded by ADR-0013**
- [ADR-0013: Use Node setup, APM-owned state, and explicit marketplace adoption](./0013-node-setup-apm-state-and-marketplace-adoption.md) — **Accepted**
