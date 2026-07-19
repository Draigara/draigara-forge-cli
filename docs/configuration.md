# Configuration and `forge.yaml`

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Two configuration scopes

### Machine configuration

Machine configuration registers marketplaces and plugin preferences. It is user-specific and not committed.

Logical locations:

- Windows: `%LOCALAPPDATA%\Draigara\Forge`
- macOS: `~/Library/Application Support/Draigara/Forge`
- Linux: `${XDG_CONFIG_HOME:-~/.config}/draigara/forge`

The implementation should use platform APIs rather than manually concatenating paths.

### Repository configuration

`forge.yaml` is committed at the repository root:

```yaml
schemaVersion: 1
marketplace:
  id: company-a
```

The file has one responsibility: associate the repository with a registered marketplace identity.

## Discovery

Repository root discovery proceeds upward from the working directory:

1. explicit `--repository` path, if supplied;
2. nearest `forge.yaml`;
3. nearest source-control root;
4. fail with a clear instruction if ambiguity remains.

A nested `forge.yaml` defines a separate Forge repository scope. The CLI must report the resolved root.

## Schema version 1

Required:

- `schemaVersion`: integer, exactly `1`;
- `marketplace.id`: non-empty stable identifier.

Unknown properties are rejected in version 1 to prevent misspellings from being silently ignored. Future schema versions may introduce an `extensions` object.

## Writing

The CLI library used by the plugin must:

- refuse to overwrite an existing valid file during init;
- identify and explain invalid existing content;
- preserve UTF-8 and LF;
- write atomically through a temporary file and rename;
- avoid comments that imply inferred state;
- never add package lists or repository analysis.

## Marketplace resolution

The ID in `forge.yaml` is resolved against machine registrations. A missing registration is not an excuse to substitute Draigara Open or another marketplace. The user must explicitly register or repair the referenced marketplace.

## Schema artifacts

Publish:

- `schemas/forge.schema.v1.json`;
- valid and invalid fixture files;
- a canonical minimal example;
- migration guidance for every future version.

The schema is a release artifact and must follow semantic versioning independent of the CLI binary.
