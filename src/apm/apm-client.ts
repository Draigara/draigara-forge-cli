import { z } from "zod";
import { runProcess, type ProcessRequest, type ProcessResult } from "../processes/process-runner.js";

const apmTargetSchema = z.object({
  target: z.string().min(1),
  status: z.enum(["active", "inactive"]),
  source: z.string().nullable(),
  deploy_dir: z.string().min(1),
  needs: z.string().nullable()
}).strict();

const apmTargetsSchema = z.array(apmTargetSchema).max(128);
const marketplaceMutationSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  source: z.string().min(1),
  changed: z.boolean()
}).strict();
const mutationSchema = z.object({ schemaVersion: z.literal(1), changed: z.boolean() }).strict();
const marketplaceListSchema = z.object({
  schemaVersion: z.literal(1),
  marketplaces: z.array(z.object({ id: z.string().min(1), source: z.string().min(1) }).strict()).max(256)
}).strict();
const globalPackageListSchema = z.object({
  schemaVersion: z.literal(1),
  packages: z.array(z.object({
    locator: z.string().min(1),
    targets: z.array(z.string().min(1)).max(128)
  }).strict()).max(1024)
}).strict();
const versionSchema = z.object({
  schemaVersion: z.literal(1),
  version: z.string().regex(/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/),
  protocolVersion: z.string().min(1)
}).strict();

export interface ApmTarget {
  readonly id: string;
  readonly active: boolean;
  readonly source: string | null;
  readonly deployDirectory: string;
  readonly needs: string | null;
}

export type ProcessExecutor = (request: ProcessRequest) => Promise<ProcessResult>;

export class ApmInvocationError extends Error {
  public constructor(public readonly result: ProcessResult) {
    super(`APM exited with code ${result.exitCode ?? "unknown"}.`);
    this.name = "ApmInvocationError";
  }
}

export class ApmClient {
  public constructor(
    private readonly executable: string,
    private readonly execute: ProcessExecutor = runProcess
  ) {}

  public async version(workingDirectory: string, signal?: AbortSignal) {
    const result = await this.invoke(["--version", "--json"], workingDirectory, signal);
    return versionSchema.parse(JSON.parse(result.stdout));
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

  public async addMarketplace(id: string, source: string, workingDirectory: string, signal?: AbortSignal) {
    const result = await this.invoke(
      ["marketplace", "add", source, "--name", id, "--json"],
      workingDirectory,
      signal
    );
    return marketplaceMutationSchema.parse(JSON.parse(result.stdout));
  }

  public async listMarketplaces(workingDirectory: string, signal?: AbortSignal) {
    const result = await this.invoke(["marketplace", "list", "--json"], workingDirectory, signal);
    return marketplaceListSchema.parse(JSON.parse(result.stdout)).marketplaces;
  }

  public async updateMarketplace(id: string, workingDirectory: string, signal?: AbortSignal) {
    return await this.mutate(["marketplace", "update", id, "--json"], workingDirectory, signal);
  }

  public async removeMarketplace(id: string, workingDirectory: string, signal?: AbortSignal) {
    return await this.mutate(["marketplace", "remove", id, "--yes", "--json"], workingDirectory, signal);
  }

  public async listGlobalPackages(workingDirectory: string, signal?: AbortSignal) {
    const result = await this.invoke(["deps", "list", "--global", "--json"], workingDirectory, signal);
    return globalPackageListSchema.parse(JSON.parse(result.stdout)).packages;
  }

  public async installGlobalPlugin(locator: string, targets: readonly string[], workingDirectory: string, signal?: AbortSignal) {
    return await this.mutate(
      ["install", locator, "--global", "--target", targets.join(","), "--yes", "--json"],
      workingDirectory,
      signal
    );
  }

  public async updateGlobalPlugin(locator: string, workingDirectory: string, signal?: AbortSignal) {
    return await this.mutate(["update", locator, "--global", "--yes", "--json"], workingDirectory, signal);
  }

  public async removeGlobalPlugin(locator: string, targets: readonly string[], workingDirectory: string, signal?: AbortSignal) {
    return await this.mutate(
      ["uninstall", locator, "--global", "--target", targets.join(","), "--yes", "--json"],
      workingDirectory,
      signal
    );
  }

  private async mutate(argumentsList: readonly string[], cwd: string, signal?: AbortSignal) {
    const result = await this.invoke(argumentsList, cwd, signal);
    return mutationSchema.parse(JSON.parse(result.stdout));
  }

  private async invoke(argumentsList: readonly string[], cwd: string, signal?: AbortSignal): Promise<ProcessResult> {
    const result = await this.execute({
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
