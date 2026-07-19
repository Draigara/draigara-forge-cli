import { describe, expect, it } from "vitest";
import { resolveNpmInvocation } from "../../src/bootstrap/npm-invocation.js";

describe("resolveNpmInvocation", () => {
  it("invokes npm's JavaScript entrypoint through Node on Windows", async () => {
    const npmCli = "C:\\node\\node_modules\\npm\\bin\\npm-cli.js";

    await expect(resolveNpmInvocation({
      platform: "win32",
      nodeExecutable: "C:\\node\\node.exe",
      environment: {},
      exists: async (path) => path === npmCli
    })).resolves.toEqual({ file: "C:\\node\\node.exe", arguments: [npmCli] });
  });

  it("uses the npm executable directly outside Windows", async () => {
    await expect(resolveNpmInvocation({
      platform: "linux",
      nodeExecutable: "/usr/bin/node",
      environment: {},
      exists: async () => false
    })).resolves.toEqual({ file: "npm", arguments: [] });
  });
});
