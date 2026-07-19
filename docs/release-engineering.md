# Release engineering

Forge is distributed from npm as `@draigara/forge`; it does not publish platform executables. CI tests Node.js 22 and 24 on Windows, macOS, and Linux, then smoke-tests the packed tarball through a temporary global installation.

Releases use npm Trusted Publishing with OIDC and npm provenance. Stable versions use the `latest` dist-tag and prereleases use `next`. There is no separate bespoke signing envelope for the npm package: registry integrity, lockfiles, TLS, Trusted Publishing, and provenance are the supply-chain controls.

A stable publish is blocked until production APM metadata and marketplace/plugin locators are supplied and all required structured APM operations have integration tests. npm, pnpm, and Yarn users are supported as consumers; npm owns publishing and the canonical CI install path.
