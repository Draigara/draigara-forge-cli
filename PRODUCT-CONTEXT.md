# Draigara Forge Product Context

## Purpose

Draigara Forge reduces the cognitive load of finding and adopting the right organisational AI engineering assets for a repository.

Microsoft Agent Package Manager (APM) already owns package management. It provides package manifests, marketplaces, dependency resolution, installation, lock state, compilation and deployment into supported AI coding harnesses. Forge does not replace, wrap conceptually, or reimplement those responsibilities.

Forge adds the missing repository-aware recommendation experience:

1. A developer installs the Forge CLI globally.
2. The CLI registers one or more APM marketplaces and installs the Forge plugin into an AI coding harness.
3. A repository is associated with one committed marketplace through `forge.yaml`.
4. Inside the harness, the developer runs `/forge init` or `/forge evaluate`.
5. The plugin gathers deterministic repository evidence and relevant human-authored context.
6. The plugin searches the configured marketplace and recommends real top-level APM packages.
7. The developer chooses which recommendations to install.
8. Forge presents the exact plan and asks for confirmation.
9. APM performs package resolution and installation.

The product deliberately preserves human control. Evaluation is advisory. Forge never silently installs, removes, upgrades, or replaces packages.

## Product principles

### APM remains authoritative

Forge treats APM as the authoritative package-management subsystem. Forge must not maintain a parallel dependency graph, package lock file, version resolver, package compiler, deployment model, policy engine, or marketplace format.

### The marketplace defines downstream composition

A marketplace package may depend on public or private packages for .NET, Aspire, selected Awesome Copilot assets, Superpowers, SpecKit, Squad, engineering standards, GitHub, GitLab, Bitbucket, Azure DevOps, Jira, Linear, Trello, Azure Boards, and company-specific requirements.

Forge does not need to know, interpret, flatten, or expose that downstream composition. It recommends a marketplace entry. APM resolves the package's dependencies.

### Repository context is recomputed

The machine-inferred repository profile is ephemeral. Repositories change: GraphQL may be introduced, Cosmos DB may be replaced with PostgreSQL, a delivery platform may change, or an ADR may set a future direction. `/forge evaluate` therefore analyses the current repository every time.

Only durable human decisions belong in `forge.yaml`.

### Git is canonical

Repository configuration, organisation package sources, documentation, and company-specific packages should remain reviewable in Git. Cloud services may improve authoring, governance, discovery, analytics, and workflow, but they must not become a hidden canonical store for repository engineering knowledge.

### Local-first, cloud-optional

The CLI, plugin, APM, a Git repository, and a reachable marketplace are sufficient for the core workflow. Draigara Cloud is an optional enterprise control plane, not a runtime prerequisite for evaluation or installation.

### Interactive by default

The recommended experience is a harness-native interactive selector. Where a harness cannot render one, Forge must fall back to a numbered selection protocol without changing semantics.

### Evidence before inference

Forge first gathers deterministic evidence. The model then interprets that evidence and repository documentation. Recommendations must be grounded in actual marketplace metadata and traceable to evidence.

### Secure by design

Repository content and marketplace metadata are untrusted input. The plugin must resist prompt injection, avoid executing repository scripts during analysis, minimise data sent to model providers, and require explicit approval before changes.

## The four repositories

| Repository | Primary responsibility |
|---|---|
| `draigara-forge-cli` | Machine-scoped installation, marketplace registration, harness plugin lifecycle, diagnostics, and the deterministic `forge mcp` server used by plugins. |
| `draigara-forge-plugin` | Repository-scoped analysis, reasoning, recommendation, interactive selection, planning, confirmation, and APM orchestration inside AI coding harnesses. |
| `draigara-openapm` | The public, APM-native Draigara OpenAPM Community marketplace and its curated package catalogue, package policies, validation, provenance, and release automation. |
| `draigara-cloud` | Optional multi-tenant enterprise control plane for private marketplace authoring, governance, connectors, workflows, analytics, and administration. |

## Canonical repository configuration

The initial schema is intentionally minimal:

```yaml
schemaVersion: 1
marketplace:
  id: company-a
```

The selected marketplace is committed because it describes the organisational knowledge ecosystem to which the repository belongs. It is not a developer-local preference.

The following do not belong in `forge.yaml`:

- inferred languages, frameworks, architecture, or repository type;
- installed APM packages or dependency state;
- package lock information;
- model-generated summaries;
- mutable marketplace catalogues;
- developer credentials;
- cloud access tokens.

## Core workflows

### First use in a repository

```text
/forge init
  -> verify CLI and APM availability
  -> discover globally registered marketplaces
  -> ask the developer to choose one
  -> write and validate forge.yaml
  -> run the same evaluation pipeline used by /forge evaluate
  -> show selectable recommendations
  -> prepare an APM plan
  -> ask for final confirmation
  -> invoke APM
```

### Re-evaluation

```text
/forge evaluate
  -> read committed forge.yaml
  -> resolve the marketplace registration
  -> analyse current repository state
  -> inspect relevant documentation
  -> ask a concise intent question when useful
  -> retrieve real package candidates
  -> rank and explain candidates
  -> let the developer select a subset
  -> show the exact APM plan
  -> ask for confirmation
  -> invoke APM
```

### Repository evolution

A later evaluation may recommend newly relevant packages. It may also flag an already-installed package as potentially obsolete. Removal is always a separate, explicit review action; it is never inferred as permission to uninstall.

## Non-goals

Forge is not:

- a replacement for APM;
- a universal package manager;
- a new AI asset format;
- a package dependency resolver;
- a hidden SaaS-only recommendation service;
- an autonomous repository modification bot;
- an organisation policy enforcement engine;
- a source-control or work-management abstraction layer;
- a generic RAG product;
- an IDE or coding harness.

## Definition of success

A developer can enter an unfamiliar repository and ask Forge to evaluate it without knowing:

- the names of available packages;
- the structure of the marketplace;
- the organisation's complete engineering standards;
- which downstream public assets are composed into a company package;
- the exact APM commands required.

The developer still understands why each recommendation was made and remains the final decision-maker.
