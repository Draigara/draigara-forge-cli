import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createForgeMcpServer } from "../../src/mcp/server.js";
import { ForgeStateStore } from "../../src/state/state-store.js";

async function connectedServer(dependencies = {}) {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createForgeMcpServer(dependencies);
  const client = new Client({ name: "forge-test", version: "1.0.0" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return { client, server };
}

function jsonResult(result: Awaited<ReturnType<Client["callTool"]>>) {
  const content = result.content as { type: string; text: string }[];
  return JSON.parse(content[0]!.text) as Record<string, any>;
}

describe("Forge MCP server", () => {
  it("advertises the versioned Forge tool contract with safety annotations", async () => {
    const { client, server } = await connectedServer();

    const result = await client.listTools();

    expect(result.tools.map((tool) => tool.name)).toEqual([
      "forge_environment_inspect",
      "forge_marketplace_list",
      "forge_repository_inspect",
      "forge_repository_initialize",
      "forge_marketplace_candidates",
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
    const { client, server } = await connectedServer();

    const result = await client.callTool({
      name: "forge_repository_initialize",
      arguments: { repositoryRoot, marketplaceId: "draigara-openapm" }
    });

    expect(result.isError).not.toBe(true);
    expect(await readFile(join(repositoryRoot, "forge.yaml"), "utf8")).toContain("id: draigara-openapm");
    await client.close();
    await server.close();
  });

  it("returns opaque current-session candidates and applies the confirmed top-level selection", async () => {
    const repositoryRoot = await mkdtemp(join(tmpdir(), "forge-mcp-repo-"));
    const stateDirectory = await mkdtemp(join(tmpdir(), "forge-mcp-state-"));
    const marketplacePath = join(stateDirectory, "marketplace.json");
    await writeFile(join(repositoryRoot, "forge.yaml"), "schemaVersion: 1\nmarketplace:\n  id: acme-apm\n", "utf8");
    await writeFile(join(repositoryRoot, "package.json"), '{"scripts":{"test":"vitest"}}', "utf8");
    await writeFile(marketplacePath, JSON.stringify({
      name: "acme-apm",
      plugins: [
        { name: "draigara-forge", description: "bootstrap", version: "0.1.0", source: "./forge", tags: ["scope-global"] },
        { name: "acme-security", description: "Security review", version: "1.0.0", source: "./security", tags: ["kind-skill", "scope-repository", "target-codex", "security"] }
      ]
    }), "utf8");
    const stateStore = new ForgeStateStore(stateDirectory);
    await stateStore.commit({
      schemaVersion: 1, revision: 0,
      managedMarketplaces: [{
        id: "acme-apm", source: marketplacePath, origin: "adopted",
        addedAt: "2026-07-19T00:00:00.000Z", forgeVersion: "0.1.0-preview.0", apmVersion: "0.26.0"
      }]
    });
    const installs: unknown[] = [];
    const { client, server } = await connectedServer({
      stateStore,
      installPackages: async (request: unknown) => {
        installs.push(request);
        await writeFile(join(repositoryRoot, "apm.yml"), "dependencies:\n  apm:\n    - acme-security@acme-apm\n", "utf8");
        await writeFile(join(repositoryRoot, "apm.lock.yaml"), "lockfileVersion: 1\n", "utf8");
      }
    });

    const inspected = jsonResult(await client.callTool({ name: "forge_repository_inspect", arguments: { repositoryRoot } }));
    expect(inspected.evidence.manifests).toContain("package.json");

    const evaluation = jsonResult(await client.callTool({
      name: "forge_marketplace_candidates",
      arguments: { repositoryRoot, query: "security" }
    }));
    expect(evaluation.marketplaceId).toBe("acme-apm");
    expect(evaluation.candidates).toHaveLength(1);
    expect(evaluation.candidates[0]).toMatchObject({ name: "acme-security", scope: "repository", kind: "skill" });
    expect(evaluation.candidates[0].id).not.toBe("acme-security");

    const applied = jsonResult(await client.callTool({
      name: "forge_installation_apply",
      arguments: {
        repositoryRoot,
        evaluationId: evaluation.evaluationId,
        candidateIds: [evaluation.candidates[0].id],
        targets: ["codex"],
        confirmed: true
      }
    }));
    expect(applied).toMatchObject({ installed: ["acme-security@acme-apm"], verified: true });
    expect(installs).toEqual([{
      repositoryRoot,
      packages: ["acme-security@acme-apm"],
      targets: ["codex"]
    }]);

    await client.close();
    await server.close();
  });

  it("rejects a candidate that was not returned by the current evaluation", async () => {
    const repositoryRoot = await mkdtemp(join(tmpdir(), "forge-mcp-repo-"));
    const { client, server } = await connectedServer();
    const result = await client.callTool({
      name: "forge_installation_apply",
      arguments: { repositoryRoot, evaluationId: "missing", candidateIds: ["invented"], targets: ["codex"], confirmed: true }
    });

    expect(result.isError).toBe(true);
    expect(jsonResult(result).code).toBe("FORGE_EVALUATION_INVALID");
    await client.close();
    await server.close();
  });
});
