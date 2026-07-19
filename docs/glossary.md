# Glossary

**AI asset**  
A prompt, instruction, skill, agent, command, hook, MCP configuration, script, or other harness-deployable resource packaged through APM.

**APM**  
Microsoft Agent Package Manager. The package-management substrate used by Forge.

**APM marketplace**  
A discoverable source of APM packages. A developer may register several marketplaces globally; a repository selects one in `forge.yaml`.

**Bridge**  
The versioned, machine-readable CLI interface used by Forge plugins. It emits structured JSON/JSONL and is separate from human-oriented CLI output.

**Candidate**  
A real marketplace package returned during retrieval and eligible for recommendation.

**Capability**  
A user-facing outcome that a package may provide. Forge does not introduce a separate capability graph or resolver; APM package metadata remains authoritative.

**Cloud**  
Draigara Cloud, the optional enterprise control plane.

**Deterministic evidence**  
Facts gathered without model inference, such as project files, dependencies, manifests, paths, detected tools, documentation locations, and APM state.

**Evaluation**  
A fresh repository analysis followed by marketplace retrieval, ranking, explanation, developer selection, planning, confirmation, and optional installation.

**Forge CLI**  
The npm-distributed `forge` command that owns machine setup and the local Forge MCP server.

**Forge plugin**  
The package installed into an AI coding harness that implements the conversational repository workflow.

**Harness**  
An AI coding environment such as GitHub Copilot CLI, Claude Code, Codex, or another supported agent host.

**Marketplace registration**  
Machine-local configuration mapping a stable marketplace ID to a source and authentication strategy.

**Package composition**  
The downstream APM dependencies selected by a marketplace author. Forge must not recreate or interpret this graph.

**Plan token**  
A short-lived integrity token produced by the CLI bridge that binds an installation plan to a repository, marketplace, candidate selection, and catalogue state.

**Repository profile**  
An ephemeral model of what a repository currently is and intends to become. It is recomputed and never persisted as authoritative configuration.

**Top-level package**  
A package explicitly exposed by the selected marketplace and presented to the developer. Its transitive dependencies remain an APM concern.
