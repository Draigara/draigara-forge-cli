# Proposed CLI Repository Layout

**Repository:** `draigara-forge-cli`  
**Status:** Specification  
**Audience:** product owners, architects, maintainers, coding agents, security reviewers, and contributors


```text
.
├── .github/
│   ├── workflows/
│   │   ├── docs.yml
│   │   ├── build.yml
│   │   ├── release.yml
│   │   └── security.yml
│   └── dependabot.yml
├── docs/
│   ├── adr/
│   ├── architecture.md
│   ├── bridge-protocol.md
│   ├── commands.md
│   └── ...
├── eng/
│   ├── versions.props
│   ├── publish.ps1
│   ├── publish.sh
│   └── release-manifest.schema.json
├── fixtures/
│   ├── apm/
│   ├── harnesses/
│   ├── repositories/
│   └── protocol/
├── packaging/
│   ├── macos/
│   ├── windows/
│   └── linux/
├── schemas/
│   ├── forge.schema.v1.json
│   └── bridge/
├── src/
│   ├── Draigara.Forge.Cli/
│   ├── Draigara.Forge.Application/
│   ├── Draigara.Forge.Domain/
│   ├── Draigara.Forge.Infrastructure/
│   ├── Draigara.Forge.Protocol/
│   ├── Draigara.Forge.RepositoryAnalysis/
│   ├── Draigara.Forge.Harnesses.Abstractions/
│   └── Draigara.Forge.Harnesses.Copilot/
├── tests/
│   ├── Draigara.Forge.UnitTests/
│   ├── Draigara.Forge.Protocol.Tests/
│   ├── Draigara.Forge.IntegrationTests/
│   ├── Draigara.Forge.NativeAot.Tests/
│   └── Draigara.Forge.EndToEndTests/
├── Directory.Build.props
├── Directory.Packages.props
├── global.json
└── Draigara.Forge.slnx
```

Each project must have a clear reason to exist. Do not split by imagined future micro-boundaries. Begin with fewer projects if necessary and extract only when dependency direction or Native AOT constraints justify it.
