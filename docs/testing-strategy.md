# CLI Testing Strategy

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Test pyramid

### Unit tests

- configuration validation;
- marketplace ID rules;
- path canonicalisation;
- ignore matching;
- detectors and parsers;
- plan-token claims and expiry;
- error mapping;
- redaction;
- command option validation.

### Protocol contract tests

For every operation:

- request and response JSON Schema;
- golden success fixture;
- golden failure fixture;
- unknown optional-field tolerance;
- malformed and oversized input;
- stable error codes;
- protocol negotiation.

### Integration tests

Use temporary directories and fake executables to test:

- marketplace registry persistence;
- credential-store abstraction;
- repository discovery;
- child-process behaviour;
- plugin adapter staging and rollback;
- APM plan/install state changes;
- cancellation.

### Native AOT tests

Publish each supported RID and execute smoke tests against the produced binary. Reflection-based tests running only under JIT are insufficient.

### End-to-end tests

Scenarios:

1. fresh machine configuration with fake APM and Copilot harness;
2. register three marketplaces;
3. initialise a fixture repository through bridge operations;
4. query only the committed marketplace;
5. plan selected packages;
6. reject a modified plan token;
7. install after confirmation;
8. verify plugin and APM state;
9. rerun doctor;
10. remove only Forge-owned plugin assets.

### Security and fuzz tests

- JSON protocol fuzzing;
- filesystem path fuzzing;
- symlink loops;
- malicious filenames;
- argument quoting;
- log redaction;
- catalogue metadata size attacks;
- race between plan and install.

## Test fixtures

Fixtures must be synthetic and free of proprietary company data. Include repositories representing:

- empty greenfield;
- .NET/Aspire;
- Node monorepo;
- mixed monorepo;
- GitHub, GitLab, Azure DevOps, and Bitbucket CI;
- ADR selecting a future technology;
- migration from one datastore to another;
- malformed manifests;
- ignored secrets and symlink traps.
