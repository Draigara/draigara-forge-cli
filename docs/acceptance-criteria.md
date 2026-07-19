# Acceptance criteria

- `npx @draigara/forge setup` and a temporary global package installation expose `forge` on Node.js 22 and 24.
- Setup reconciles current state, displays one complete plan, requires authorization, and adopts an identical existing marketplace only when that tracking change is visible in the confirmed plan.
- Rerunning setup explicitly refreshes the global Forge plugin through APM and reruns doctor.
- Missing, older, newer, malformed, timed-out, and cancelled APM cases produce documented exit codes without parsing human output.
- Marketplace and plugin lifecycle operations are contract-tested against a fake and the supported real APM release.
- Forge state is schema-validated, locked, atomic, backed up, and recoverable; `forge.yaml` is create-only.
- Every MCP tool has bounded schemas and golden success/error fixtures, and stdio remains valid JSON-RPC when terminal output is redirected.
- CI passes on Windows, macOS, and Linux; the packed package installs and runs from a clean prefix.
- Stable release remains blocked while required production metadata or structured APM operations are unavailable.
