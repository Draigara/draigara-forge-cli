# Draigara Forge CLI

The Forge CLI is the machine-scoped native executable for Draigara Forge. It installs and maintains the Forge integration on a developer workstation, registers multiple APM marketplaces, manages harness plugin installation, performs diagnostics, and exposes a versioned deterministic bridge used by the Forge plugin.

It is not a package manager and does not replace Microsoft APM.

## Responsibilities

- register, list, update, and remove APM marketplace connections;
- install, update, inspect, and remove Forge plugins for supported AI coding harnesses;
- detect APM and harness installations;
- validate credentials without persisting secrets in repository files;
- provide repository-safe deterministic analysis;
- expose structured marketplace catalogue and APM-plan operations to plugins;
- publish a stable, versioned process protocol;
- provide actionable diagnostics;
- distribute signed, self-contained native binaries.

## Non-responsibilities

The CLI does not:

- rank or recommend packages;
- call an AI model;
- own the interactive recommendation conversation;
- resolve package dependencies;
- compile or deploy APM packages;
- persist an inferred repository profile;
- understand the downstream contents of a marketplace package;
- require Draigara Cloud for local operation.

## Technology baseline

- .NET 10 LTS
- C#
- Spectre.Console for human-facing terminal UX
- Native AOT self-contained publishing
- source-generated `System.Text.Json`
- `System.CommandLine` only if a documented gap in Spectre.Console.Cli justifies it; do not use both casually
- xUnit for tests
- Verify or equivalent snapshot testing for stable terminal and protocol output
- GitHub Actions for build, test, packaging, signing, provenance, and release

## Initial commands

```text
forge setup
forge doctor
forge version

forge marketplace add
forge marketplace list
forge marketplace update
forge marketplace remove

forge plugin install
forge plugin list
forge plugin update
forge plugin remove

forge completion
```

The plugin uses a hidden but supported structured interface:

```text
forge bridge v1 environment inspect
forge bridge v1 marketplace list
forge bridge v1 marketplace catalog
forge bridge v1 repository analyze
forge bridge v1 repository initialise
forge bridge v1 apm installed
forge bridge v1 apm plan
forge bridge v1 apm install
```

Human commands render text. Bridge commands render versioned JSON or JSON Lines and never include decorations, progress bars, ANSI sequences, or localisation.

## Start here

Coding agents should read:

1. [`AGENTS.md`](./AGENTS.md)
2. [`docs/architecture.md`](./docs/architecture.md)
3. [`docs/bridge-protocol.md`](./docs/bridge-protocol.md)
4. [`docs/implementation-plan.md`](./docs/implementation-plan.md)
5. all Accepted ADRs in [`docs/adr`](./docs/adr)
