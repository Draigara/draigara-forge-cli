# Draigara Forge CLI

The Forge CLI is the machine-scoped native executable for Draigara Forge. It onboards a developer workstation by coordinating Microsoft APM marketplace registration and global Forge plugin installation through APM's documented structured protocols.

It is not a package manager and does not replace Microsoft APM.

## Responsibilities

- register, list, update, and remove APM marketplace connections;
- install, update, inspect, and remove the Forge plugin through APM-supported coding-host targets;
- detect and validate a compatible APM installation;
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
- System.CommandLine for parsing and invocation
- Spectre.Console behind `IInteractionService` for human presentation only
- xUnit for tests
- Verify or equivalent snapshot testing for stable terminal and protocol output
- GitHub Actions for build, test, packaging, signing, provenance, and release

## Initial commands

```text
forge init
forge doctor
forge --version

forge marketplace add
forge marketplace list
forge marketplace update
forge marketplace remove

forge plugin install
forge plugin list
forge plugin update
forge plugin remove

```

The v1 public surface is human-readable. The bridge, repository inspection, completion, and self-update are deferred rather than exposed as unversioned automation APIs.

## Install a release archive

Download the archive for your runtime identifier, extract the single `forge` executable (`forge.exe` on Windows) into a per-user executable directory, and explicitly add that directory to `PATH`. For example, use `%LOCALAPPDATA%\Programs\Draigara\Forge\bin` on Windows, `~/.local/bin` on Linux, or `~/Library/Application Support/Draigara/Forge/bin` on macOS. Forge is a standalone native executable, not a .NET tool.

## Start here

Coding agents should read:

1. [`AGENTS.md`](./AGENTS.md)
2. [`docs/architecture.md`](./docs/architecture.md)
3. [`docs/bridge-protocol.md`](./docs/bridge-protocol.md)
4. [`docs/implementation-plan.md`](./docs/implementation-plan.md)
5. all Accepted ADRs in [`docs/adr`](./docs/adr)
