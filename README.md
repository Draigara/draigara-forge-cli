# Draigara Forge CLI

Draigara Forge gives developers one guided setup for using community APM
packages across AI coding tools. Microsoft APM remains responsible for
marketplaces, packages, targets, and dependency resolution.

## Get started

Forge requires Node.js 22 or newer. Run setup without installing anything
manually:

```sh
npx @draigara/forge setup
```

Setup checks the machine, confirms the complete plan, installs the Forge CLI on
`PATH`, registers Draigara OpenAPM Community, and asks APM to deploy the Forge
plugin to the coding tools you select. If APM is missing or incompatible, Forge
shows the official installation guidance and stops before changing package
state.

Setup is safe to run again after installing a new coding tool or changing APM,
marketplace, or plugin configuration:

```sh
forge setup
```

After setup, open a supported coding tool in a repository and run:

```text
/forge init
```

Repository initialization is conversational and belongs to the Forge plugin.
The machine CLI intentionally has no public `forge init` command.

## Install explicitly

The `npx` setup flow installs the invoked Forge release globally. You can also
install it yourself with a common Node package manager:

```sh
npm install --global @draigara/forge
# pnpm add --global @draigara/forge
# yarn global add @draigara/forge
```

## Commands

```text
forge setup
forge doctor
forge marketplace add|list|update|remove
forge plugin install|list|update|remove
forge --version
```

`forge mcp` is the versioned stdio integration used by the Forge plugin. It is
not an interactive human command.

## Troubleshooting

Run `forge doctor` to inspect Node.js, APM, marketplace, coding-tool, plugin,
state, and recovery status. Forge displays plans before mutation and never
silently changes APM package state.

## Contributing

Install dependencies and run the complete local quality gate:

```sh
npm ci
npm run check
```

On PowerShell, the packed-package smoke test is:

```powershell
./tools/smoke-test-package.ps1
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution expectations and
[docs/architecture.md](./docs/architecture.md) for system boundaries. Coding
agents must start with [AGENTS.md](./AGENTS.md) and the Accepted ADRs.
