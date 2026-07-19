import { access } from "node:fs/promises";
import { homedir } from "node:os";
import { cancel, isCancel, multiselect } from "@clack/prompts";
import { renderBrand } from "../interaction/brand.js";
import { detectHarnesses } from "../targets/target-detector.js";

export interface SetupCommandOptions {
  readonly targets: readonly string[];
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

export async function runSetupCommand(options: SetupCommandOptions): Promise<SetupCommandResult> {
  const environment = options.environment ?? process.env;
  const interactive = !options.nonInteractive && process.stdout.isTTY === true;
  const brand = renderBrand({
    columns: process.stdout.columns ?? 0,
    color: options.color,
    interactive
  });
  let targets = [...options.targets];
  if (interactive && targets.length === 0) {
    const detections = await detectHarnesses({
      homeDirectory: homedir(),
      pathValue: environment.PATH ?? "",
      platform: process.platform
    });
    const selection = await multiselect({
      message: "Where should Forge be available?",
      options: detections.map((target) => ({
        value: target.id,
        label: target.id,
        hint: target.detected ? "detected" : "not detected"
      })),
      initialValues: detections.filter((target) => target.detected).map((target) => target.id),
      required: true
    });
    if (isCancel(selection)) {
      cancel("Forge setup cancelled.");
      return { exitCode: 130, stdout: `${brand}\n`, stderr: "" };
    }
    targets = selection;
  }
  const plan = [brand, "", "Setup plan", `  Targets: ${targets.join(", ")}`];

  const apmPath = environment.FORGE_APM_PATH;
  if (apmPath === undefined || !(await exists(apmPath))) {
    return {
      exitCode: 4,
      stdout: `${plan.join("\n")}\n`,
      stderr: "Forge cannot install APM until compatible APM release metadata is supplied for this platform.\n"
    };
  }

  return {
    exitCode: 5,
    stdout: `${plan.join("\n")}\n`,
    stderr: "Forge setup is blocked until the required structured APM lifecycle protocol is available.\n"
  };
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
