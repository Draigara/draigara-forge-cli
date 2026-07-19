# Public README Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the three public READMEs so users understand installation and first use before contributors and coding agents encounter repository internals.

**Architecture:** Each repository keeps a self-contained public README tailored to its product boundary. Shared naming and audience rules come from the approved information-architecture design; portable contributor commands replace machine-specific paths.

**Tech Stack:** Markdown, npm, Microsoft APM 0.26.x, PowerShell repository validators

## Global Constraints

- The public APM package locator is `draigara-forge@draigara-openapm`.
- The package ID `draigara` remains available for a future brand-wide package.
- README audience order is user, human contributor, then coding agent.
- No README may contain an absolute local development path.
- APM owns packages, dependencies, targets, and deployment.

---

### Task 1: Rewrite the CLI README

**Files:**
- Modify: `C:/Projects/draigara-forge-cli/README.md`

**Interfaces:**
- Consumes: `@draigara/forge`, `forge setup`, and `/forge init`
- Produces: the primary end-user installation and command reference

- [ ] **Step 1: Reorder content around first use**

Lead with `npx @draigara/forge setup`, explain the machine/repository boundary,
list supported commands, and include rerun guidance and concise troubleshooting.

- [ ] **Step 2: Add portable contribution guidance**

Document `npm ci`, `npm run check`, and `./tools/smoke-test-package.ps1` and link
to `CONTRIBUTING.md` and `AGENTS.md` without making agents the primary audience.

- [ ] **Step 3: Validate**

Run: `npm run check` and `./tools/validate-docs.ps1`
Expected: all tests, build, and documentation validation pass.

### Task 2: Rewrite the plugin README

**Files:**
- Modify: `C:/Projects/draigara-forge-plugin/README.md`

**Interfaces:**
- Consumes: `draigara-forge@draigara-openapm`, `/forge init`, and `forge mcp`
- Produces: the plugin installation, usage, and contribution entry point

- [ ] **Step 1: Explain the locator and user workflow**

State explicitly that `draigara-forge` is the package and
`draigara-openapm` is the marketplace. Lead users from `forge setup` to
`/forge init`, then document `evaluate`, `status`, and `explain`.

- [ ] **Step 2: Replace local workspace assumptions**

Use portable APM validation and packing commands. Refer to sibling repositories
by name only and link contributors to repository documentation and `AGENTS.md`.

- [ ] **Step 3: Validate**

Run: `./tools/Validate-Repository.ps1`
Expected: `Forge plugin repository validation passed.`

### Task 3: Rewrite the marketplace README and verify the set

**Files:**
- Modify: `C:/Projects/draigara-openapm/README.md`

**Interfaces:**
- Consumes: marketplace ID `draigara-openapm` and APM marketplace commands
- Produces: the marketplace registration, catalogue, and contribution entry point

- [ ] **Step 1: Lead with marketplace purpose and use**

Explain the display name, stable ID, current Forge entry, and package locator.
Separate ordinary registration/use from marketplace-maintainer commands.

- [ ] **Step 2: Add portable contributor workflow**

Document the local marketplace generator and validation commands without an
absolute path. Link to package-authoring policy, `CONTRIBUTING.md`, and
`AGENTS.md`.

- [ ] **Step 3: Validate all public READMEs**

Run each repository validator and search all three READMEs for drive-letter
paths and stale process-bridge/native-distribution wording.
Expected: validators pass and the search returns no matches.

- [ ] **Step 4: Commit and push each repository**

Commit each README in its owning repository with a scoped documentation commit
and push its current tracked branch.
