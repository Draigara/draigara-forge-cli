# CLI Implementation Plan

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Milestone 0: Contract foundations

Deliver:

- solution scaffolding;
- Native AOT hello-world build for all target RIDs;
- command skeleton;
- bridge v1 envelope and schema;
- error catalogue;
- filesystem/process abstractions;
- CI smoke builds.

Exit criteria:

- a published Native AOT test binary runs on all target platforms;
- protocol fixtures validate;
- no production dependency blocks trimming/AOT.

## Milestone 1: Configuration and diagnostics

Deliver:

- platform configuration paths;
- `forge.yaml` parser/schema/writer;
- marketplace registry persistence;
- `forge version`;
- initial `forge doctor`;
- structured environment inspection.

Exit criteria:

- invalid configurations produce stable errors;
- writes are atomic;
- support bundle is redacted;
- protocol compatibility negotiation works.

## Milestone 2: Marketplace registration

Deliver:

- add/list/update/remove;
- credential abstraction;
- source validation;
- catalogue query through a fake then real APM adapter;
- proxy and enterprise TLS diagnostics.

Exit criteria:

- three marketplaces can coexist;
- repository selection is resolved exactly;
- missing IDs never fall back silently.

## Milestone 3: Repository analyser

Deliver bounded file inventory, manifest parsers, documentation candidate discovery, CI/provider signals, safe ignore and symlink handling.

Exit criteria:

- fixture corpus passes;
- no execution occurs;
- performance target is met;
- output is deterministic and schema-validated.

## Milestone 4: APM planning and installation

Deliver:

- installed-state query;
- plan;
- plan token;
- install;
- cancellation and progress;
- plan-staleness checks.

Exit criteria:

- selected top-level package set cannot change after approval;
- transitive details remain APM-reported;
- stale plans fail safely.

## Milestone 5: Copilot plugin management

Deliver adapter detection, compatibility, installation, update, removal, verification, and rollback.

Exit criteria:

- no unrelated plugin files are touched;
- a released plugin can be installed and invoked;
- compatibility errors are actionable.

## Milestone 6: Production release

Deliver signing, notarisation, checksums, SBOM, provenance, updater/channel metadata, release documentation, and security review.

## Deferred

- additional harness adapters;
- remote telemetry;
- package-manager distribution channels;
- enterprise machine policy;
- incremental analysis cache;
- cloud login commands.
