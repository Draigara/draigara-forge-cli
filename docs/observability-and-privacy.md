# CLI Observability and Privacy

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Local logging

Default logs contain:

- operation and phase;
- product versions;
- error codes;
- durations;
- counts and sizes;
- redacted executable/source hosts;
- correlation/request ID.

They do not contain:

- file bodies;
- repository names unless explicitly included in an exported support bundle;
- usernames or full home paths;
- marketplace tokens;
- package contents;
- command environment dumps;
- model prompts, because the CLI does not call a model.

## Telemetry

Initial releases should default to no remote telemetry. If telemetry is introduced:

- explicit documentation and settings;
- data minimisation;
- no repository content;
- no package selection tied to an identifiable person without enterprise agreement;
- regional and enterprise controls;
- transparent event schema;
- easy opt-out;
- separate consent for crash uploads.

## Support bundle

`forge doctor --export` creates an archive only after showing its content categories. It should include:

- redacted configuration;
- version inventory;
- health checks;
- recent structured logs;
- schema validation errors;
- plugin manifests;
- no credentials or repository documents.

A `--review` mode should stage the bundle as a directory before compression.
