# Testing strategy

Vitest covers pure planning, validation, state, process execution, APM invocation shapes, terminal profiles, and MCP contracts. Acceptance tests execute the bundled CLI, a fake APM process, and the packed npm tarball rather than importing implementation-only helpers.

The build matrix uses Node.js 22 and 24 on Windows, macOS, and Linux. Claimed harnesses require integration tests for their documented plugin mechanism. The supported APM version requires compatibility tests against the real executable in addition to fake fixtures.

Security-focused cases include hostile arguments, independent large streams, timeout/cancellation, oversized JSON, schema drift, corrupt/future state, lock contention, recovery journals, path traversal, tampered plan tokens, redirected terminals, and credential redaction.
