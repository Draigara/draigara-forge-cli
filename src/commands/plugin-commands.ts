import { ApmClient } from "../apm/apm-client.js";
import { locateApm } from "../diagnostics/doctor.js";
import type { CommandResult } from "./marketplace-commands.js";

export type PluginCommand = "install" | "list" | "update" | "remove";

export async function runPluginCommand(kind: PluginCommand, targets: readonly string[]): Promise<CommandResult> {
  const apmPath = await locateApm(process.env);
  if (apmPath === null) return { exitCode: 4, stdout: "", stderr: "APM was not found. Run forge setup first.\n" };
  const locator = process.env.FORGE_PLUGIN_LOCATOR ?? "draigara-forge@draigara-openapm";
  if ((kind === "install" || kind === "remove") && targets.length === 0) {
    return { exitCode: 3, stdout: "", stderr: `forge plugin ${kind} requires at least one explicit --target.\n` };
  }
  const client = new ApmClient(apmPath);
  const workingDirectory = process.cwd();
  try {
    if (kind === "list") {
      const packages = (await client.listGlobalPackages()).filter((item) => item.locator === locator);
      return {
        exitCode: 0,
        stdout: packages.length === 0 ? "Forge plugin is not installed.\n" : `${packages.map((item) => `${item.locator}\t${item.targets.join(",")}`).join("\n")}\n`,
        stderr: ""
      };
    }
    if (kind === "install") await client.installGlobalPlugin(locator, targets, workingDirectory);
    else if (kind === "update") {
      const installed = (await client.listGlobalPackages()).find((item) => item.locator === locator);
      if (installed === undefined) return { exitCode: 4, stdout: "", stderr: "Forge plugin is not installed. Run forge setup first.\n" };
      await client.updateGlobalPlugin(locator, installed.targets, workingDirectory);
    }
    else await client.removeGlobalPlugin(locator, workingDirectory);
    return { exitCode: 0, stdout: `Forge plugin ${kind} complete.\n`, stderr: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { exitCode: 4, stdout: "", stderr: `APM compatibility failure: ${message}\n` };
  }
}
