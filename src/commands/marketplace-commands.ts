import { homedir } from "node:os";
import { ApmClient } from "../apm/apm-client.js";
import { forgeVersion } from "../build-identity.js";
import { locateApm } from "../diagnostics/doctor.js";
import { getForgeDirectories } from "../environment/paths.js";
import { MarketplaceService } from "../marketplaces/marketplace-service.js";
import { reconcileMarketplaces } from "../marketplaces/reconcile.js";
import { ForgeStateStore } from "../state/state-store.js";

export type MarketplaceCommand =
  | { readonly kind: "add"; readonly id: string; readonly source: string; readonly adoptExisting?: boolean }
  | { readonly kind: "list" }
  | { readonly kind: "update"; readonly id: string }
  | { readonly kind: "remove"; readonly id: string };

export interface CommandResult {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
}

export async function runMarketplaceCommand(command: MarketplaceCommand): Promise<CommandResult> {
  const apmPath = await locateApm(process.env);
  if (apmPath === null) return { exitCode: 4, stdout: "", stderr: "APM was not found. Run forge setup first.\n" };
  const client = new ApmClient(apmPath);
  const directories = getForgeDirectories({ platform: process.platform, homeDirectory: homedir(), environment: process.env });
  const stateStore = new ForgeStateStore(process.env.FORGE_STATE_DIR ?? directories.state);
  const workingDirectory = process.cwd();
  try {
    if (command.kind === "list") {
      const state = await stateStore.load();
      const actual = await client.listMarketplaces();
      const reconciled = reconcileMarketplaces(state.managedMarketplaces, actual);
      const lines = reconciled.map((item) => `${item.id}\t${item.status}\t${item.source}`);
      return { exitCode: 0, stdout: lines.length === 0 ? "No marketplaces registered.\n" : `${lines.join("\n")}\n`, stderr: "" };
    }
    const state = await stateStore.load();
    if (command.kind === "add") {
      const version = await client.version(workingDirectory);
      const service = new MarketplaceService(client, stateStore, {
        forgeVersion,
        apmVersion: version.version,
        workingDirectory,
        now: () => new Date()
      });
      const result = await service.add(command.id, command.source, { adoptExisting: command.adoptExisting === true });
      return { exitCode: 0, stdout: `${command.id}\t${result.status}\n`, stderr: "" };
    }
    const managed = state.managedMarketplaces.find((item) => item.id === command.id);
    if (managed === undefined) return { exitCode: 7, stdout: "", stderr: `Marketplace '${command.id}' is unmanaged; Forge will not modify it.\n` };
    const actual = (await client.listMarketplaces()).find((item) => item.id === command.id);
    if (actual?.source !== managed.source) return { exitCode: 7, stdout: "", stderr: `Marketplace '${command.id}' conflicts with the Forge ledger.\n` };
    if (command.kind === "update" && managed.origin === "adopted") {
      return { exitCode: 7, stdout: "", stderr: `Marketplace '${command.id}' is adopted; Forge will not refresh its APM registration.\n` };
    }
    if (command.kind === "update") {
      const version = await client.version(workingDirectory);
      const service = new MarketplaceService(client, stateStore, {
        forgeVersion,
        apmVersion: version.version,
        workingDirectory,
        now: () => new Date()
      });
      const result = await service.update(command.id);
      return { exitCode: 0, stdout: `${command.id}\t${result.status}\n`, stderr: "" };
    }
    const version = await client.version(workingDirectory);
    const service = new MarketplaceService(client, stateStore, {
      forgeVersion,
      apmVersion: version.version,
      workingDirectory,
      now: () => new Date()
    });
    const result = await service.remove(command.id);
    return { exitCode: 0, stdout: `${command.id}\t${result.status}\n`, stderr: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { exitCode: 4, stdout: "", stderr: `APM compatibility failure: ${message}\n` };
  }
}
