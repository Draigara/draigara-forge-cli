# Public README Information Architecture

**Status:** Approved design pending written-spec review  
**Scope:** `draigara-forge-cli`, `draigara-openapm`, and `draigara-forge-plugin`

## Public naming

The Forge APM package ID is `draigara-forge`. Its fully qualified marketplace
locator is `draigara-forge@draigara-openapm`, where the left side identifies the
product package and the right side identifies Draigara OpenAPM Community.

The ID `draigara` is reserved for a possible future brand-wide package. It must
not be used as an alias for Forge.

## Audience order

Every public README serves audiences in this order:

1. developers evaluating or using the product;
2. human contributors;
3. coding agents, by a final link to `AGENTS.md`.

Repository implementation plans, architecture details, agent instructions, and
local workspace assumptions must not interrupt the user journey.

## Shared structure

Each README contains only the sections relevant to that repository:

1. product purpose and relationship to Forge/APM;
2. installation or first-use instructions;
3. primary workflow and commands;
4. concise safety and ownership boundaries;
5. portable contributor setup and validation commands;
6. links to `CONTRIBUTING.md`, architecture documentation, and `AGENTS.md`.

The CLI README leads with `npx @draigara/forge setup`. The plugin README leads
with installation through `draigara-forge@draigara-openapm` and `/forge init`.
The marketplace README explains registration, available packages, and package
contribution policy before marketplace-maintainer commands.

## Portability

Public READMEs must contain no user names, drive letters, absolute local paths,
or assumed workspace root. Cross-repository integration tests may describe
sibling checkouts by repository name, but their locations must be configurable
or discovered by tooling. Concrete machine paths belong only in ignored local
configuration or transient command examples supplied by the developer.

## Acceptance criteria

- A new user can identify what to install and the first command without reading
  architecture documents.
- A contributor can locate contribution guidance and portable validation
  commands.
- A coding agent is directed to `AGENTS.md` without making it the README's
  primary audience.
- `draigara-forge@draigara-openapm` is explained once as package-at-marketplace.
- No public README contains `C:\Projects`, another absolute development path,
  or release-blocker language presented as user instructions.
