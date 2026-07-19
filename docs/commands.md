# Human CLI Command Specification

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Conventions

- Exit code `0` means the requested operation completed.
- Exit code `2` means invalid usage.
- Exit code `3` means environment or prerequisite failure.
- Exit code `4` means authentication or authorisation failure.
- Exit code `5` means external tool failure.
- Exit code `6` means compatibility failure.
- Exit code `7` means cancelled by the user.
- Exit code `8` means integrity or security validation failure.
- Human output goes to stdout; diagnostics and errors go to stderr.
- `--json` is not a substitute for the bridge protocol. Human commands may offer JSON for automation, but only the bridge is a compatibility contract.
- Destructive operations require confirmation unless `--yes` is explicitly provided.
- `--no-interaction` fails rather than inventing an answer.

## `forge setup`

Guided first-run configuration.

Steps:

1. Inspect supported APM installations and versions.
2. Inspect supported harnesses.
3. Offer installation of the Forge plugin into detected harnesses.
4. Offer registration of Draigara Open.
5. Validate credential-store access.
6. Run a shortened doctor check.
7. Print next steps.

It must be repeatable and idempotent.

## `forge doctor`

Checks:

- CLI version and release channel;
- platform/RID;
- Native AOT runtime health;
- user configuration readability and schema;
- credential-store access;
- APM executable discovery and supported version;
- each marketplace's resolvability and authentication status;
- installed harnesses and plugin state;
- repository `forge.yaml` when run inside a repository;
- bridge protocol self-test;
- write permissions for required directories;
- clock skew indicators relevant to token authentication;
- proxy and TLS diagnostics without exposing secrets.

Options:

```text
--repository <path>
--marketplace <id>
--harness <id>
--offline
--verbose
--export <path>
```

The exported report redacts user names, home paths, tokens, repository content, and URL query strings by default.

## Marketplace commands

### `forge marketplace add`

Interactive by default:

```text
forge marketplace add
forge marketplace add --id company-a --source https://...
```

Validation:

- stable ID uses lower-case ASCII letters, digits, and hyphens;
- ID uniqueness;
- recognised source scheme;
- TLS validation;
- source is APM-compatible;
- authentication can complete;
- catalogue can be queried;
- no credential is stored in the configuration document.

Adding a registration does not associate any repository with it.

### `forge marketplace list`

Displays ID, display name, source host, authentication kind, last validation, and status. It never displays tokens.

### `forge marketplace update`

Changes mutable registration details after validating the new source. Changing an ID is implemented as add/migrate/remove and must warn that committed repositories may reference the old ID.

### `forge marketplace remove`

Refuses when the current repository references the ID unless `--force` is used. It cannot scan all repositories on the machine and must say so clearly.

## Plugin commands

### `forge plugin install`

```text
forge plugin install copilot-cli
forge plugin install copilot-cli --channel preview
forge plugin install --all-detected
```

The adapter:

- verifies harness version;
- uses the harness's documented plugin installation mechanism;
- installs a pinned Forge plugin version compatible with the CLI;
- verifies resulting plugin metadata;
- records only Forge management metadata, not harness secrets.

### `forge plugin update`

Computes current/target versions, compatibility, and change summary. It requires confirmation before changing an installed plugin unless explicitly non-interactive with a pinned version.

### `forge plugin remove`

Removes only Forge-owned integration artifacts. It must not remove APM-installed packages, unrelated plugins, shared harness files, or repository configuration.

## `forge completion`

Generates shell completion for PowerShell, Bash, Zsh, and Fish where supported. Completion scripts must not make network calls.
