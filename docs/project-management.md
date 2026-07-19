# CLI Project Management

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Suggested labels

- `area/bridge`
- `area/config`
- `area/marketplace`
- `area/apm`
- `area/analyzer`
- `area/harness`
- `area/packaging`
- `area/security`
- `platform/windows`
- `platform/macos`
- `platform/linux`
- `contract-change`
- `adr-required`
- `good-first-issue`
- `blocked-upstream`

## Issue template requirements

Every implementation issue states:

- user or integration outcome;
- in-scope and out-of-scope;
- affected command/protocol/schema;
- security implications;
- platforms;
- acceptance tests;
- documentation changes;
- compatibility impact.

## Release readiness

A release candidate requires:

- green matrix;
- Native AOT smoke tests;
- protocol fixture compatibility;
- signature verification;
- SBOM and provenance;
- no unresolved high-severity dependency findings;
- upgrade/rollback test;
- plugin compatibility confirmation.
