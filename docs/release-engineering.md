# CLI Build, Signing, Packaging, and Release

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Release artifacts

For each supported runtime identifier:

- executable or platform package;
- SHA-256 checksum;
- SPDX or CycloneDX SBOM;
- build provenance attestation;
- release manifest containing protocol and schema compatibility;
- signature/notarisation evidence where applicable.

Initial target RIDs:

- `win-x64`
- `win-arm64`
- `osx-x64`
- `osx-arm64`
- `linux-x64`
- `linux-arm64`

Each archive is named `draigara-forge-<version>-<rid>.zip` on Windows or `draigara-forge-<version>-<rid>.tar.gz` elsewhere. Its root contains exactly the public native executable, `forge.exe` on Windows or `forge` on macOS/Linux, plus any required notices. Project names and RID staging directories never appear in the installed command or archive layout.

Debug symbols (`.pdb`, `.dbg`, and `.dSYM`) are retained as separate CI artifacts and are never included in published archives. Forge is not published as a .NET tool package.

## Installation layout

Installation is an explicit per-user operation. Extract the executable into a user-owned executable directory and add that directory to `PATH`: `%LOCALAPPDATA%\Programs\Draigara\Forge\bin` on Windows, `~/.local/bin` on Linux, or `~/Library/Application Support/Draigara/Forge/bin` on macOS. Installers must not silently modify system-wide paths.

## Build properties

- .NET 10;
- self-contained;
- `PublishAot=true`;
- trimming enabled;
- invariant globalization only if UX requirements permit;
- deterministic builds;
- continuous integration build metadata;
- source link;
- warnings as errors for production projects;
- no ReadyToRun fallback presented as Native AOT.

## macOS

Release flow:

1. build on a trusted GitHub-hosted macOS runner;
2. sign executable/package with a Developer ID certificate;
3. create package or archive;
4. submit for notarisation;
5. staple where applicable;
6. verify Gatekeeper assessment;
7. upload only verified artifacts.

Personal Developer ID signing is acceptable for an individual open-source maintainer, but the legal name becomes visible in the trust chain. Credentials must live in protected GitHub environments.

## Windows

Use a trusted code-signing service or certificate-backed signing process. Prefer hardware/service protected keys. Timestamp signatures. Verify signatures in CI before release.

## Linux

Provide checksums, provenance, and optionally repository-specific packages later. Do not claim distribution support until maintenance and update semantics are defined.

## Release channels

- `stable`
- `preview`
- `nightly` for maintainers only

Channels have separate update metadata and never silently move users from stable to preview.

## Versioning

Semantic versioning for the CLI. Bridge protocol and `forge.yaml` schema have independent version numbers. A CLI minor release may add an optional protocol field; breaking protocol changes require a new major protocol endpoint.

## Rollback

Retain prior signed releases and manifests. The updater may support explicit rollback, but never automatically downgrade across a security revocation.
