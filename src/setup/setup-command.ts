import { homedir } from "node:os";
import { z } from "zod";
import { ApmClient } from "../apm/apm-client.js";
import { resolveNpmInvocation } from "../bootstrap/npm-invocation.js";
import { forgeVersion } from "../build-identity.js";
import { runDoctor, locateApm, type DoctorResult } from "../diagnostics/doctor.js";
import { getForgeDirectories } from "../environment/paths.js";
import { renderBrand } from "../interaction/brand.js";
import { ConsoleSetupInteraction, RecordingSetupInteraction, type SetupInteraction } from "../interaction/setup-interaction.js";
import { runProcess } from "../processes/process-runner.js";
import { ForgeStateStore, type ManagedMarketplace } from "../state/state-store.js";
import { detectHarnesses } from "../targets/target-detector.js";
import { executeSetupPlan, SetupRecoveryRequiredError } from "./setup-executor.js";
import { createSetupPlan, MarketplaceConflictError } from "./setup-planner.js";

const SUPPORTED_TARGETS = ["codex", "claude", "copilot"] as const;
const DEFAULT_MARKETPLACE_ID = "draigara-openapm";
const DEFAULT_MARKETPLACE_SOURCE = "https://raw.githubusercontent.com/Draigara/draigara-openapm/main/.claude-plugin/marketplace.json";
const DEFAULT_PLUGIN_LOCATOR = "draigara-forge@draigara-openapm";

interface SetupApmClient {
  version(workingDirectory: string): Promise<{ readonly version: string }>;
  targets(workingDirectory: string): Promise<readonly { readonly id: string }[]>;
  listMarketplaces(): Promise<readonly { readonly id: string; readonly source: string }[]>;
  addMarketplace(id: string, source: string, workingDirectory: string): Promise<void>;
  removeMarketplace(id: string, workingDirectory: string): Promise<void>;
  listGlobalPackages(): Promise<readonly { readonly locator: string; readonly targets: readonly string[] }[]>;
  installGlobalPlugin(locator: string, targets: readonly string[], workingDirectory: string): Promise<void>;
  updateGlobalPlugin(locator: string, targets: readonly string[], workingDirectory: string): Promise<void>;
}

export interface SetupRuntime {
  readonly locateApm: (environment: NodeJS.ProcessEnv) => Promise<string | null>;
  readonly installApm?: () => Promise<void>;
  readonly createApmClient: (path: string) => SetupApmClient;
  readonly getGloballyInstalledForgeVersion: () => Promise<string | null>;
  readonly installGlobalForge: (version: string) => Promise<void>;
  readonly reconcileCopilotMcp: () => Promise<void>;
  readonly stateStore: ForgeStateStore;
  readonly doctor: (environment: NodeJS.ProcessEnv) => Promise<DoctorResult>;
}

export interface SetupCommandOptions {
  readonly targets: readonly string[];
  readonly marketplaces?: readonly string[];
  readonly nonInteractive: boolean;
  readonly color: boolean;
  readonly yes: boolean;
  readonly environment?: NodeJS.ProcessEnv;
}

export interface SetupCommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export async function runSetupCommand(
  options: SetupCommandOptions,
  suppliedRuntime?: SetupRuntime,
  suppliedInteraction?: SetupInteraction
): Promise<SetupCommandResult> {
  const environment = options.environment ?? process.env;
  const runtime = suppliedRuntime ?? createDefaultRuntime(environment);
  const interactive = !options.nonInteractive && process.stdout.isTTY === true;
  const interaction = suppliedInteraction ?? (suppliedRuntime === undefined
    ? new ConsoleSetupInteraction({ interactive })
    : new RecordingSetupInteraction({ interactive }));
  const brand = renderBrand({ columns: process.stdout.columns ?? 0, color: options.color, interactive });
  interaction.showBrand(brand);
  let targets = unique(options.targets);
  if (targets.some((target) => !SUPPORTED_TARGETS.includes(target as typeof SUPPORTED_TARGETS[number]))) {
    return result(2, interaction, `Supported preview targets are: ${SUPPORTED_TARGETS.join(", ")}.`);
  }
  if (interaction.interactive && targets.length === 0) {
    const detections = await interaction.task(
      "Detecting supported coding harnesses",
      async () => (await detectHarnesses({
        homeDirectory: homedir(), pathValue: environment.PATH ?? "", platform: process.platform
      })).filter((target) => SUPPORTED_TARGETS.includes(target.id as typeof SUPPORTED_TARGETS[number])),
      (found) => {
        const count = found.filter((target) => target.detected).length;
        return `Detected ${count} supported coding harness${count === 1 ? "" : "es"}`;
      }
    );
    const selection = await interaction.selectTargets(
      "Where should Forge be available?",
      detections.map((target) => ({
        value: target.id,
        label: target.id,
        hint: target.detected ? "detected" : "not detected",
        selected: target.detected
      }))
    );
    if (selection === null) return result(130, interaction, "Forge setup cancelled.");
    targets = [...selection];
  }
  if (targets.length === 0) return result(3, interaction, "Setup requires at least one explicit target.");
  if (options.nonInteractive && !options.yes) return result(3, interaction, "Non-interactive setup requires --yes.");

  const requestedMarketplaces = options.marketplaces?.length
    ? options.marketplaces.map(parseMarketplaceArgument)
    : [{ id: DEFAULT_MARKETPLACE_ID, source: environment.FORGE_DEFAULT_MARKETPLACE_SOURCE ?? DEFAULT_MARKETPLACE_SOURCE }];
  let apmPath = await interaction.task(
    "Checking for Microsoft APM",
    async () => runtime.locateApm(environment),
    (path) => path === null ? "Microsoft APM is not installed" : `Microsoft APM found at ${path}`
  );
  if (apmPath === null) {
    if (environment.FORGE_APM_PATH !== undefined || runtime.installApm === undefined) {
      return result(4, interaction, "APM was not found. Install APM 0.26 with `uv tool install apm-cli==0.26.0`, then rerun Forge setup.");
    }
    if (!options.yes) {
      if (!interaction.interactive) return result(3, interaction, "Installing APM requires authorization. Rerun with --yes.");
      interaction.info("Forge uses Microsoft APM to manage marketplaces and plugins. APM 0.26 is required and will be installed for this user with uv.");
      const approved = await interaction.confirm("Install the Microsoft APM prerequisite now?");
      if (approved !== true) return result(3, interaction, "APM installation declined.");
    }
    try {
      await interaction.task("Installing Microsoft APM 0.26", runtime.installApm, () => "Microsoft APM 0.26 installed");
    } catch (error) {
      return result(5, interaction, error instanceof Error ? error.message : String(error));
    }
    apmPath = await interaction.task(
      "Verifying the APM installation",
      async () => runtime.locateApm(environment),
      (path) => path === null ? "APM command is not available" : `APM is ready at ${path}`
    );
    if (apmPath === null) return result(4, interaction, "APM installation completed but the apm command is not available on PATH. Open a new terminal and rerun Forge setup.");
  }

  const client = runtime.createApmClient(apmPath);
  try {
    const identity = await interaction.task(
      "Checking APM compatibility",
      async () => client.version(process.cwd()),
      (found) => `APM ${found.version} is compatible`
    );
    if (!isSupportedApmVersion(identity.version)) {
      return result(4, interaction, `APM ${identity.version} is incompatible; Forge requires >=0.26.0 <0.27.0.`);
    }
    const current = await interaction.task("Inspecting current Forge and APM state", async () => {
      const [state, registrations, globalPackages, globallyInstalledForgeVersion] = await Promise.all([
        runtime.stateStore.load(),
        client.listMarketplaces(),
        client.listGlobalPackages(),
        runtime.getGloballyInstalledForgeVersion()
      ]);
      return { state, registrations, globalPackages, globallyInstalledForgeVersion };
    }, () => "Current Forge and APM state inspected");
    const pluginLocator = environment.FORGE_PLUGIN_LOCATOR ?? DEFAULT_PLUGIN_LOCATOR;
    const installedPlugin = current.globalPackages.find((item) => item.locator === pluginLocator);
    const plan = createSetupPlan({
      invokedForgeVersion: forgeVersion,
      globallyInstalledForgeVersion: current.globallyInstalledForgeVersion,
      apm: { installedVersion: identity.version, requiredVersion: "0.26.x" },
      selectedTargets: targets,
      installedPluginTargets: installedPlugin?.targets ?? [],
      marketplaces: requestedMarketplaces.map((marketplace) => ({
        ...marketplace,
        currentSource: current.registrations.find((item) => item.id === marketplace.id)?.source ?? null,
        managed: current.state.managedMarketplaces.some((item) => item.id === marketplace.id && item.source === marketplace.source)
      }))
    });
    const planText = renderPlan(targets, requestedMarketplaces, plan.operations);
    interaction.showPlan(planText);
    if (!options.yes) {
      if (!interaction.interactive) return result(3, interaction, "Setup requires confirmation. Rerun with --yes.");
      const approved = await interaction.confirm("Apply this setup plan?");
      if (approved !== true) return result(3, interaction, "Forge setup declined.");
    }

    const pending: ManagedMarketplace[] = [];
    const release = await runtime.stateStore.acquireLock({ timeoutMs: 5_000, retryMs: 50 });
    try {
      await interaction.task(`Applying ${plan.operations.length} setup change${plan.operations.length === 1 ? "" : "s"}`, async () => executeSetupPlan(plan.operations, {
        writeJournal: async (completed) => runtime.stateStore.writeRecoveryJournal({
          schemaVersion: 1,
          operationId: "setup",
          startedAt: new Date().toISOString(),
          completedOperations: [...completed]
        }),
        clearJournal: async () => runtime.stateStore.clearRecoveryJournal(),
        verifyApm: async () => undefined,
        installForge: async (version) => runtime.installGlobalForge(version),
        addMarketplace: async (id, source) => {
          await client.addMarketplace(id, source, process.cwd());
          pending.push(marketplaceRecord(id, source, "forge-created", identity.version));
          return true;
        },
        adoptMarketplace: async (id, source) => {
          pending.push(marketplaceRecord(id, source, "adopted", identity.version));
        },
        removeMarketplace: async (id) => client.removeMarketplace(id, process.cwd()),
        installPlugin: async (selectedTargets) => {
          await client.installGlobalPlugin(pluginLocator, selectedTargets, process.cwd());
          if (selectedTargets.includes("copilot")) await runtime.reconcileCopilotMcp();
        },
        refreshPlugin: async (selectedTargets) => {
          await client.updateGlobalPlugin(pluginLocator, selectedTargets, process.cwd());
          if (selectedTargets.includes("copilot")) await runtime.reconcileCopilotMcp();
        },
        commit: async () => {
          const current = await runtime.stateStore.load();
          const pendingIds = new Set(pending.map((item) => item.id));
          await runtime.stateStore.commit({
            ...current,
            managedMarketplaces: [...current.managedMarketplaces.filter((item) => !pendingIds.has(item.id)), ...pending],
            lastSuccessfulSetup: new Date().toISOString()
          });
        }
      }), () => "Setup changes applied");
    } finally {
      await release();
    }
    const doctor = await interaction.task(
      "Running Forge doctor",
      async () => runtime.doctor(environment),
      (health) => health.exitCode === 0 ? "Forge doctor passed" : "Forge doctor found issues"
    );
    for (const line of doctor.lines) interaction.info(line);
    for (const warning of doctor.warnings) interaction.warning(warning);
    interaction.success("Forge is ready.\n\nOpen Copilot, Claude or Codex in a repository and run the Forge plugin's init workflow.");
    return fromInteraction(doctor.exitCode, interaction);
  } catch (error) {
    if (error instanceof MarketplaceConflictError) return result(7, interaction, error.message);
    if (error instanceof SetupRecoveryRequiredError) return result(7, interaction, error.message);
    const message = error instanceof Error ? error.message : String(error);
    return result(6, interaction, message);
  }
}

function createDefaultRuntime(environment: NodeJS.ProcessEnv): SetupRuntime {
  const directories = getForgeDirectories({ platform: process.platform, homeDirectory: homedir(), environment });
  return {
    locateApm,
    installApm: installApmWithUv,
    createApmClient: (path) => new ApmClient(path),
    getGloballyInstalledForgeVersion: readGlobalForgeVersion,
    installGlobalForge: installGlobalForge,
    reconcileCopilotMcp,
    stateStore: new ForgeStateStore(environment.FORGE_STATE_DIR ?? directories.state),
    doctor: runDoctor
  };
}

async function installApmWithUv(): Promise<void> {
  const executable = process.platform === "win32" ? "uv.exe" : "uv";
  const response = await runProcess({
    file: executable,
    arguments: ["tool", "install", "apm-cli==0.26.0"],
    timeoutMs: 120_000,
    maxOutputBytes: 1024 * 1024
  });
  if (response.exitCode !== 0) {
    throw new Error(`APM installation failed. Install it with 'uv tool install apm-cli==0.26.0' and retry. ${response.stderr.trim()}`);
  }
}

async function readGlobalForgeVersion(): Promise<string | null> {
  const npm = await npmInvocation();
  const response = await runProcess({ file: npm.file, arguments: [...npm.arguments, "list", "--global", "@draigara/forge", "--depth=0", "--json"], timeoutMs: 20_000, maxOutputBytes: 256 * 1024 });
  try {
    const schema = z.object({ dependencies: z.record(z.string(), z.object({ version: z.string() }).passthrough()).optional() }).passthrough();
    return schema.parse(JSON.parse(response.stdout)).dependencies?.["@draigara/forge"]?.version ?? null;
  } catch {
    return null;
  }
}

async function installGlobalForge(version: string): Promise<void> {
  const npm = await npmInvocation();
  const response = await runProcess({ file: npm.file, arguments: [...npm.arguments, "install", "--global", `@draigara/forge@${version}`], timeoutMs: 120_000, maxOutputBytes: 1024 * 1024 });
  if (response.exitCode !== 0) throw new Error(`npm global installation failed: ${response.stderr.trim()}`);
}

async function reconcileCopilotMcp(): Promise<void> {
  const current = await runProcess({ file: "copilot", arguments: ["mcp", "get", "forge", "--json"], timeoutMs: 10_000, maxOutputBytes: 256 * 1024 }).catch(() => null);
  if (current?.exitCode === 0) return;
  const added = await runProcess({ file: "copilot", arguments: ["mcp", "add", "forge", "--", "forge", "mcp"], timeoutMs: 10_000, maxOutputBytes: 256 * 1024 });
  if (added.exitCode !== 0) throw new Error(`Copilot MCP registration failed: ${added.stderr.trim()}`);
}

function parseMarketplaceArgument(value: string): { readonly id: string; readonly source: string } {
  const separator = value.indexOf("=");
  if (separator <= 0 || separator === value.length - 1) throw new Error(`Invalid marketplace '${value}'; expected <id>=<source>.`);
  return { id: value.slice(0, separator), source: value.slice(separator + 1) };
}

function marketplaceRecord(id: string, source: string, origin: "forge-created" | "adopted", apmVersion: string): ManagedMarketplace {
  return { id, source, origin, addedAt: new Date().toISOString(), forgeVersion, apmVersion };
}

function isSupportedApmVersion(version: string): boolean {
  return /^0\.26\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version);
}

function renderPlan(
  targets: readonly string[],
  marketplaces: readonly { id: string; source: string }[],
  operations: readonly import("./setup-planner.js").SetupOperation[]
): string {
  const changes = operations.length === 0
    ? "    - No changes"
    : operations.map((operation) => `    - ${describeOperation(operation)}`).join("\n");
  return `Setup plan\n  Targets: ${targets.join(", ")}\n  Marketplaces:\n${marketplaces.map((item) => `    ${item.id} = ${item.source}`).join("\n")}\n  Changes:\n${changes}`;
}

function describeOperation(operation: import("./setup-planner.js").SetupOperation): string {
  if (operation.kind === "verify-apm") return `Verify APM ${operation.version}`;
  if (operation.kind === "install-forge") return `Install Forge CLI ${operation.version} globally`;
  if (operation.kind === "add-marketplace") return `Add marketplace ${operation.id}`;
  if (operation.kind === "adopt-marketplace") return `Track existing marketplace ${operation.id}`;
  if (operation.kind === "install-plugin") return `Install Forge plugin for ${operation.targets.join(", ")}`;
  return `Refresh Forge plugin for ${operation.targets.join(", ")}`;
}

function result(exitCode: number, interaction: SetupInteraction, message: string): SetupCommandResult {
  interaction.warning(message);
  return fromInteraction(exitCode, interaction);
}

function fromInteraction(exitCode: number, interaction: SetupInteraction): SetupCommandResult {
  const output = interaction.snapshot();
  return { exitCode, stdout: output.stdout, stderr: output.stderr };
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

async function npmInvocation() {
  return await resolveNpmInvocation({
    platform: process.platform,
    nodeExecutable: process.execPath,
    environment: process.env
  });
}
