# CLI Product Acceptance Criteria

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Machine setup

- Given a clean supported machine with APM and Copilot CLI, `forge setup` can install the released Forge plugin and verify it.
- Running setup twice does not duplicate registrations or plugin files.
- Removing the plugin leaves unrelated harness assets untouched.

## Multiple marketplaces

- Three registrations can coexist.
- Each has a stable ID, independent source, and independent credential reference.
- Listing never exposes credentials.
- A repository referencing `company-b` cannot query `company-a` by accidental default.
- Missing registration produces a precise setup action.

## Repository configuration

- Minimal valid `forge.yaml` validates.
- Unknown or misspelled properties fail with location.
- Existing file is never overwritten silently.
- No analyzer operation writes inferred state.

## Deterministic analysis

- Recognises supplied fixture languages, manifests, CI providers, documentation candidates, and existing APM state.
- Does not execute fixture scripts.
- Does not read ignored secrets.
- Prevents symlink escape.
- Produces stable ordered output.

## Planning and installation

- Planning accepts only retrieved opaque top-level locators.
- Plan token binds repository, marketplace, selection, APM/tool/catalogue state, and expiry.
- Changing any bound state invalidates install.
- Install cannot add an unapproved package.
- Cancellation and external failure are reported accurately.
- Forge does not edit an APM lock file independently.

## Native distribution

- All declared RID binaries launch without a preinstalled .NET runtime.
- Native AOT smoke tests pass.
- Stable artifacts have checksums, provenance, SBOM, platform signing where applicable, and macOS notarisation.
