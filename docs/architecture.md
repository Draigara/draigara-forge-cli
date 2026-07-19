# CLI Architecture

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Architectural role

The CLI is the trusted deterministic boundary between an AI-driven plugin and the developer workstation. It converts potentially ambiguous model intentions into explicit, validated, auditable operations.

The plugin must not shell out to arbitrary commands constructed by the model. It calls a small, versioned bridge. The bridge validates repository identity, marketplace identity, package selection, and plan integrity before invoking APM.

## Logical components

```text
Human CLI surface
  ├─ setup and diagnostics
  ├─ marketplace registration
  ├─ plugin lifecycle
  └─ update/completion/version
             │
             ▼
Application services
  ├─ configuration service
  ├─ credential service
  ├─ environment discovery
  ├─ harness adapter registry
  ├─ marketplace registry
  ├─ repository analyzer
  └─ APM process adapter
             │
             ▼
Versioned bridge surface
  ├─ request validation
  ├─ protocol negotiation
  ├─ structured event stream
  ├─ plan-token issuance
  └─ operation audit summary
             │
             ▼
Operating-system boundary
  ├─ filesystem
  ├─ credential store
  ├─ process execution
  ├─ network
  └─ installed APM/harness executables
```

## Suggested solution structure

```text
src/
  Draigara.Forge.Cli/
  Draigara.Forge.Application/
  Draigara.Forge.Domain/
  Draigara.Forge.Infrastructure/
  Draigara.Forge.Protocol/
  Draigara.Forge.RepositoryAnalysis/
  Draigara.Forge.Harnesses.Abstractions/
  Draigara.Forge.Harnesses.Copilot/
tests/
  Draigara.Forge.UnitTests/
  Draigara.Forge.Protocol.Tests/
  Draigara.Forge.IntegrationTests/
  Draigara.Forge.NativeAot.Tests/
  Draigara.Forge.EndToEndTests/
schemas/
fixtures/
eng/
packaging/
```

Keep Domain and Protocol free from Spectre.Console, process, filesystem, and networking dependencies.

## Dependency direction

- CLI presentation depends on Application.
- Application depends on Domain and abstractions.
- Infrastructure implements abstractions.
- Protocol defines transport DTOs and source-generated serialization.
- RepositoryAnalysis produces facts only.
- Harness adapters implement installation and discovery contracts.
- No infrastructure layer may depend on the human presentation layer.

## Trust boundaries

1. **User input:** command arguments and confirmations.
2. **Repository:** paths, filenames, manifests, documentation, symlinks, and content.
3. **Marketplace:** metadata, URLs, package descriptions, and authentication challenges.
4. **APM executable:** external child process whose version and output must be validated.
5. **Harness installation:** external product state changed only through supported mechanisms.
6. **Plugin:** an AI-controlled caller that may produce malformed, stale, or manipulated requests.

Every boundary receives validation, timeouts, size limits, and safe error handling.

## State

Machine-scoped state belongs in platform-appropriate user configuration and credential stores.

Suggested logical model:

```json
{
  "schemaVersion": 1,
  "marketplaces": {
    "company-a": {
      "displayName": "Company A",
      "source": "https://example.invalid/apm",
      "sourceType": "apm-marketplace",
      "authentication": {
        "kind": "delegated"
      }
    }
  },
  "plugins": {
    "copilot-cli": {
      "channel": "stable"
    }
  }
}
```

Do not store tokens, repository selections, inferred profiles, or APM lock state here.

## Failure philosophy

- Fail closed for authentication, schema mismatch, path escape, protocol incompatibility, plan-token mismatch, or unknown APM state.
- Degrade gracefully when optional tools or harnesses are absent.
- Provide a deterministic remediation command.
- Never convert a failed installation into a successful exit merely because partial files were written.
