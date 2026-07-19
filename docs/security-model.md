# CLI Security Model

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Assets

- marketplace credentials;
- source and package metadata;
- repository paths and deterministic evidence;
- plugin release artifacts;
- APM-owned installation state;
- npm package provenance and release metadata;
- developer trust in displayed actions.

## Primary threats

- repository symlink or path traversal attacks;
- prompt-controlled plugin requests invoking unintended commands;
- stale or substituted candidate selections;
- marketplace package spoofing;
- credential leakage through process arguments or logs;
- malicious child-process output;
- plugin update supply-chain compromise;
- untrusted certificate bypass;
- executable replacement on PATH;
- race conditions between evaluation and install.

## Controls

### Operation allow-list

The MCP server exposes only named operations with schemas. It never accepts an arbitrary executable or raw command line.

### Repository binding

Mutating operations bind to a canonical repository root and validate that the active `forge.yaml` selects the supplied marketplace.

### Selection integrity

Opaque candidate IDs are valid only for the current in-memory evaluation, repository, and expiry window. Installation accepts only the explicitly confirmed top-level selection. APM remains authoritative for dependency resolution.

### Executable trust

Record the resolved APM executable path and version during planning; validate again during install. Enterprise policy may require approved locations or signatures.

### Secret handling

- device-code or delegated authentication;
- OS credential store;
- no secrets in JSON responses;
- structured redaction;
- avoid command-line token arguments;
- zero or dispose sensitive buffers where feasible.

### Distribution integrity

Forge uses npm Trusted Publishing and provenance for releases. The CLI has no self-updater and does not download or execute native installers.

## Security tests

- path traversal and symlink escape;
- expired and cross-repository evaluation IDs;
- malformed JSON and schema fuzzing;
- hostile process output;
- credential redaction snapshots;
- package identity confusables;
- untrusted root certificate scenarios;
- interrupted npm/APM operations and recovery;
- Windows quoting and PowerShell edge cases;
- executable replacement and PATH confusion.
