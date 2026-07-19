import { access } from "node:fs/promises";
import { delimiter, dirname, join } from "node:path";

export interface NpmInvocation {
  readonly file: string;
  readonly arguments: readonly string[];
}

export interface NpmInvocationOptions {
  readonly platform: NodeJS.Platform;
  readonly nodeExecutable: string;
  readonly environment: NodeJS.ProcessEnv;
  readonly exists?: (path: string) => Promise<boolean>;
}

export async function resolveNpmInvocation(options: NpmInvocationOptions): Promise<NpmInvocation> {
  if (options.platform !== "win32") return { file: "npm", arguments: [] };

  const exists = options.exists ?? pathExists;
  const candidates = [
    options.environment.npm_execpath,
    join(dirname(options.nodeExecutable), "node_modules", "npm", "bin", "npm-cli.js"),
    ...(options.environment.PATH ?? "").split(delimiter).filter(Boolean).map((directory) =>
      join(directory, "node_modules", "npm", "bin", "npm-cli.js"))
  ].filter((candidate): candidate is string => candidate !== undefined && /\.(?:c?js|mjs)$/i.test(candidate));

  for (const candidate of [...new Set(candidates)]) {
    if (await exists(candidate)) return { file: options.nodeExecutable, arguments: [candidate] };
  }

  throw new Error("npm's JavaScript entrypoint was not found beside Node or on PATH.");
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
