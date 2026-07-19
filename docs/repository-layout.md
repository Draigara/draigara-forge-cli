# Repository layout

```text
src/
  apm/ bootstrap/ commands/ diagnostics/ environment/
  interaction/ marketplaces/ mcp/ plans/ processes/
  repository/ setup/ state/ targets/
tests/                 # mirrors production feature boundaries
schemas/mcp/v1/        # public MCP JSON schemas
fixtures/mcp/v1/       # golden protocol examples
fixtures/terminal/     # reviewed terminal art
docs/adr/              # architecture decisions
tools/                 # deterministic validation and package smoke tests
```

This remains one production package. New packages require a real independent consumer and a clear dependency boundary.
