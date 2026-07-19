# Commands

## Machine setup

`forge setup` detects APM and supported coding harnesses, proposes Draigara OpenAPM Community (`draigara-openapm`), installs or refreshes the Forge plugin globally through documented APM mechanisms, validates Git, and runs doctor. Rerunning it reconciles machine state and deliberately refreshes the already-installed global Forge plugin so marketplace release changes can be picked up.

`--non-interactive` prohibits prompts and requires explicit inputs. `--yes` authorizes prerequisite installation and the displayed plan in non-interactive automation. `--target` and `--marketplace` are repeatable where documented. In an interactive missing-APM flow, Forge asks once to install APM, then performs discovery, displays the complete Forge plan, and asks again before Forge mutations.

## Lifecycle

- `forge marketplace add|list|update|remove`
- `forge plugin install|list|update|remove`
- `forge doctor`
- `forge --version`

There is no public machine-level `forge init`. In a repository, use the installed plugin's `/forge init`; it may provide harness-native interaction and calls the versioned MCP tools underneath.

Exit codes are 0 success/no change, 2 invalid input, 3 missing/declined authorization, 4 incompatible or absent APM, 5 trust/download failure, 6 child-process failure, 7 recovery required, and 130 cancellation.
