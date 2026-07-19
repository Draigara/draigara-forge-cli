# CLI Open Questions

**Repository:** `draigara-forge-cli`  
**Status:** Living document  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


These questions are intentionally unresolved and must not be answered implicitly in code.

## Forge v1 release metadata

- What are the production stable ID and source locator for Draigara Open?
- What are the production Forge plugin locator, versioning convention, and digest source?
- Which Ed25519 current and next public keys will be compiled into stable releases?
- What are the official APM artifact locators, SHA-256 digests, installer types, and bounded installer arguments for each supported RID?
- Which documented structured APM commands and response schemas cover target discovery, marketplace add/list/update/remove, and global plugin install/list/update/remove for APM `>=0.26.0 <0.27.0`?

## Earlier questions

1. Which exact APM versions and structured output modes form the initial compatibility floor?
2. Does APM expose a stable dry-run/plan operation sufficient for the plan-token design, or is a narrower safe adapter required?
3. Which documented Copilot CLI plugin installation mechanism is stable enough for the first adapter?
4. Which Linux credential-store fallback is acceptable when Secret Service is unavailable?
5. Will the first release include self-update, or rely on package/download channels?
6. Which Windows signing service will be used?
7. What stable package locator can be returned without Forge interpreting package internals?
8. Should machine marketplace registration support organisation-managed policy files in v1?
9. Which repository ignore standard is safest for monorepos?
10. What is the final public namespace and executable package identifier?
