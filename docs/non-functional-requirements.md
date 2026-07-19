# CLI Non-Functional Requirements

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Performance

- `forge version`: p95 below 100 ms after OS process startup on a representative modern machine.
- `forge marketplace list`: p95 below 250 ms without network health checks.
- bounded repository inventory of 100,000 non-ignored files: p95 below 3 seconds on a local SSD.
- idle memory below 80 MiB for ordinary commands; repository analysis below 250 MiB for the defined fixture.
- progress begins within 500 ms for network or child-process work.

## Reliability

- configuration writes are atomic;
- marketplace registry corruption preserves a recoverable backup;
- cancellation leaves no known partial Forge-owned state;
- plugin install/update has verification and rollback;
- repeated operations are idempotent;
- child-process hangs are bounded;
- plan/install integrity is fail-closed.

## Portability

Support documented versions of:

- Windows 11 and supported Windows Server developer environments;
- current and previous major macOS releases on Intel/Apple Silicon where runners permit;
- mainstream glibc Linux x64/arm64 distributions.

Musl support is not implied until a distinct RID is tested.

## Accessibility

- no colour-only meaning;
- `NO_COLOR`;
- screen-reader-friendly text mode;
- redirected output contains no cursor control;
- prompts have explicit labels and alternatives.

## Maintainability

- warnings as errors;
- nullable enabled;
- central package management;
- architecture dependency tests;
- source-generated JSON;
- no unreviewed reflection suppressions;
- public protocol changes require fixtures and ADR review.

## Security

- release signing/provenance;
- no plaintext secrets;
- no arbitrary bridge execution;
- bounded input/output;
- symlink/path containment;
- short-lived plan tokens;
- least-privilege process environment;
- private vulnerability process.

## Privacy

No remote telemetry in the initial release. Diagnostic exports are previewable and redacted by default.

## Operability

Stable error codes, actionable doctor output, structured logs, compatibility matrix, and deterministic support bundles.
