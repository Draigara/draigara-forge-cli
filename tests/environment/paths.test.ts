import { describe, expect, it } from "vitest";
import { getForgeDirectories } from "../../src/environment/paths.js";

describe("getForgeDirectories", () => {
  it("uses the Linux XDG state directory when supplied", () => {
    expect(getForgeDirectories({
      platform: "linux",
      homeDirectory: "/home/draig",
      environment: { XDG_STATE_HOME: "/state", XDG_CACHE_HOME: "/cache" }
    })).toEqual({ state: "/state/draigara/forge", cache: "/cache/draigara/forge" });
  });

  it("uses LOCALAPPDATA on Windows", () => {
    expect(getForgeDirectories({
      platform: "win32",
      homeDirectory: "C:/Users/draig",
      environment: { LOCALAPPDATA: "C:/Local" }
    })).toEqual({ state: "C:\\Local\\Draigara\\Forge", cache: "C:\\Local\\Draigara\\Forge\\cache" });
  });
});
