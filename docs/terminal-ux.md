# Terminal UX and Error Design

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Human experience

Spectre.Console is used to provide a polished but restrained interface:

- a compact Draigara greeting;
- readable status trees;
- spinners only for indeterminate human operations;
- tables for marketplace and plugin inventories;
- prompts with safe defaults;
- no animation when output is redirected;
- honour `NO_COLOR`;
- accessible text labels in addition to colour or symbols.

The CLI must remain usable in screen readers and narrow terminals.

## Interaction rules

- Display the operation before asking for confirmation.
- Never preselect a destructive answer.
- Display marketplace ID and source host when ambiguity matters.
- Do not make users interpret stack traces.
- Provide one primary remediation command.
- Use stable error codes for support and automation.
- `--verbose` adds diagnostics, not secrets.
- `--quiet` suppresses progress, not errors or required confirmations.

## Bridge experience

The bridge has no visual UX. Progress is represented by structured events:

```json
{"type":"phase.started","name":"apm.plan"}
{"type":"message","level":"info","code":"APM_QUERYING_CATALOG"}
{"type":"phase.completed","name":"apm.plan","durationMs":321}
{"type":"result","payload":{}}
```

Consumers must be able to ignore unknown event types.

## Error catalogue

Maintain `docs/error-catalogue.md` with:

- code;
- meaning;
- likely causes;
- safety implications;
- remediation;
- whether retry is safe;
- whether support export is useful.

Error messages are part of the product contract and require tests.
