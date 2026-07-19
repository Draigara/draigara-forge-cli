import { posix, win32 } from "node:path";

export interface ForgeDirectoryOptions {
  readonly platform: NodeJS.Platform;
  readonly homeDirectory: string;
  readonly environment: NodeJS.ProcessEnv;
}

export interface ForgeDirectories {
  readonly state: string;
  readonly cache: string;
}

export function getForgeDirectories(options: ForgeDirectoryOptions): ForgeDirectories {
  if (options.platform === "win32") {
    const local = options.environment.LOCALAPPDATA ?? win32.join(options.homeDirectory, "AppData", "Local");
    const state = win32.join(local, "Draigara", "Forge");
    return { state, cache: win32.join(state, "cache") };
  }
  if (options.platform === "darwin") {
    return {
      state: posix.join(options.homeDirectory, "Library", "Application Support", "Draigara", "Forge"),
      cache: posix.join(options.homeDirectory, "Library", "Caches", "Draigara", "Forge")
    };
  }
  return {
    state: posix.join(options.environment.XDG_STATE_HOME ?? posix.join(options.homeDirectory, ".local", "state"), "draigara", "forge"),
    cache: posix.join(options.environment.XDG_CACHE_HOME ?? posix.join(options.homeDirectory, ".cache"), "draigara", "forge")
  };
}
