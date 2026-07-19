import { describe, expect, it } from "vitest";
import { ApmClient } from "../../src/apm/apm-client.js";
import type { ProcessRequest, ProcessResult } from "../../src/processes/process-runner.js";

describe("ApmClient", () => {
  it("uses APM's documented structured target protocol", async () => {
    const requests: ProcessRequest[] = [];
    const execute = async (request: ProcessRequest): Promise<ProcessResult> => {
      requests.push(request);
      return {
        exitCode: 0,
        stdout: JSON.stringify([
          { target: "claude", status: "active", source: ".claude", deploy_dir: ".claude", needs: null },
          { target: "codex", status: "inactive", source: null, deploy_dir: ".codex", needs: ".codex" }
        ]),
        stderr: "",
        timedOut: false,
        cancelled: false
      };
    };
    const client = new ApmClient("C:/Tools/apm.exe", execute);

    const targets = await client.targets("C:/repo");

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      file: "C:/Tools/apm.exe",
      arguments: ["targets", "--json"],
      cwd: "C:/repo"
    });
    expect(targets).toHaveLength(2);
    expect(targets[0]).toMatchObject({ id: "claude", active: true });
  });

  it("maps marketplace registration to the proposed structured APM contract", async () => {
    const requests: ProcessRequest[] = [];
    const execute = async (request: ProcessRequest): Promise<ProcessResult> => {
      requests.push(request);
      return {
        exitCode: 0,
        stdout: JSON.stringify({ schemaVersion: 1, id: "draigara-openapm", source: "C:/marketplace", changed: true }),
        stderr: "",
        timedOut: false,
        cancelled: false
      };
    };
    const client = new ApmClient("apm", execute);

    const registration = await client.addMarketplace("draigara-openapm", "C:/marketplace", "C:/work");

    expect(requests[0]?.arguments).toEqual([
      "marketplace", "add", "C:/marketplace", "--name", "draigara-openapm", "--json"
    ]);
    expect(registration.changed).toBe(true);
  });

  it("keeps all global lifecycle operations on JSON-only APM commands", async () => {
    const argumentsSeen: readonly string[][] = [];
    const mutableArguments = argumentsSeen as string[][];
    const execute = async (request: ProcessRequest): Promise<ProcessResult> => {
      mutableArguments.push([...request.arguments]);
      const isVersion = request.arguments.join(" ") === "--version --json";
      const isList = request.arguments.join(" ") === "marketplace list --json";
      const isDependencies = request.arguments.join(" ") === "deps list --global --json";
      const stdout = isVersion
        ? JSON.stringify({ schemaVersion: 1, version: "0.26.0", protocolVersion: "1.0" })
        : isList
        ? JSON.stringify({ schemaVersion: 1, marketplaces: [{ id: "draigara-openapm", source: "C:/marketplace" }] })
        : isDependencies
          ? JSON.stringify({ schemaVersion: 1, packages: [{ locator: "forge-plugin@draigara-openapm", targets: ["claude"] }] })
          : JSON.stringify({ schemaVersion: 1, changed: true });
      return { exitCode: 0, stdout, stderr: "", timedOut: false, cancelled: false };
    };
    const client = new ApmClient("apm", execute);

    expect((await client.version("C:/work")).version).toBe("0.26.0");
    expect(await client.listMarketplaces("C:/work")).toHaveLength(1);
    await client.updateMarketplace("draigara-openapm", "C:/work");
    await client.removeMarketplace("draigara-openapm", "C:/work");
    expect(await client.listGlobalPackages("C:/work")).toHaveLength(1);
    await client.installGlobalPlugin("forge-plugin@draigara-openapm", ["claude", "codex"], "C:/work");
    await client.updateGlobalPlugin("forge-plugin@draigara-openapm", "C:/work");
    await client.removeGlobalPlugin("forge-plugin@draigara-openapm", ["claude"], "C:/work");

    expect(argumentsSeen).toEqual([
      ["--version", "--json"],
      ["marketplace", "list", "--json"],
      ["marketplace", "update", "draigara-openapm", "--json"],
      ["marketplace", "remove", "draigara-openapm", "--yes", "--json"],
      ["deps", "list", "--global", "--json"],
      ["install", "forge-plugin@draigara-openapm", "--global", "--target", "claude,codex", "--yes", "--json"],
      ["update", "forge-plugin@draigara-openapm", "--global", "--yes", "--json"],
      ["uninstall", "forge-plugin@draigara-openapm", "--global", "--target", "claude", "--yes", "--json"]
    ]);
  });
});
