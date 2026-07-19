# CLI Error Catalogue

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


| Code | Meaning | Retry | Primary remediation |
|---|---|---:|---|
| `FORGE_CONFIG_INVALID` | Machine or repository configuration failed schema validation. | No | Correct the reported path and field. |
| `FORGE_MARKETPLACE_NOT_REGISTERED` | `forge.yaml` references an unknown machine registration. | No | Register the exact ID. |
| `FORGE_MARKETPLACE_UNREACHABLE` | DNS, proxy, TLS, or network failure. | Yes | Run `forge doctor --marketplace <id>`. |
| `FORGE_AUTH_REQUIRED` | Authentication is absent or expired. | After auth | Re-run the provider/APM login flow. |
| `FORGE_APM_NOT_FOUND` | APM executable cannot be resolved. | No | Install APM or configure its supported location. |
| `FORGE_APM_UNSUPPORTED` | Installed APM version is outside the compatibility range. | No | Upgrade or select a supported release. |
| `FORGE_HARNESS_NOT_FOUND` | Requested harness is not installed. | No | Install the harness or choose another. |
| `FORGE_PLUGIN_INCOMPATIBLE` | Plugin, harness, and bridge versions have no compatible set. | No | Update the indicated component. |
| `FORGE_REPOSITORY_NOT_FOUND` | No unambiguous repository root was found. | No | Run from a repository or pass `--repository`. |
| `FORGE_REPOSITORY_ESCAPE` | A path or symlink escaped the allowed repository root. | No | Remove or exclude the unsafe path. |
| `FORGE_MARKETPLACE_NOT_TRACKED` | The repository-selected marketplace is not tracked by Forge. | No | Run `forge setup` and create or explicitly adopt the registration. |
| `FORGE_EVALUATION_INVALID` | The evaluation expired, belongs to another repository, or contains an unknown candidate. | Yes | Run a fresh evaluation and confirm the new selection. |
| `FORGE_APM_STATE_INVALID` | APM returned success but did not produce valid expected repository state. | No | Inspect APM diagnostics and repository state before retrying. |
| `FORGE_OPERATION_CANCELLED` | User or caller cancelled. | Yes | Re-run when ready. |
| `FORGE_EXTERNAL_TOOL_FAILED` | APM or harness returned a failure. | Depends | Review redacted stderr and tool-specific guidance. |
| `FORGE_PROTOCOL_UNSUPPORTED` | Caller requested an unsupported MCP contract major version. | No | Update CLI or plugin. |
