# CLI Open Questions

**Repository:** `draigara-forge-cli`  
**Status:** Living document  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


These questions are intentionally unresolved and must not be answered implicitly in code.

## Forge v1 release blockers

- What is the production source locator for marketplace ID `draigara-openapm` (display name “Draigara OpenAPM Community”)? Planned: `https://github.com/draigara/draigara-openapm`.
- What are the production Forge plugin locator, versioning convention, and digest source? Planned: `https://github.com/draigara/draigara-forge-plugin`, SemVer with `v0.1.0`, and the immutable npm/APM release artifact checksum.
- Which APM release provides structured version identity, marketplace lifecycle, global dependency state, and global install/update/uninstall plans and results? APM `0.26.0` is the minimum candidate and must pass the compatibility suite.

## Earlier questions

1. Which exact APM structured output modes form the initial compatibility floor?
2. Does APM expose a stable dry-run/plan operation sufficient for the plan-token design, or is a narrower safe adapter required?
3. What exact executable/configuration signals are reliable enough to claim each stable harness detection profile?
4. Which Linux credential-store fallback is acceptable when Secret Service is unavailable?
5. Will the first release include self-update, or rely on npm package channels?
6. Which GitHub Actions environment and npm trusted-publisher identity will publish `latest` and `next`?
7. What stable package locator can be returned without Forge interpreting package internals?
8. Should machine marketplace registration support organisation-managed policy files in v1?
9. Which repository ignore standard is safest for monorepos?
10. What minimum MCP contract range will the first Forge plugin declare?
