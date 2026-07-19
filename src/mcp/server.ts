import { hostname, homedir } from "node:os";
import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { forgeChannel, forgeCommit, forgeVersion } from "../build-identity.js";
import { initializeForgeYaml, readForgeYaml } from "../repository/forge-yaml.js";

const repositoryInput = z.object({ repositoryRoot: z.string().min(1).max(4096) }).strict();

export function createForgeMcpServer(): McpServer {
  const server = new McpServer({ name: "draigara-forge", version: forgeVersion });

  server.registerTool("forge_environment_inspect", {
    description: "Inspect the installed Forge environment without changing it.",
    inputSchema: z.object({}).strict(),
    annotations: readOnlyAnnotations
  }, async () => toolResult({
    contractVersion: "1.0",
    forge: { version: forgeVersion, channel: forgeChannel, commit: forgeCommit },
    runtime: { node: process.version, platform: process.platform, architecture: process.arch },
    machine: hostname(),
    homeDirectory: homedir()
  }));

  server.registerTool("forge_repository_inspect", {
    description: "Read bounded deterministic Forge repository configuration.",
    inputSchema: repositoryInput,
    annotations: readOnlyAnnotations
  }, async ({ repositoryRoot }) => {
    const root = resolve(repositoryRoot);
    try {
      return toolResult({ contractVersion: "1.0", repositoryRoot: root, configuration: await readForgeYaml(resolve(root, "forge.yaml")) });
    } catch (error) {
      if (isMissingFile(error)) return toolResult({ contractVersion: "1.0", repositoryRoot: root, configuration: null });
      throw error;
    }
  });

  server.registerTool("forge_repository_initialize", {
    description: "Create a minimal forge.yaml when one does not already exist.",
    inputSchema: repositoryInput.extend({ marketplaceId: z.string().min(1).max(64) }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ repositoryRoot, marketplaceId }) => toolResult({
    contractVersion: "1.0",
    repositoryRoot: resolve(repositoryRoot),
    ...await initializeForgeYaml(resolve(repositoryRoot), marketplaceId)
  }));

  registerUnavailableReadTool(server, "forge_marketplace_search", "Search a registered APM marketplace.");
  registerUnavailableReadTool(server, "forge_installation_plan", "Create a bounded APM installation plan.");
  server.registerTool("forge_installation_apply", {
    description: "Apply a previously approved installation plan.",
    inputSchema: z.object({ planToken: z.string().min(1).max(16_384) }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true }
  }, async () => unavailableResult("FORGE_APM_PROTOCOL_UNAVAILABLE"));
  registerUnavailableReadTool(server, "forge_status", "Inspect repository Forge and APM status.");

  return server;
}

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
} as const;

function registerUnavailableReadTool(server: McpServer, name: string, description: string): void {
  server.registerTool(name, {
    description,
    inputSchema: repositoryInput,
    annotations: readOnlyAnnotations
  }, async () => unavailableResult("FORGE_APM_PROTOCOL_UNAVAILABLE"));
}

function toolResult(value: Record<string, unknown>) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

function unavailableResult(code: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: JSON.stringify({ code, message: "The required structured APM contract is unavailable." }) }]
  };
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
