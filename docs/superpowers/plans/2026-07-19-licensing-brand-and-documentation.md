# Licensing, Brand, and Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Apache 2.0 to Draigara-authored work, protect attribution and brand identity separately, make four repository READMEs human-first and branded, publish a tested repository-documentation skill through OpenAPM, and prepare `@draigara/forge` for secure npm bootstrap.

**Architecture:** Keep licensing explicit at every first-party package boundary while preserving upstream licenses. Use Apache 2.0 for code, `NOTICE` for attribution, and `TRADEMARKS.md` for brand boundaries. Store a local lowercase wordmark in each repository, keep consumption in README and source setup in CONTRIBUTING, and package the new documentation guidance as a script-free APM skill with a charter and deterministic acceptance checks.

**Tech Stack:** Markdown, SVG, PowerShell repository validators, APM 0.26.0 manifests and generated marketplaces, npm 11.18.0, Node.js 22/24, GitHub Actions.

## Global Constraints

- Apply Apache 2.0 only to Draigara-authored work; do not relicense third-party material.
- Use the SPDX identifier `Apache-2.0` in npm, APM, and plugin metadata.
- Preserve Draigara attribution in `NOTICE` and keep trademark permissions separate from the software license.
- Keep the wordmark repository-local and derived from `C:\Projects\draigara\assets\logo-wordmark.svg`.
- Do not claim platforms, package-manager commands, or harness support that is not accurate.
- Keep source-development instructions in `CONTRIBUTING.md` and link them from each README.
- The new skill has no scripts, hooks, MCP server, network access, or credentials.
- Do not run `npm publish` until the exact tarball and clean commit are shown to the user.

---

### Task 1: Make license drift fail validation

**Files:**
- Modify: `C:\Projects\draigara-forge-cli\tools\validate-docs.ps1`
- Modify: `C:\Projects\draigara-forge-plugin\tools\Validate-Repository.ps1`
- Modify: `C:\Projects\draigara-openapm\tools\Validate-Repository.ps1`
- Modify: `C:\Projects\acme-apm\tools\Validate-Repository.ps1`

**Interfaces:**
- Consumes: first-party root and package manifests.
- Produces: repository checks that require Apache 2.0 metadata, official license text, attribution, and the trademark boundary.

- [x] **Step 1: Add failing validation assertions**

Require the official Apache 2.0 heading in each root `LICENSE`, require `Apache-2.0` in the CLI package and APM manifests, require `NOTICE` and `TRADEMARKS.md`, and check local first-party package licenses where present.

- [x] **Step 2: Run validators and verify RED**

Run each repository validator. Expected: all four fail because the current local first-party files still declare PolyForm Shield.

- [x] **Step 3: Commit the failing validation changes in each repository**

Use commit message `test: guard first-party license metadata`.

### Task 2: Apply Apache 2.0 at every first-party boundary

**Files:**
- Modify: each repository root `LICENSE`
- Create: each repository root `NOTICE`
- Create: each repository root `TRADEMARKS.md`
- Modify: `C:\Projects\draigara-forge-cli\package.json`
- Modify: `C:\Projects\draigara-forge-cli\package-lock.json` root package entry
- Modify: `C:\Projects\draigara-forge-plugin\apm.yml`
- Modify: `C:\Projects\draigara-forge-plugin\plugin.json`
- Modify: `C:\Projects\draigara-openapm\apm.yml`
- Modify: `C:\Projects\acme-apm\apm.yml`
- Modify: `C:\Projects\acme-apm\packages\acme-engineering-standards\apm.yml`
- Modify: `C:\Projects\acme-apm\packages\acme-engineering-standards\LICENSE`

**Interfaces:**
- Consumes: official unmodified Apache License 2.0 terms.
- Produces: consistent first-party licensing and accurate npm/APM metadata.

- [x] **Step 1: Replace each first-party license**

Use the official terms from `https://www.apache.org/licenses/LICENSE-2.0.txt`. Put Draigara attribution in `NOTICE`, not in the license text.

- [x] **Step 2: Update metadata without touching dependency licenses**

Set CLI, first-party APM, and plugin metadata to `Apache-2.0`. Leave transitive `package-lock.json` license values and upstream provenance untouched.

- [x] **Step 3: Run validators and verify GREEN**

Expected: all four license validators pass.

- [x] **Step 4: Commit per repository**

Use commit message `legal: adopt Apache License 2.0`.

### Task 3: Brand and restructure repository documentation

**Files:**
- Create: each repository `docs/assets/draigara-wordmark.svg`
- Modify: each repository `README.md`
- Modify: each repository `CONTRIBUTING.md` (create it in `acme-apm`)
- Create: each repository `THIRD_PARTY_NOTICES.md` only where bundled or referenced third-party works need an explicit index

**Interfaces:**
- Consumes: the approved human-first README structure and existing product contracts.
- Produces: branded user onboarding with contribution setup kept separate.

- [x] **Step 1: Add the lowercase wordmark through `apply_patch`**

Copy the exact tracked SVG text from the brand asset repository into each `docs/assets/` path and reference it with accessible alt text.

- [x] **Step 2: Rewrite READMEs for consumption first**

Document accurate copyable commands: `npx`, npm global install, `pnpm dlx`/global install, and modern `yarn dlx` for Forge; Forge/APM installation for the plugin and marketplaces; supported harnesses and safe ownership boundaries.

- [x] **Step 3: Move contributor commands into CONTRIBUTING**

Keep only a short contribution link in each README. Put clone/setup/validate commands and architecture prerequisites in `CONTRIBUTING.md`.

- [x] **Step 4: Add a real CLI image only if faithful**

Capture real output from the built CLI. Include it only if the resulting image is readable and contains no machine-specific paths or fabricated state.

- [x] **Step 5: Validate links, forbidden stale wording, and machine paths**

Run repository validators and `rg -n "C:\\\\Projects|license: MIT|\"license\": \"MIT\""` over first-party files. Expected: no unintended matches.

- [x] **Step 6: Commit per repository**

Use commit message `docs: add branded user-first guides`.

### Task 4: Add and test the repository-documentation APM skill

**Files:**
- Create: `C:\Projects\draigara-openapm\docs\package-charters\repository-documentation.md`
- Create: `C:\Projects\draigara-openapm\packages\repository-documentation\apm.yml`
- Create: `C:\Projects\draigara-openapm\packages\repository-documentation\LICENSE`
- Create: `C:\Projects\draigara-openapm\packages\repository-documentation\README.md`
- Create: `C:\Projects\draigara-openapm\packages\repository-documentation\.apm\skills\repository-documentation\SKILL.md`
- Create: `C:\Projects\draigara-openapm\fixtures\repository-documentation\baseline.md`
- Create: `C:\Projects\draigara-openapm\fixtures\repository-documentation\expected-checks.json`
- Modify: `C:\Projects\draigara-openapm\apm.yml`
- Modify: `C:\Projects\draigara-openapm\tools\Validate-Repository.ps1`
- Modify: generated `.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`

**Interfaces:**
- Consumes: APM package format, Accepted ADRs 0001-0010 and 0012, and the writing-skills TDD discipline.
- Produces: repository-scoped package `repository-documentation` version `0.1.0`.

- [x] **Step 1: Record the RED baseline**

Use a deliberately poor README fixture that buries installation, contains a machine path, mixes source setup into user onboarding, and makes an unsupported support claim. Add validator expectations and run them before the skill exists. Expected: failure for every missing contract element.

- [x] **Step 2: Approve the package charter**

Record outcome, audience, relevance, scope, non-goals, no-upstream strategy, evaluation cases, security classification, owner, and publication gates. Mark publication authorised for the documentation-only preview package.

- [x] **Step 3: Scaffold with the official skill creator**

Run `init_skill.py repository-documentation --path packages/repository-documentation/.apm/skills`, then replace generated guidance with the minimal skill needed to satisfy the baseline failures.

- [x] **Step 4: Add APM package and catalogue metadata**

Use `includes: auto`, no dependencies, Apache 2.0 metadata, local source `./packages/repository-documentation`, version `0.1.0`, repository scope, documentation category, and only tested target tags.

- [x] **Step 5: Validate GREEN and generate marketplaces**

Run `uvx --from apm-cli==0.26.0 apm pack --marketplace claude,codex`, the repository validator, and any generated package dry-run. Expected: package and both marketplace outputs contain `repository-documentation` with no machine path.

- [x] **Step 6: Commit**

Use commit message `feat: add repository documentation skill`.

### Task 5: Harden npm release and prepare the manual bootstrap

**Files:**
- Modify: `C:\Projects\draigara-forge-cli\.github\workflows\release.yml`
- Modify: `C:\Projects\draigara-forge-cli\tools\validate-docs.ps1`

**Interfaces:**
- Consumes: npm trusted publishing requirements and package version `0.1.0-preview.1`.
- Produces: deterministic OIDC-compatible releases after the first manual publish.

- [x] **Step 1: Make the npm version check fail**

Require release workflow text `npm install --global npm@11.18.0` before publication. Run `./tools/validate-docs.ps1`; expected: failure.

- [x] **Step 2: Pin the trusted-publishing-capable npm CLI**

Add the npm install step after `actions/setup-node` and before `npm ci`.

- [x] **Step 3: Verify build and tarball**

Run `npm ci`, `npm run check`, `./tools/validate-docs.ps1`, `./tools/smoke-test-package.ps1`, and `npm pack --dry-run --json`. Expected: all pass; tarball contains `dist/forge.js`, `README.md`, and `LICENSE`, and reports `0.1.0-preview.1`.

- [x] **Step 4: Verify clean repository and package availability**

Run `git status --short`, `npm whoami`, and `npm view @draigara/forge version --json`. Expected: clean tree, `rebeccapowell`, and registry `E404` immediately before bootstrap.

- [x] **Step 5: Stop before external publication**

Report the verified commit, version, dist-tag `next`, tarball contents, and exact command `npm publish --access public --tag next`. Execute only after explicit user approval.

### Task 6: Cross-repository verification and publication readiness

**Files:**
- Verify only; fix any failures in the owning repository.

**Interfaces:**
- Consumes: Tasks 1-5.
- Produces: clean, pushed `main` branches and a publish-ready npm package.

- [x] **Step 1: Run all local quality gates**

Run CLI `npm run check`, plugin `apm pack --dry-run` plus validator, OpenAPM pin test/pack/validator, and ACME pack/validator.

- [x] **Step 2: Scan licensing and public docs across repositories**

Confirm first-party Apache 2.0 declarations, no PolyForm terms, no `C:\Projects` paths in public docs, all relative README assets exist, and upstream license records are unchanged.

- [ ] **Step 3: Push each clean `main` branch**

Use `git push origin main` only after its repository passes. Restrict GitHub CLI/API verification to the Draigara organization.

- [ ] **Step 4: Check GitHub Actions**

Use `gh run list`/`gh run view` for only `Draigara/draigara-forge-cli`, `Draigara/draigara-forge-plugin`, `Draigara/draigara-openapm`, and `Draigara/acme-apm`. Expected: required workflows complete successfully or any external blocker is reported with its exact check.
