# Cross-Repository Contracts

## Contract ownership

| Contract | Owner | Consumers |
|---|---|---|
| `forge.yaml` schema | CLI repository | Plugin, Cloud UI, Open marketplace examples |
| Bridge protocol | CLI repository | Plugin adapters, integration tests |
| Plugin behavioural contract | Plugin repository | CLI installer, harness adapters |
| Open marketplace package policy | Open repository | Package maintainers, Cloud authoring validation |
| Cloud API | Cloud repository | Cloud web application, optional future CLI commands |
| Marketplace identity convention | CLI repository, jointly reviewed | Plugin, Open, Cloud |
| Compatibility matrix | Product-wide, mirrored in all repos | Release automation |

## Change rules

1. Every externally consumed contract is versioned.
2. Additive changes are preferred.
3. Consumers ignore unknown optional fields.
4. Required-field changes require a new major protocol or schema version.
5. No repository assumes that another repository is deployed or released simultaneously.
6. Contract fixtures are copied or fetched at pinned versions during CI.
7. Protocol changes include producer and consumer contract tests.
8. Human-readable documentation is never the sole definition of a machine contract; schemas and test fixtures are required.
9. Security-sensitive semantics require an ADR in both the owning and consuming repository when boundaries change.

## Compatibility promise

The plugin declares the minimum and maximum supported Forge MCP contract major version. The CLI returns its supported contract range during environment inspection. If no overlap exists, the plugin stops before analysis or installation and provides a precise upgrade instruction.

The repository configuration schema follows the same principle. A newer reader may accept an older schema and migrate it explicitly. It must never rewrite committed configuration silently.
