# Licensing, Brand, and Documentation Design

**Date:** 2026-07-19
**Status:** Approved, amended 2026-07-19
**Repositories:** `draigara-forge-cli`, `draigara-forge-plugin`, `draigara-openapm`, `acme-apm`

## Goal

Replace the unintended MIT licensing of Draigara-authored work, make each main
README useful to users before contributors, apply the existing Draigara brand
consistently, add a reusable repository-documentation skill to Draigara
OpenAPM Community, and prepare the Forge CLI for its first npm publication and
subsequent trusted publishing.

## Licensing

All Draigara-authored material in the four repositories is offered under the
Apache License 2.0. npm, APM, and plugin metadata use the SPDX identifier
`Apache-2.0`. Each first-party package boundary carries the official unmodified
license text.

Each repository also carries a `NOTICE` file for Draigara attribution and a
separate `TRADEMARKS.md` notice. Apache 2.0 does not grant permission to use the
Draigara or Forge names, logos, or other marks except as required for reasonable
and customary description of the work. The trademark notice protects official
distribution identity without restricting the rights granted over the code.

Third-party packages, dependencies, trademarks, and referenced upstream assets
remain under their respective owners' terms. Marketplace documentation must
make that boundary explicit; changing a marketplace repository's root license
must never relabel upstream work.

PolyForm Shield and a timed PolyForm-to-Apache conversion were considered and
rejected. Forge is ecosystem infrastructure: familiar open-source terms,
enterprise policy compatibility, uncomplicated redistribution, and community
forking are more valuable during early adoption than a temporary restriction on
competitive use. Apache 2.0 retains explicit patent terms and broad warranty and
liability disclaimers, while brand protection belongs in trademark policy.

## Human-first repository documentation

Each repository stores its own copy of the lowercase Draigara wordmark under
`docs/assets/` so GitHub and package consumers do not depend on a developer's
machine or another repository's mutable branch.

Every main README follows this order:

1. Draigara wordmark, product name, and a one-sentence purpose.
2. How a user consumes the product using copyable commands.
3. Supported platforms, tools, or harnesses, stated only where tested.
4. The normal user workflow and important ownership/safety boundaries.
5. Troubleshooting or validation entry points.
6. Links to contribution, architecture, security, and license documentation.

Source checkout, build, test, and contribution workflows belong in
`CONTRIBUTING.md`, linked from the README. Commands cover npm, pnpm, and modern
Yarn where those clients provide a real equivalent. `yarn dlx` is documented
for one-shot use; Yarn Classic-only global commands are not presented as a
modern default.

The CLI README may include a screenshot only if it is captured from the real
CLI and remains legible on GitHub. A fabricated terminal mockup is not used.

## Repository-documentation skill

Draigara OpenAPM Community gains a Draigara-authored package named
`repository-documentation`, initially versioned `0.1.0`. Before publication it
receives a package charter covering audience, scope, non-goals, evaluation, and
release gates.

The package contains a concise skill that activates when an agent creates,
rewrites, or audits repository-facing documentation such as `README.md` and
`CONTRIBUTING.md`. It teaches a positive output contract:

- lead with purpose and consumption;
- provide accurate, copyable, multi-platform commands;
- separate contributor setup from user onboarding;
- reuse local brand assets and accessible alternative text;
- use real screenshots only when they materially aid understanding;
- preserve third-party attribution and license boundaries;
- verify links, commands, package names, and support claims.

The skill is a documentation-only, repository-scoped package with no scripts,
hooks, MCP servers, network access, credentials, or destructive operations.
Its metadata remains company-neutral in behavior even though Draigara publishes
it. A deterministic acceptance harness records a failing baseline, then checks
that the skill produces the required document shape and avoids unsupported
claims.

## npm bootstrap and trusted publishing

`@draigara/forge` does not yet exist in the npm registry. Trusted publishers
are configured per existing package, so the first preview is published once
manually by an authenticated Draigara organization member after all license and
package-content checks pass.

The one-time bootstrap publishes `0.1.0-preview.1` with dist-tag `next`. No
release tag is created until the exact commit and package contents have been
verified. After the package exists, its npm settings configure one GitHub
Actions trusted publisher:

- organization: `Draigara`
- repository: `draigara-forge-cli`
- workflow: `release.yml`
- environment: `release`
- allowed action: `npm publish`

The release workflow retains `id-token: write`, uses a GitHub-hosted runner,
and pins npm to a release new enough for trusted publishing. After an OIDC
publish succeeds, package publishing access is changed to require 2FA and
disallow traditional write tokens.

## Verification and rollout

Each repository must pass its existing validation before commit. Additional
checks verify that every first-party manifest declares Apache 2.0, no PolyForm
terms remain, every README
asset resolves locally, the Forge npm tarball contains the new license and
README, the documentation package validates and appears in generated
marketplace outputs, and no machine-specific paths enter public documentation.

Changes are committed and pushed independently to each repository's `main`
branch, as explicitly requested. The npm publish is a separate irreversible
step: show the package name, version, dist-tag, tarball contents, and clean Git
commit before executing it.
