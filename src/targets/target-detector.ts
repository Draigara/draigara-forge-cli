import { access } from "node:fs/promises";
import { delimiter, join } from "node:path";

export interface HarnessDetectionOptions {
  readonly homeDirectory: string;
  readonly pathValue: string;
  readonly platform: NodeJS.Platform;
}

export interface HarnessDetection {
  readonly id: string;
  readonly detected: boolean;
  readonly signals: readonly string[];
}

const profiles = [
  { id: "copilot", commands: ["copilot"], configs: [".copilot"] },
  { id: "claude", commands: ["claude"], configs: [".claude"] },
  { id: "cursor", commands: ["cursor"], configs: [".cursor"] },
  { id: "codex", commands: ["codex"], configs: [".codex"] },
  { id: "gemini", commands: ["gemini"], configs: [".gemini"] },
  { id: "opencode", commands: ["opencode"], configs: [".config/opencode"] },
  { id: "windsurf", commands: ["windsurf"], configs: [".codeium/windsurf"] },
  { id: "kiro", commands: ["kiro"], configs: [".kiro"] }
] as const;

export async function detectHarnesses(options: HarnessDetectionOptions): Promise<readonly HarnessDetection[]> {
  const directories = options.pathValue.split(delimiter).filter(Boolean);
  const extensions = options.platform === "win32" ? [".cmd", ".exe", ".bat", ""] : [""];

  return await Promise.all(profiles.map(async (profile) => {
    const signals: string[] = [];
    for (const command of profile.commands) {
      const executable = await findExecutable(command, directories, extensions);
      if (executable !== undefined) signals.push(`command:${executable}`);
    }
    for (const config of profile.configs) {
      const path = join(options.homeDirectory, ...config.split("/"));
      if (await exists(path)) signals.push(`config:${path}`);
    }
    return { id: profile.id, detected: signals.length > 0, signals };
  }));
}

async function findExecutable(command: string, directories: readonly string[], extensions: readonly string[]): Promise<string | undefined> {
  for (const directory of directories) {
    for (const extension of extensions) {
      const candidate = join(directory, `${command}${extension}`);
      if (await exists(candidate)) return candidate;
    }
  }
  return undefined;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
