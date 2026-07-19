import { createHash, randomUUID } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { hostname, homedir } from "node:os";
import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { ApmClient } from "../apm/apm-client.js";
import { forgeChannel, forgeCommit, forgeVersion } from "../build-identity.js";
import { locateApm } from "../diagnostics/doctor.js";
import { getForgeDirectories } from "../environment/paths.js";
import { readMarketplaceCatalog, type MarketplaceCandidate } from "../marketplaces/catalog.js";
import { initializeForgeYaml, readForgeYaml } from "../repository/forge-yaml.js";
import { inspectRepository } from "../repository/inspector.js";
import { ForgeStateStore } from "../state/state-store.js";

const repositoryInput = z.object({ repositoryRoot: z.string().min(1).max(4096) }).strict();
const targetSchema = z.enum(["codex", "claude", "copilot"]);

interface InstallationRequest {
  readonly repositoryRoot: string;
  readonly packages: readonly string[];
  readonly targets: readonly string[];
}

export interface ForgeMcpDependencies {
  readonly stateStore?: ForgeStateStore;
  readonly installPackages?: (request: InstallationRequest) => Promise<void>;
  readonly readCatalog?: typeof readMarketplaceCatalog;
  readonly now?: () => number;
}

interface EvaluatedCandidate extends MarketplaceCandidate { readonly id: string; }
interface Evaluation {
  readonly repositoryRoot: string;
  readonly marketplaceId: string;
  readonly catalogDigest: string;
  readonly expiresAt: number;
  readonly candidates: readonly EvaluatedCandidate[];
}

export function createForgeMcpServer(supplied: ForgeMcpDependencies = {}): McpServer {
  const server = new McpServer({ name: "draigara-forge", version: forgeVersion });
  const directories = getForgeDirectories({ platform: process.platform, homeDirectory: homedir(), environment: process.env });
  const stateStore = supplied.stateStore ?? new ForgeStateStore(process.env.FORGE_STATE_DIR ?? directories.state);
  const readCatalog = supplied.readCatalog ?? readMarketplaceCatalog;
  const installPackages = supplied.installPackages ?? installWithApm;
  const now = supplied.now ?? Date.now;
  const evaluations = new Map<string, Evaluation>();

  server.registerTool("forge_environment_inspect", {
    description: "Inspect the installed Forge environment without changing it.", inputSchema: z.object({}).strict(), annotations: readOnlyAnnotations
  }, async () => toolResult({
    contractVersion: "1.0", forge: { version: forgeVersion, channel: forgeChannel, commit: forgeCommit },
    runtime: { node: process.version, platform: process.platform, architecture: process.arch }, machine: hostname(), homeDirectory: homedir()
  }));

  server.registerTool("forge_marketplace_list", {
    description: "List machine marketplaces tracked by Forge, including provenance.", inputSchema: z.object({}).strict(), annotations: readOnlyAnnotations
  }, async () => withErrors(async () => ({ contractVersion: "1.0", marketplaces: (await stateStore.load()).managedMarketplaces })));

  server.registerTool("forge_repository_inspect", {
    description: "Read bounded deterministic repository evidence and Forge configuration.", inputSchema: repositoryInput, annotations: readOnlyAnnotations
  }, async ({ repositoryRoot }) => withErrors(async () => {
    const root = resolve(repositoryRoot);
    let configuration = null;
    try { configuration = await readForgeYaml(resolve(root, "forge.yaml")); } catch (error) { if (!isMissingFile(error)) throw error; }
    return { contractVersion: "1.0", repositoryRoot: root, configuration, evidence: await inspectRepository(root) };
  }));

  server.registerTool("forge_repository_initialize", {
    description: "Create a minimal forge.yaml when one does not already exist.",
    inputSchema: repositoryInput.extend({ marketplaceId: z.string().min(1).max(64) }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ repositoryRoot, marketplaceId }) => withErrors(async () => ({
    contractVersion: "1.0", repositoryRoot: resolve(repositoryRoot), ...await initializeForgeYaml(resolve(repositoryRoot), marketplaceId)
  })));

  server.registerTool("forge_marketplace_candidates", {
    description: "Return bounded candidates from the repository-selected marketplace for this evaluation only.",
    inputSchema: repositoryInput.extend({ query: z.string().max(512).default("") }).strict(), annotations: readOnlyAnnotations
  }, async ({ repositoryRoot, query }) => withErrors(async () => {
    const root = resolve(repositoryRoot);
    const configuration = await readForgeYaml(resolve(root, "forge.yaml"));
    const tracked = (await stateStore.load()).managedMarketplaces.find((item) => item.id === configuration.marketplace.id);
    if (tracked === undefined) throw forgeError("FORGE_MARKETPLACE_NOT_TRACKED", `Marketplace '${configuration.marketplace.id}' is not tracked by Forge. Run forge setup.`);
    const catalog = await readCatalog(tracked.source, query);
    const evaluationId = randomUUID();
    const candidates = catalog.candidates.map((candidate, index) => ({
      ...candidate,
      id: createHash("sha256").update(`${evaluationId}:${index}:${candidate.name}`, "utf8").digest("base64url").slice(0, 22)
    }));
    evaluations.set(evaluationId, { repositoryRoot: root, marketplaceId: configuration.marketplace.id, catalogDigest: catalog.digest, candidates, expiresAt: now() + 10 * 60_000 });
    return { contractVersion: "1.0", evaluationId, marketplaceId: configuration.marketplace.id, catalogDigest: catalog.digest, candidates };
  }));

  server.registerTool("forge_installation_apply", {
    description: "Install an explicitly confirmed top-level selection from the current evaluation through APM.",
    inputSchema: repositoryInput.extend({
      evaluationId: z.string().min(1).max(128), candidateIds: z.array(z.string().min(1).max(128)).min(1).max(128),
      targets: z.array(targetSchema).min(1).max(3), confirmed: z.literal(true)
    }).strict(),
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true }
  }, async ({ repositoryRoot, evaluationId, candidateIds, targets }) => withErrors(async () => {
    const root = resolve(repositoryRoot);
    const evaluation = evaluations.get(evaluationId);
    if (evaluation === undefined || evaluation.expiresAt <= now() || evaluation.repositoryRoot !== root) {
      throw forgeError("FORGE_EVALUATION_INVALID", "The evaluation is missing, expired, or belongs to another repository.");
    }
    const selected = candidateIds.map((id) => evaluation.candidates.find((candidate) => candidate.id === id));
    if (selected.some((candidate) => candidate === undefined)) throw forgeError("FORGE_EVALUATION_INVALID", "The selection contains a candidate outside this evaluation.");
    const packages = (selected as EvaluatedCandidate[]).map((candidate) => `${candidate.name}@${evaluation.marketplaceId}`);
    await installPackages({ repositoryRoot: root, packages, targets });
    await verifyApmState(root, packages);
    evaluations.delete(evaluationId);
    return { contractVersion: "1.0", repositoryRoot: root, installed: packages, targets, verified: true };
  }));

  server.registerTool("forge_status", {
    description: "Inspect repository Forge configuration and APM-owned state.", inputSchema: repositoryInput, annotations: readOnlyAnnotations
  }, async ({ repositoryRoot }) => withErrors(async () => {
    const root = resolve(repositoryRoot);
    let configuration = null;
    try { configuration = await readForgeYaml(resolve(root, "forge.yaml")); } catch (error) { if (!isMissingFile(error)) throw error; }
    return {
      contractVersion: "1.0", repositoryRoot: root, configuration,
      apm: { manifest: await exists(resolve(root, "apm.yml")), lockfile: await exists(resolve(root, "apm.lock.yaml")) }
    };
  }));

  return server;
}

async function installWithApm(request: InstallationRequest): Promise<void> {
  const executable = await locateApm(process.env);
  if (executable === null) throw forgeError("FORGE_APM_UNAVAILABLE", "APM was not found. Run forge setup.");
  await new ApmClient(executable).installPackages(request.packages, request.targets, request.repositoryRoot);
}

async function verifyApmState(repositoryRoot: string, packages: readonly string[]): Promise<void> {
  const manifestText = await readFile(resolve(repositoryRoot, "apm.yml"), "utf8");
  const lockText = await readFile(resolve(repositoryRoot, "apm.lock.yaml"), "utf8");
  const manifest = parseYaml(manifestText) as unknown;
  const lockfile = parseYaml(lockText) as unknown;
  if (manifest === null || typeof manifest !== "object" || lockfile === null || typeof lockfile !== "object") {
    throw forgeError("FORGE_APM_STATE_INVALID", "APM did not produce valid manifest and lock state.");
  }
  for (const locator of packages) {
    const packageName = locator.split("@")[0]!;
    if (!manifestText.includes(packageName)) throw forgeError("FORGE_APM_STATE_INVALID", `APM manifest does not contain '${packageName}'.`);
  }
}

const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

async function withErrors(action: () => Promise<Record<string, unknown>>) {
  try { return toolResult(await action()); }
  catch (error) {
    const value = error instanceof ForgeToolError ? { code: error.code, message: error.message } : { code: "FORGE_OPERATION_FAILED", message: error instanceof Error ? error.message : String(error) };
    return { isError: true, ...toolResult(value) };
  }
}

function toolResult(value: Record<string, unknown>) { return { content: [{ type: "text" as const, text: JSON.stringify(value) }] }; }

class ForgeToolError extends Error { public constructor(public readonly code: string, message: string) { super(message); } }
function forgeError(code: string, message: string): ForgeToolError { return new ForgeToolError(code, message); }
function isMissingFile(error: unknown): boolean { return error instanceof Error && "code" in error && error.code === "ENOENT"; }
async function exists(path: string): Promise<boolean> { try { await access(path); return true; } catch { return false; } }
