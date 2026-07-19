import { access } from "node:fs/promises";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";
import { runProcess } from "../processes/process-runner.js";
import { getForgeDirectories } from "../environment/paths.js";
import { ForgeStateStore } from "../state/state-store.js";

export interface DoctorResult {
  readonly exitCode: number;
  readonly lines: readonly string[];
  readonly warnings: readonly string[];
}

export async function runDoctor(environment: NodeJS.ProcessEnv = process.env): Promise<DoctorResult> {
  const lines = [`✓ Node.js ${process.version} (${process.platform}-${process.arch})`];
  const warnings: string[] = [];
  let recoveryRequired = false;
  const git = await runProcess({
    file: "git",
    arguments: ["--version"],
    timeoutMs: 5_000,
    maxOutputBytes: 16_384
  }).catch(() => null);
  if (git?.exitCode === 0) lines.push(`✓ Git ${git.stdout.trim().replace(/^git version\s+/, "")}`);
  else warnings.push("Git was not found on PATH.");

  const directories = getForgeDirectories({ platform: process.platform, homeDirectory: homedir(), environment });
  const stateStore = new ForgeStateStore(environment.FORGE_STATE_DIR ?? directories.state);
  try {
    await stateStore.load();
    const journal = await stateStore.loadRecoveryJournal();
    if (journal === null) lines.push("✓ Forge state healthy");
    else {
      lines.push("✗ Pending recovery operation");
      warnings.push(`Recovery operation '${journal.operationId}' requires review.`);
      recoveryRequired = true;
    }
  } catch {
    lines.push("✗ Forge state invalid");
    warnings.push("state.v1.json is invalid; restore the backup or move the corrupt file before retrying.");
    recoveryRequired = true;
  }

  const apm = await locateApm(environment);
  if (apm === null) {
    lines.push("✗ APM unavailable");
    warnings.push("APM was not found. Run forge setup to install a compatible release.");
    return { exitCode: recoveryRequired ? 7 : 4, lines, warnings };
  }
  lines.push(`✓ APM ${apm}`);
  return { exitCode: recoveryRequired ? 7 : warnings.length === 0 ? 0 : 2, lines, warnings };
}

export async function locateApm(environment: NodeJS.ProcessEnv): Promise<string | null> {
  if (environment.FORGE_APM_PATH !== undefined) {
    return await exists(environment.FORGE_APM_PATH) ? environment.FORGE_APM_PATH : null;
  }
  const extensions = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  for (const directory of (environment.PATH ?? "").split(delimiter).filter(Boolean)) {
    for (const extension of extensions) {
      const candidate = join(directory, `apm${extension}`);
      if (await exists(candidate)) return candidate;
    }
  }
  return null;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
