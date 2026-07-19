# Contributing to Forge CLI

Thank you for helping make Forge easier and safer to use. Contributions are
welcome under the repository's
[Apache License 2.0](./LICENSE). By submitting a contribution, you agree that
it may be distributed under that license. Draigara names and logos remain
subject to the separate [trademark notice](./TRADEMARKS.md).

## Before starting

Read, in order:

1. [`README.md`](./README.md)
2. [`PRODUCT-CONTEXT.md`](./PRODUCT-CONTEXT.md)
3. [`AGENTS.md`](./AGENTS.md) when using a coding agent
4. [`docs/architecture.md`](./docs/architecture.md)
5. [`docs/implementation-plan.md`](./docs/implementation-plan.md)
6. the [Accepted ADRs](./docs/adr/README.md) relevant to the change

Write or update an ADR before changing a cross-repository contract, security
boundary, command semantic, package-metadata interpretation, or approval flow.

## Run from source

Install Node.js 22 or 24, clone the repository, and run:

```sh
npm ci
npm run dev -- --help
npm run check
```

The complete check runs TypeScript type checking, the production build, and the
test suite. To exercise the exact npm payload on any PowerShell-supported
platform:

```powershell
./tools/smoke-test-package.ps1
```

When testing APM integration, use the supported APM 0.26.x release and test
only coding-tool targets claimed by the relevant integration test.

## Contribution workflow

- Open a focused issue with acceptance criteria when the change is substantial.
- Use a short-lived branch and keep pull requests reviewable.
- Add a test that fails before a behavioral fix and passes afterward.
- Update user, operator, schema, fixture, and protocol documentation together.
- Keep child processes cancellation-aware, time-bounded, and argument-safe.
- Avoid unrelated refactoring and use conventional commits where practical.

AI-assisted contributions are held to the same correctness, provenance,
licensing, testing, and security standards as human-written work.

## Definition of done

A change is complete when relevant tests and repository validators pass,
supported platforms are considered, public errors are actionable, logs contain
no secrets, schemas and fixtures are current, and no required safety property
is silently deferred.
