# Marketplace Registry and Authentication

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


## Registry purpose

A developer may work with multiple organisations and Draigara OpenAPM Community. The machine registry makes those marketplaces available without selecting one globally.

Example:

```text
company-a       Company A Engineering
company-b       Company B Platform
draigara-openapm   Draigara OpenAPM Community
```

The repository selects exactly one by committed ID.

## Registration model

Required fields:

- stable `id`;
- display name;
- APM-compatible source locator;
- source kind;
- authentication kind;
- optional trusted certificate or enterprise endpoint settings by reference;
- created and last-validated timestamps.

Optional policy may define allowed source hosts, minimum TLS, and whether private sources require organisation-managed authentication.

## Authentication strategies

Prefer delegation:

1. APM's own authentication mechanisms;
2. provider CLI credential brokers;
3. operating-system credential stores;
4. short-lived OIDC/device-code tokens.

Do not ask users to paste long-lived tokens into command arguments where shell history may retain them.

The registry stores references and non-secret metadata. Secrets belong in:

- Windows Credential Manager;
- macOS Keychain;
- Linux Secret Service or a documented secure fallback;
- provider credential stores controlled by the provider.

## Private and enterprise sources

Support configuration for:

- proxies;
- custom certificate authorities;
- self-hosted Git providers where APM supports them;
- separate authentication identities per marketplace;
- offline validation mode using cached non-sensitive metadata.

Never disable TLS verification through a persistent convenience flag. A development-only override must be explicit, noisy, time-limited, and unavailable in policy-managed environments.

## Lifecycle

- `add`: validate source and authentication before commit.
- `list`: show health without revealing secrets.
- `update`: validate replacement before atomic swap.
- `remove`: delete local metadata and, with explicit confirmation, Forge-owned credential references.
- `doctor`: test reachability and report whether failure is DNS, proxy, TLS, authentication, authorisation, APM compatibility, or catalogue shape.

## Identity stability

A marketplace ID is a repository-facing contract. Display names and endpoints may change; IDs should not. The CLI warns strongly before changing or removing an ID used by the current repository.
