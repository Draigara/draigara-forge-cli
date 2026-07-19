# CLI Open Questions

**Repository:** `draigara-forge-cli`  
**Status:** Living document  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


These questions are intentionally unresolved and must not be answered implicitly in code.

## Forge v1 release blockers

- npm currently reports that the `@draigara` scope does not exist. A Draigara npm owner must create the scope/package and authorize trusted publishing for GitHub organization `Draigara`, repository `draigara-forge-cli`, workflow `release.yml`, and environment `release` before `0.1.0-preview.1` can publish to `next`.
- Which documented APM command or protocol should replace the read-only APM 0.26 compatibility adapter when one becomes available?

## Earlier questions

1. What exact executable/configuration signals are reliable enough to claim each stable harness detection profile?
2. Should machine marketplace registration support organisation-managed policy files in v1?
3. Which repository ignore standard is safest for monorepos?
4. When may Forge add authenticated private Git-backed marketplace sources beyond the v1 HTTPS/local JSON adapter?
