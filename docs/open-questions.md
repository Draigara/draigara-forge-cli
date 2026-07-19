# CLI Open Questions

**Repository:** `draigara-forge-cli`  
**Status:** Living document  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


These questions are intentionally unresolved and must not be answered implicitly in code.

## Forge v1 release blockers

- Which GitHub Actions environment and npm Trusted Publisher identity will publish `next` and `latest`?
- Which exact preview tag of `draigara-forge-plugin` will be referenced by the first OpenAPM release?
- Which documented APM command or protocol should replace the read-only APM 0.26 compatibility adapter when one becomes available?

## Earlier questions

1. What exact executable/configuration signals are reliable enough to claim each stable harness detection profile?
2. Should machine marketplace registration support organisation-managed policy files in v1?
3. Which repository ignore standard is safest for monorepos?
4. When may Forge add authenticated private Git-backed marketplace sources beyond the v1 HTTPS/local JSON adapter?
