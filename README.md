# Draigara Forge CLI

Forge provides low-friction, machine-scoped onboarding for Draigara Forge. Microsoft APM remains the authority for marketplaces, packages, targets, and dependency resolution.

## Run it

Node.js 22 or newer is required. The fastest first run is:

```sh
npx @draigara/forge setup
```

`setup` is convergent and safe to rerun when APM, coding harnesses, marketplaces, or plugins change. It shows one complete plan and asks before mutation. To keep `forge` on `PATH`:

```sh
npm install --global @draigara/forge
# or: pnpm add --global @draigara/forge
# or: yarn global add @draigara/forge
forge setup
```

After machine setup, open Copilot, Claude, Codex, or another supported harness in a repository and prefer the Forge plugin's `/forge init` experience. Repository initialization is conversational; the machine CLI intentionally has no public `forge init` command.

## Commands

```text
forge setup
forge doctor
forge marketplace add|list|update|remove
forge plugin install|list|update|remove
forge --version
```

The hidden `forge mcp` stdio server is a versioned plugin integration boundary, not a human command.

## Boundaries

Forge delegates package management to APM, does not infer package composition, never silently mutates package state, and does not require Draigara Cloud. Production setup remains release-blocked until APM exposes every required structured operation and signed production locators are supplied.

Coding agents should begin with [AGENTS.md](./AGENTS.md), [the architecture](./docs/architecture.md), [the MCP contract](./docs/bridge-protocol.md), [the implementation plan](./docs/implementation-plan.md), and all Accepted ADRs.
