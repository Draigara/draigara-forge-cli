# CLI Security Model

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Assets

- marketplace credentials;
- source and package metadata;
- repository paths and deterministic evidence;
- plugin release artifacts;
- APM installation plan;
- signing identities and update metadata;
- developer trust in displayed actions.

## Primary threats

- repository symlink or path traversal attacks;
- prompt-controlled plugin requests invoking unintended commands;
- stale or substituted installation plans;
- marketplace package spoofing;
- credential leakage through process arguments or logs;
- malicious child-process output;
- plugin update supply-chain compromise;
- untrusted certificate bypass;
- binary replacement on PATH;
- race conditions between plan and install.

## Controls

### Operation allow-list

The bridge exposes only named operations with schemas. It never accepts an arbitrary executable or raw command line.

### Repository binding

Mutating operations bind to a canonical repository root and validate that the active `forge.yaml` selects the supplied marketplace.

### Plan integrity

The plan token binds the approved package selection and APM-reported plan. Installation cannot add a package that was not in the approved plan.

### Executable trust

Record the resolved APM executable path and version during planning; validate again during install. Enterprise policy may require approved locations or signatures.

### Secret handling

- device-code or delegated authentication;
- OS credential store;
- no secrets in JSON responses;
- structured redaction;
- avoid command-line token arguments;
- zero or dispose sensitive buffers where feasible.

### Update integrity

The updater verifies release manifest signature, artifact digest, expected product identity, and channel. It never trusts an unauthenticated version endpoint.

## Security tests

- path traversal and symlink escape;
- TOCTOU plan changes;
- malformed JSON and schema fuzzing;
- hostile process output;
- credential redaction snapshots;
- package identity confusables;
- untrusted root certificate scenarios;
- interrupted update recovery;
- Windows quoting and PowerShell edge cases;
- macOS quarantine/notarisation verification;
- Linux executable replacement.
