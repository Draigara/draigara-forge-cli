import { z } from "zod";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { runProcess, type ProcessRequest, type ProcessResult } from "../processes/process-runner.js";

const apmTargetSchema = z.object({
  target: z.string().min(1),
  status: z.enum(["active", "inactive"]),
  source: z.string().nullable(),
  deploy_dir: z.string().min(1),
  needs: z.string().nullable()
}).strict();

const apmTargetsSchema = z.array(apmTargetSchema).max(128);
const apmMarketplaceRegistrySchema = z.object({
  marketplaces: z.array(z.object({
    name: z.string().min(1).max(128),
    url: z.string().min(1).max(4096),
    ref: z.string().max(256).optional(),
    path: z.string().max(4096).optional()
  }).passthrough()).max(256)
}).strict();

const apmManifestSchema = z.object({
  targets: z.union([z.string(), z.array(z.string())]).optional(),
  dependencies: z.object({
    apm: z.array(z.union([
      z.string(),
      z.object({ name: z.string().optional(), source: z.string().optional() }).passthrough()
    ])).optional()
  }).passthrough().optional()
}).passthrough();

const apmLockSchema = z.object({
  dependencies: z.array(z.object({
    name: z.string().min(1),
    package_type: z.string().optional(),
    discovered_via: z.string().min(1).optional(),
    marketplace_plugin_name: z.string().min(1).optional()
  }).passthrough()).max(2048)
}).passthrough();

export interface ApmTarget {
  readonly id: string;
  readonly active: boolean;
  readonly source: string | null;
  readonly deployDirectory: string;
  readonly needs: string | null;
}

export type ProcessExecutor = (request: ProcessRequest) => Promise<ProcessResult>;

export interface ApmClientOptions {
  readonly execute?: ProcessExecutor;
  readonly apmHome?: string;
  readonly readTextFile?: (path: string) => Promise<string>;
}

export class ApmInvocationError extends Error {
  public constructor(public readonly result: ProcessResult) {
    super(`APM exited with code ${result.exitCode ?? "unknown"}.`);
    this.name = "ApmInvocationError";
  }
}

export class ApmClient {
  readonly #execute: ProcessExecutor;
  readonly #apmHome: string;
  readonly #readTextFile: (path: string) => Promise<string>;

  public constructor(
    private readonly executable: string,
    options: ApmClientOptions | ProcessExecutor = {}
  ) {
    if (typeof options === "function") {
      this.#execute = options;
      this.#apmHome = join(homedir(), ".apm");
      this.#readTextFile = (path) => readFile(path, "utf8");
    } else {
      this.#execute = options.execute ?? runProcess;
      this.#apmHome = options.apmHome ?? join(homedir(), ".apm");
      this.#readTextFile = options.readTextFile ?? ((path) => readFile(path, "utf8"));
    }
  }

  public async version(workingDirectory: string, signal?: AbortSignal) {
    const result = await this.invoke(["--version"], workingDirectory, signal);
    const match = /^Agent Package Manager \(APM\) CLI version (\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)\r?\n?$/.exec(result.stdout);
    if (match?.[1] === undefined) throw new Error("Received unexpected APM version output.");
    return { version: match[1] };
  }

  public async targets(workingDirectory: string, signal?: AbortSignal): Promise<readonly ApmTarget[]> {
    const result = await this.invoke(["targets", "--json"], workingDirectory, signal);
    return apmTargetsSchema.parse(JSON.parse(result.stdout)).map((target) => ({
      id: target.target,
      active: target.status === "active",
      source: target.source,
      deployDirectory: target.deploy_dir,
      needs: target.needs
    }));
  }

  public async addMarketplace(id: string, source: string, workingDirectory: string, signal?: AbortSignal): Promise<void> {
    await this.invoke(["marketplace", "add", source, "--name", id], workingDirectory, signal);
    const registered = (await this.listMarketplaces()).find((item) => item.id === id);
    if (registered?.source !== source) throw new Error(`APM did not register marketplace '${id}' with the expected source.`);
  }

  public async listMarketplaces(): Promise<readonly { id: string; source: string }[]> {
    try {
      const content = await this.#readTextFile(join(this.#apmHome, "marketplaces.json"));
      return apmMarketplaceRegistrySchema.parse(JSON.parse(content)).marketplaces.map((entry) => ({
        id: entry.name,
        source: entry.url
      }));
    } catch (error) {
      if (isMissingFile(error)) return [];
      throw new Error("APM marketplace registry is invalid or unsupported.", { cause: error });
    }
  }

  public async updateMarketplace(id: string, workingDirectory: string, signal?: AbortSignal) {
    await this.invoke(["marketplace", "update", id], workingDirectory, signal);
  }

  public async removeMarketplace(id: string, workingDirectory: string, signal?: AbortSignal) {
    await this.invoke(["marketplace", "remove", id, "--yes"], workingDirectory, signal);
    if ((await this.listMarketplaces()).some((item) => item.id === id)) {
      throw new Error(`APM did not remove marketplace '${id}'.`);
    }
  }

  public async listGlobalPackages() {
    try {
      const manifest = apmManifestSchema.parse(parseYaml(await this.#readTextFile(join(this.#apmHome, "apm.yml"))));
      const targets = typeof manifest.targets === "string" ? [manifest.targets] : manifest.targets ?? [];
      try {
        const lock = apmLockSchema.parse(parseYaml(await this.#readTextFile(join(this.#apmHome, "apm.lock.yaml"))));
        const marketplacePackages = lock.dependencies.filter((dependency) =>
          dependency.package_type === "marketplace_plugin"
          && dependency.discovered_via !== undefined);
        if (marketplacePackages.length > 0) {
          return marketplacePackages.map((dependency) => ({
            locator: `${dependency.marketplace_plugin_name ?? dependency.name}@${dependency.discovered_via}`,
            targets
          }));
        }
      } catch (error) {
        if (!isMissingFile(error)) throw error;
      }
      return (manifest.dependencies?.apm ?? []).map((dependency) => ({
        locator: typeof dependency === "string" ? dependency : dependency.name ?? dependency.source ?? "",
        targets
      })).filter((dependency) => dependency.locator.length > 0);
    } catch (error) {
      if (isMissingFile(error)) return [];
      throw new Error("APM global manifest is invalid or unsupported.", { cause: error });
    }
  }

  public async installGlobalPlugin(locator: string, targets: readonly string[], workingDirectory: string, signal?: AbortSignal) {
    await this.invoke(["install", locator, "--global", "--target", targets.join(","), "--trust-transitive-mcp"], workingDirectory, signal);
  }

  public async updateGlobalPlugin(locator: string, workingDirectory: string, signal?: AbortSignal) {
    await this.invoke(["update", locator, "--global", "--yes"], workingDirectory, signal);
  }

  public async installPackages(locators: readonly string[], targets: readonly string[], workingDirectory: string, signal?: AbortSignal): Promise<void> {
    if (locators.length === 0) return;
    await this.invoke(["install", ...locators, "--target", targets.join(","), "--trust-transitive-mcp"], workingDirectory, signal);
  }

  public async removeGlobalPlugin(locator: string, workingDirectory: string, signal?: AbortSignal) {
    await this.invoke(["uninstall", locator, "--global"], workingDirectory, signal);
  }

  private async invoke(argumentsList: readonly string[], cwd: string, signal?: AbortSignal): Promise<ProcessResult> {
    const result = await this.#execute({
      file: this.executable,
      arguments: argumentsList,
      cwd,
      timeoutMs: 30_000,
      maxOutputBytes: 1024 * 1024,
      ...(signal === undefined ? {} : { signal })
    });
    if (result.exitCode !== 0) throw new ApmInvocationError(result);
    return result;
  }
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
