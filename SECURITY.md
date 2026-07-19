# Security Policy

## Supported versions

Security fixes are provided for the latest stable release and, when explicitly announced, the immediately preceding minor release. Pre-release builds are supported only for issues that would remain exploitable in the next stable release.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability.

Use GitHub private vulnerability reporting when enabled. Otherwise contact the security address configured by the Draigara maintainers. Include:

- affected version and platform;
- a minimal reproduction;
- expected and observed behaviour;
- impact and preconditions;
- whether credentials, repository content, package metadata, or signing material may have been exposed;
- any suggested mitigation.

Maintainers should acknowledge receipt within three business days, provide an initial assessment within seven business days, and coordinate disclosure.

## Security expectations

- No long-lived credentials in source, examples, tests, logs, crash reports, release artifacts, or documentation.
- Dependencies are pinned or locked and reviewed.
- Release artifacts are built in protected CI and accompanied by checksums and provenance.
- Untrusted repository and marketplace content is never treated as executable merely because it was discovered.
- Authentication failures fail closed.
- Security-sensitive actions require explicit user intent and auditable output.
