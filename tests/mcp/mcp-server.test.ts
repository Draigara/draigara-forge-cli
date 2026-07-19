import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createForgeMcpServer } from "../../src/mcp/server.js";

describe("Forge MCP server", () => {
  it("advertises the versioned Forge tool contract with safety annotations", async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createForgeMcpServer();
    const client = new Client({ name: "forge-test", version: "1.0.0" });
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.listTools();

    expect(result.tools.map((tool) => tool.name)).toEqual([
      "forge_environment_inspect",
      "forge_repository_inspect",
      "forge_repository_initialize",
      "forge_marketplace_search",
      "forge_installation_plan",
      "forge_installation_apply",
      "forge_status"
    ]);
    expect(result.tools.find((tool) => tool.name === "forge_repository_inspect")?.annotations?.readOnlyHint).toBe(true);
    expect(result.tools.find((tool) => tool.name === "forge_installation_apply")?.annotations?.destructiveHint).toBe(true);

    await client.close();
    await server.close();
  });

  it("creates minimal forge.yaml through the conversational plugin boundary", async () => {
    const repositoryRoot = await mkdtemp(join(tmpdir(), "forge-mcp-"));
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createForgeMcpServer();
    const client = new Client({ name: "forge-test", version: "1.0.0" });
    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({
      name: "forge_repository_initialize",
      arguments: { repositoryRoot, marketplaceId: "draigara-openapm" }
    });

    expect(result.isError).not.toBe(true);
    expect(await readFile(join(repositoryRoot, "forge.yaml"), "utf8")).toContain("id: draigara-openapm");
    await client.close();
    await server.close();
  });
});
