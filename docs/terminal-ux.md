# Terminal UX and Error Design

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Brand and presentation modes

`DRAIGARA` is the brand and `FORGE` is the product. Interactive top-level help and initialization use one of two decorative variants:

- **Wide** (80 columns or more): the dragon-D, `DRAIGARA` wordmark, subordinate `FORGE`, version, and channel.
- **Compact** (under 80 columns): the dragon-D with the text `Draigara Forge`.

Draig, the dragon mascot, appears only for a first-run welcome and successful initialization. It is not used for errors, diagnostics, or destructive confirmations. Routine subcommands do not repeat the wide banner.

Redirected output, non-interactive mode, `NO_COLOR`, and `--no-color` always select **plain** mode: one text line with no ANSI sequences, cursor operations, or prompt. Plain output remains meaningful without decorative glyphs.

## Human experience

Spectre.Console is used to provide a polished but restrained interface:

- readable status trees;
- spinners only for indeterminate human operations;
- tables for marketplace and plugin inventories;
- prompts with safe defaults;
- no animation when output is redirected;
- honour `NO_COLOR`;
- accessible text labels in addition to colour or symbols.

The CLI must remain usable in screen readers and narrow terminals. Every state and result has a text label; color and artwork never carry meaning alone. Decorative artwork has an equivalent `Draigara Forge` screen-reader label, and wide artwork must not wrap in a narrow terminal.

## Interaction boundary

System.CommandLine exclusively owns parsing, validation, command composition, and invocation. Spectre.Console owns interactive human rendering and prompts, but is reachable only through `IInteractionService`; commands never call Spectre.Console directly. Future bridge or structured output must bypass decorative rendering entirely.

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
