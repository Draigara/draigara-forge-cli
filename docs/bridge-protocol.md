# Bridge Protocol v1

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Purpose

The bridge is a process-based API between an AI coding harness plugin and the native CLI. It constrains the operations an AI can request and gives the CLI an opportunity to validate every action.

## Invocation

```text
forge bridge v1 <resource> <operation> [options]
```

Requests that require structured input read one UTF-8 JSON object from stdin. Responses use either:

- one JSON document for short queries; or
- JSON Lines for operations that emit progress events.

No ANSI, banners, prompts, localisation, or terminal cursor control is allowed.

## Envelope

```json
{
  "protocolVersion": "1.0",
  "requestId": "uuid",
  "ok": true,
  "result": {},
  "warnings": [],
  "error": null
}
```

Errors:

```json
{
  "protocolVersion": "1.0",
  "requestId": "uuid",
  "ok": false,
  "result": null,
  "warnings": [],
  "error": {
    "code": "FORGE_MARKETPLACE_NOT_REGISTERED",
    "message": "Marketplace 'company-a' is not registered on this machine.",
    "remediation": {
      "command": "forge marketplace add --id company-a",
      "documentation": "marketplaces/register"
    },
    "details": {}
  }
}
```

## Protocol negotiation

`environment inspect` returns:

```json
{
  "cliVersion": "0.1.0",
  "supportedBridge": {
    "minimum": "1.0",
    "maximum": "1.0"
  },
  "apm": {
    "available": true,
    "version": "..."
  },
  "harnesses": []
}
```

The plugin stops if major versions do not overlap.

## Operations

### `environment inspect`

Read-only. Reports capabilities and prerequisite status.

### `marketplace list`

Read-only. Returns registrations with IDs, display names, authentication kinds, and health. Sensitive fields are omitted.

### `marketplace catalog`

Read-only. Accepts:

```json
{
  "repositoryRoot": "/absolute/path",
  "marketplaceId": "company-a",
  "query": {
    "text": "aspire observability",
    "limit": 50,
    "cursor": null
  }
}
```

The CLI validates that `marketplaceId` equals the repository's committed selection when a repository is supplied. It delegates search/catalogue retrieval to APM-supported interfaces and normalises only transport fields. It does not infer categories or inspect dependency composition.

Each returned package includes stable identity, version/catalogue metadata, title, summary, tags if supplied, source provenance, and an opaque APM locator. Descriptions are labelled untrusted.

### `repository analyze`

Read-only. Returns bounded deterministic evidence. It never runs repository build scripts, package-manager lifecycle hooks, or arbitrary executables.

### `repository initialise`

Mutating and create-only. Accepts the canonical repository root and one marketplace ID that must exist in the machine registry. It:

- verifies no `forge.yaml` exists;
- validates the repository root and write boundary;
- writes exactly the schema-v1 minimal document atomically;
- returns the resulting file digest and structured content;
- refuses overwrite, merge, or inferred additions.

The plugin must already have displayed and confirmed the user's marketplace selection. A future marketplace-change operation requires a separate product decision and is not implied by init.

### `apm installed`

Read-only. Delegates to APM and returns installed top-level state sufficient to avoid duplicate recommendations. It must not invent state by scanning generated harness files.

### `apm plan`

Creates an installation plan from explicit selected opaque package locators. It invokes APM's dry-run or equivalent supported plan mechanism. It returns:

- exact selected top-level packages;
- APM-reported transitive actions without Forge interpretation;
- files APM reports it will modify;
- warnings;
- catalogue or manifest digest;
- expiry;
- a signed or MAC-protected plan token.

### `apm install`

Accepts only the plan token and an explicit confirmation value. The token binds:

- repository canonical path and identity;
- marketplace registration ID;
- selected top-level package locators;
- APM plan digest;
- catalogue/manifest state;
- issuing CLI version and protocol;
- short expiry.

If anything changed, installation fails and requires a new plan. This prevents an AI caller from silently changing the selected package set between display and execution.

## Limits

Default limits should be configurable only through trusted machine policy:

- request body: 1 MiB;
- catalogue page: 100 entries;
- individual metadata field: 64 KiB;
- repository evidence: 5 MiB structured output;
- operation duration: 2 minutes for queries, 15 minutes for installation;
- process output capture: bounded with spill-to-redacted diagnostic file if necessary.

## Cancellation

The bridge observes process cancellation signals, cancels child operations, emits a final cancellation event when possible, and exits with the documented code.
