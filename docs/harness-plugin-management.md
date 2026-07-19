# Harness Plugin Management

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Adapter model

Each harness adapter implements:

```text
Detect
GetVersion
CheckCompatibility
ListForgeInstallations
PlanInstall
Install
PlanUpdate
Update
PlanRemove
Remove
Verify
```

GitHub Copilot CLI is the first production adapter. Other adapters are not considered supported until they have a documented installation mechanism and end-to-end tests.

## Installation requirements

- Pin a concrete plugin release.
- Verify downloaded artifact digest and provenance.
- Use the harness's documented plugin installation or package mechanism.
- Preserve unrelated plugins and user configuration.
- Record enough Forge-owned metadata to update or remove safely.
- Verify that commands, agents, skills, and scripts are visible after installation.
- Report whether a harness restart is required.

## Compatibility

The adapter checks:

- harness minimum version;
- supported plugin manifest version;
- Forge plugin version;
- Forge MCP contract range;
- operating system and shell requirements.

A compatible CLI may manage several plugin versions if harnesses differ, but automatic downgrade requires explicit approval.

## Atomicity and recovery

Where the harness supports transactional installation, use it. Otherwise:

1. stage to a temporary directory;
2. validate manifest and checksums;
3. back up only Forge-owned prior files;
4. perform atomic rename where possible;
5. verify;
6. restore on failure;
7. retain a redacted recovery log.

## Supply chain

Release metadata must identify:

- plugin version;
- source commit;
- artifact digest;
- compatible CLI/protocol ranges;
- signature or provenance record;
- release channel.

Never install an unsigned development build unless the user explicitly selects a local development source.
