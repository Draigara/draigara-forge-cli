# External Process Execution

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Scope

The CLI invokes external executables only through typed adapters, primarily APM and supported harness CLIs.

## Rules

- Never build a shell command string.
- Use argument-list APIs.
- Resolve executable paths deterministically.
- Avoid inheriting unnecessary environment variables.
- Set working directory explicitly.
- Capture stdout and stderr independently.
- Bound output and duration.
- propagate cancellation;
- classify exit codes and parse only documented structured output.
- redact tokens, credentials, home paths, and sensitive URL components in diagnostics.

## APM adapter

The adapter maps setup, lifecycle, and MCP operations to documented APM commands. The mapping is isolated so APM version changes do not leak through the domain model.

The adapter must:

- detect supported versions;
- prefer native structured output where available;
- fail when only ambiguous human output is available for a safety-critical operation;
- preserve APM's package and dependency semantics;
- expose APM warnings without rewriting their meaning;
- read APM-owned structured state only through the documented versioned compatibility adapter and never modify it directly.

## Test doubles

Provide a fake executable fixture that can:

- emit valid and invalid structured output;
- delay;
- produce large output;
- terminate unexpectedly;
- require interactive authentication;
- change catalogue digest between plan and install;
- simulate partial filesystem changes.

End-to-end tests should use the fake by default and a real pinned APM release in a smaller compatibility suite.
