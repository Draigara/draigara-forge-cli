# Contributing

## Before starting

Read, in order:

1. `README.md`
2. `PRODUCT-CONTEXT.md`
3. `AGENTS.md`
4. `docs/architecture.md`
5. `docs/implementation-plan.md`
6. all Accepted ADRs relevant to the change

Do not begin with code when the change alters a cross-repository contract, security boundary, command semantics, package metadata interpretation, or user approval flow. Write or update an ADR first.

## Development workflow

- Create a focused issue with acceptance criteria.
- Use a short-lived branch.
- Keep pull requests reviewable and preferably below 500 changed lines excluding generated files.
- Add tests that fail before the fix and pass afterward.
- Update user, operator, and protocol documentation in the same pull request.
- Record compatibility impact.
- Do not mix broad refactoring with behaviour changes.
- Use conventional commits where practical.

## Definition of done

A change is complete when:

- acceptance criteria are demonstrably satisfied;
- unit, contract, integration, and security tests appropriate to the change pass;
- user-facing errors are actionable;
- logs avoid secrets and unnecessary repository content;
- supported platforms are considered;
- relevant schemas and fixtures are updated;
- release notes are added when user-visible;
- no TODO silently defers a required safety or compatibility property.

## AI-assisted contributions

AI-generated code is held to the same standard as human-written code. The contributor remains responsible for correctness, licensing, provenance, tests, and security. Coding agents must follow `AGENTS.md` and may not reinterpret product boundaries.
