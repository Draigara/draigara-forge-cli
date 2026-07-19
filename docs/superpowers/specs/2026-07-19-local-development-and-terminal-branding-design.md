# Local Development Marketplace and Terminal Branding Design

**Date:** 2026-07-19  
**Status:** Approved conversational design; awaiting written-spec review  
**Repositories:** `draigara-forge-cli`, `draigara-openapm`, `draigara-forge-plugin`

## Purpose

Provide a fast local development loop that exercises Forge through the real Microsoft APM CLI, and give the human Forge CLI a distinctive Draigara-branded terminal experience. The design must not create a second package manager, duplicate plugin source, parse APM's human output, or weaken the signed production workflow.

## Repository boundaries

- `draigara-forge-cli` owns the native `forge` executable, interaction layer, APM process adapter, local Forge ledger, and workflow orchestration.
- `draigara-openapm` owns the Draigara Open APM-native marketplace and its package catalogue.
- `draigara-forge-plugin` owns the Forge plugin source and manifests.
- Microsoft APM remains authoritative for marketplace formats, package composition, dependency resolution, installed state, and target deployment.

The marketplace references the plugin as a top-level APM package. It does not copy plugin source into `draigara-openapm`. Forge does not inspect or reproduce the plugin's downstream dependency graph.

## Local marketplace development

Local APM marketplace sources are an explicit development feature. Forge accepts a local directory, direct marketplace file, or `file://` URI only where the developer supplied the source explicitly. Forge never discovers sibling repositories implicitly and never substitutes a local source for the signed production Draigara Open source.

Forge canonicalizes a local path to an absolute path for identity and conflict comparison, labels the source as local in the displayed mutation plan, asks APM to validate and register it, and records it only when Forge performed the registration. Existing identical APM registrations remain unmanaged; conflicting registrations fail without mutation.

The normal `forge init` recommendation continues to use the verified release manifest. A local marketplace or plugin source must be visibly selected as a development override. Stable release workflows never silently consume local sources.

## Generated local marketplace overlay

The public `draigara-openapm` manifest must not contain absolute workstation paths or depend on a particular checkout layout. Local development uses a disposable, ignored overlay generated with official APM commands at `.local/marketplace`:

```text
draigara-openapm/
  apm.yml
  .local/
    marketplace/
      apm.yml
      marketplace.json
```

The generator requires the marketplace and plugin repository paths as explicit inputs or derives them only from its own repository root plus a documented sibling-layout option. It emits official APM metadata and then runs APM validation. Deleting and regenerating `.local/` must produce equivalent metadata.

The first overlay contains no more than three catalogue entries:

1. `draigara-forge`, pointing to the local `draigara-forge-plugin` checkout.
2. `sample-upstream-skill`, pointing to one independently maintained upstream APM-compatible skill or plugin repository.
3. `forge-development-stack`, a top-level package that composes the first two through APM dependencies.

This exercises local registration, catalogue discovery, composition, transitive resolution, global installation, target deployment, update, removal, rollback, and idempotency without making Forge understand package composition.

## Missing APM structured protocol

The local marketplace does not replace missing APM structured operations. Forge may immediately use documented structured surfaces such as `apm targets --json`. Marketplace and global-package workflows remain blocked wherever APM exposes only human-oriented output.

The upstream contract request covers structured version identity, marketplace list and mutation results, global dependency state, and global install/update/uninstall results. Each response needs a schema version, stable codes, JSON-only stdout, diagnostics on stderr, bounded output, and no prompts or ANSI. Forge pins the first APM release containing the agreed contract and tests against both golden fixtures and the real released executable.

## Executable identity

The public executable name is `forge` on every platform (`forge.exe` on Windows). Project and namespace names may remain `Draigara.Forge.Cli`, but they must not leak into commands, help usage, archives, or installer instructions.

Expected commands include:

```text
forge init
forge marketplace list
forge plugin list
forge doctor
```

The installer places the native executable in a documented per-user executable directory and ensures it is addressable through `PATH` only through an explicit installation step. Forge is not distributed as a .NET tool.

## Brand hierarchy

Terminal presentation expresses this hierarchy:

- `DRAIGARA` is the primary brand.
- `FORGE` is the product.
- The dragon-D glyph is the compact identifier.
- Draig, the friendly dragon mascot, is a celebratory character.

The visual sources of truth are `logo-glyph.svg`, `logo-wordmark.svg`, and `draig.svg` under the Draigara assets directory. Terminal variants are derived design-time assets checked into the CLI repository as static strings. Runtime code does not parse SVG, rasterize images, or depend on terminal image protocols.

## Terminal variants

Wide interactive top-level help and `forge init` show the colored dragon-D glyph, the `DRAIGARA` wordmark, a subordinate `FORGE` label, and version/channel information. Narrow interactive terminals show a compact glyph with `Draigara Forge`. Routine subcommands use a compact accent rather than repeating the full banner.

Draig appears only for the first-run welcome and successful initialization. Errors, diagnostics, and destructive confirmations remain restrained and do not use the mascot.

Redirected output, non-interactive mode, `NO_COLOR`, and `--no-color` use plain text:

```text
Draigara Forge <version> (<channel>)
```

No presentation relies on color or glyphs for meaning. Screen-reader text accompanies decorative output. Narrow terminals must not wrap the wordmark into unusable output.

## Interaction architecture

`System.CommandLine` owns parsing, command structure, validation, and invocation. Spectre.Console owns human presentation, prompts, tables, trees, status displays, and progress. Commands call only `IInteractionService`; they do not call Spectre.Console directly.

`IInteractionService` selects the wide, compact, or plain renderer from terminal width, redirection, interactivity, `NO_COLOR`, and `--no-color`. Normal results go to stdout. Warnings, diagnostics, and child-process stderr go to stderr. Bridge or future structured surfaces never include banners, color, prompts, cursor control, or localized decoration.

## Derived terminal art

The dragon-D and Draig terminal art use a hand-tuned Unicode half-block representation derived from the SVG geometry. A small fixed orange/red palette approximates the brand gradient. Braille and terminal-specific image protocols are excluded because their rendering and support are inconsistent.

Generation is a design-time developer tool, not a runtime dependency. The checked-in output is reviewed and may be hand-adjusted. Iteration is expected; the SVG assets remain canonical while terminal snapshots capture the accepted representation.

## Testing

Snapshot or golden tests cover:

- wide interactive banner;
- narrow interactive banner;
- first-run Draig welcome and successful initialization;
- no-color output;
- redirected stdout and stderr;
- non-interactive output;
- top-level help usage showing `forge`, never `Draigara.Forge.Cli`;
- local-path canonicalization and conflict detection;
- regeneration equivalence for the local marketplace overlay;
- actual APM validation and install behavior for the local overlay where structured contracts exist.

Native AOT publishing must produce and execute a binary named `forge`/`forge.exe`. Tests must not claim a platform or target without a native integration lane.

## Failure and safety behavior

Missing local repositories, invalid APM metadata, unsupported local source forms, and conflicting registrations fail before mutation with a clear remediation. Local overrides are printed in the final plan and recovery journal. Rollback removes only registrations created by the current Forge operation.

Untrusted marketplace descriptions, plugin content, paths, and APM JSON are bounded and validated. No credential or signed manifest content is emitted in verbose output. The local developer workflow does not relax production signature, digest, confirmation, or ledger rules for non-local artifacts.
