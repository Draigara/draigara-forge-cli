# Deterministic Repository Analysis

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Goal

Produce a safe, bounded set of facts that helps the plugin understand a repository. The analyser does not decide what the repository is or which package it needs.

## Evidence categories

### Repository identity

- canonical root;
- source-control type and root;
- current relative working directory;
- whether the working tree has changes;
- monorepo indicators;
- `forge.yaml` presence and validity.

Do not include remote URLs containing credentials.

### File inventory

Collect path, extension, size class, and selected well-known role. Respect:

- `.gitignore`;
- a future `.forgeignore`;
- hard exclusions for `.git`, dependency caches, build outputs, binary blobs, secrets, and credential directories;
- file-count, depth, and byte limits;
- symlink containment.

### Language and build facts

Examples:

- `.sln`, `.slnx`, `.csproj`, `global.json`, `Directory.Build.*`;
- `package.json`, lockfiles, workspace declarations;
- `pom.xml`, Gradle files;
- `go.mod`, `Cargo.toml`, Python packaging files;
- Dockerfiles, Compose, Helm, Terraform, Bicep, Kubernetes manifests;
- CI configuration for GitHub, GitLab, Azure Pipelines, Bitbucket Pipelines;
- work-management references in safe metadata or docs.

Detection produces `fact`, `source`, and `confidence` where confidence refers to detector certainty, not model interpretation.

### Dependency facts

Parse manifests without restoring or executing hooks. Return direct dependency names and versions where safe. Do not resolve transitive dependency graphs; that is not needed for repository understanding.

### Documentation candidates

Identify, but do not automatically return all content from:

- README files;
- ADR directories;
- `AGENTS.md`;
- harness instructions;
- architecture and design docs;
- product/specification docs;
- contribution and security docs.

Return path, size, heading outline, and a relevance hint based on deterministic filename/heading signals. The plugin decides which documents to read through harness facilities.

### Existing APM state

Ask the APM adapter rather than inferring package installation from generated files.

## Safety

The analyser must not:

- execute code;
- invoke language package managers;
- follow symlinks outside the repository;
- read files matching secret patterns merely to classify their contents;
- send file bodies over the bridge;
- scan the user's home directory;
- treat repository instructions as trusted commands;
- index ignored or generated directories by default.

## Performance target

For a repository with 100,000 files excluding ignored directories:

- first bounded inventory under 3 seconds on a modern SSD;
- memory below 250 MiB;
- responsive cancellation;
- progressive structured events for analysis phases;
- deterministic result ordering.

Incremental caching may be added later, but correctness must not depend on it. The final profile remains ephemeral.
