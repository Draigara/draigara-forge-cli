import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ApmClient } from "../../src/apm/apm-client.js";
import type { ProcessRequest, ProcessResult } from "../../src/processes/process-runner.js";

function successful(stdout = ""): ProcessResult {
  return { exitCode: 0, stdout, stderr: "", timedOut: false, cancelled: false };
}

describe("ApmClient", () => {
  it("strictly parses APM 0.26's documented version identity", async () => {
    const requests: ProcessRequest[] = [];
    const client = new ApmClient("apm", {
      apmHome: "C:/unused",
      execute: async (request) => {
        requests.push(request);
        return successful("Agent Package Manager (APM) CLI version 0.26.0\n");
      }
    });

    expect(await client.version("C:/work")).toEqual({ version: "0.26.0" });
    expect(requests[0]?.arguments).toEqual(["--version"]);
  });

  it("rejects extra or malformed version prose", async () => {
    const client = new ApmClient("apm", {
      apmHome: "C:/unused",
      execute: async () => successful("warning\nAgent Package Manager (APM) CLI version 0.26.0\n")
    });

    await expect(client.version("C:/work")).rejects.toThrow("unexpected APM version output");
  });

  it("uses APM's documented structured target protocol", async () => {
    const requests: ProcessRequest[] = [];
    const client = new ApmClient("apm", {
      apmHome: "C:/unused",
      execute: async (request) => {
        requests.push(request);
        return successful(JSON.stringify([
          { target: "claude", status: "active", source: ".claude", deploy_dir: ".claude", needs: null },
          { target: "codex", status: "inactive", source: null, deploy_dir: ".codex", needs: ".codex" }
        ]));
      }
    });

    const targets = await client.targets("C:/repo");

    expect(requests[0]).toMatchObject({ file: "apm", arguments: ["targets", "--json"], cwd: "C:/repo" });
    expect(targets).toHaveLength(2);
    expect(targets[0]).toMatchObject({ id: "claude", active: true });
  });

  it("reads the APM marketplace registry without parsing list output", async () => {
    const apmHome = await mkdtemp(join(tmpdir(), "forge-apm-"));
    await writeFile(join(apmHome, "marketplaces.json"), JSON.stringify({ marketplaces: [
      { name: "draigara-openapm", url: "https://example.test/marketplace.json", path: "" },
      { name: "acme-apm", url: "C:/catalog/marketplace.json", path: "" }
    ] }), "utf8");
    const client = new ApmClient("apm", {
      apmHome,
      execute: async () => { throw new Error("list must not invoke APM"); }
    });

    expect(await client.listMarketplaces()).toEqual([
      { id: "draigara-openapm", source: "https://example.test/marketplace.json" },
      { id: "acme-apm", source: "C:/catalog/marketplace.json" }
    ]);
  });

  it("reconstructs installed marketplace locators from APM 0.26's structured global lock", async () => {
    const apmHome = await mkdtemp(join(tmpdir(), "forge-apm-"));
    await writeFile(join(apmHome, "apm.yml"), [
      "name: home",
      "version: 1.0.0",
      "targets:",
      "  - codex",
      "dependencies:",
      "  apm:",
      "    - git: https://github.com/draigara/draigara-forge-plugin",
      "      ref: v0.1.0-preview.0"
    ].join("\n"), "utf8");
    await writeFile(join(apmHome, "apm.lock.yaml"), [
      "lockfile_version: '1'",
      "dependencies:",
      "  - name: draigara-forge",
      "    package_type: marketplace_plugin",
      "    discovered_via: draigara-openapm",
      "    marketplace_plugin_name: draigara-forge"
    ].join("\n"), "utf8");
    const client = new ApmClient("apm", { apmHome });

    expect(await client.listGlobalPackages()).toEqual([{
      locator: "draigara-forge@draigara-openapm",
      targets: ["codex"]
    }]);
  });

  it("uses documented lifecycle arguments and verifies marketplace mutations from structured state", async () => {
    const apmHome = await mkdtemp(join(tmpdir(), "forge-apm-"));
    await mkdir(apmHome, { recursive: true });
    await writeFile(join(apmHome, "marketplaces.json"), '{"marketplaces":[]}', "utf8");
    const argumentsSeen: string[][] = [];
    const client = new ApmClient("apm", {
      apmHome,
      execute: async (request) => {
        argumentsSeen.push([...request.arguments]);
        if (request.arguments[0] === "marketplace" && request.arguments[1] === "add") {
          await writeFile(join(apmHome, "marketplaces.json"), JSON.stringify({ marketplaces: [
            { name: "draigara-openapm", url: "https://example.test/marketplace.json", path: "" }
          ] }), "utf8");
        }
        if (request.arguments[0] === "marketplace" && request.arguments[1] === "remove") {
          await writeFile(join(apmHome, "marketplaces.json"), '{"marketplaces":[]}', "utf8");
        }
        return successful();
      }
    });

    await client.addMarketplace("draigara-openapm", "https://example.test/marketplace.json", "C:/work");
    await client.updateMarketplace("draigara-openapm", "C:/work");
    await client.installGlobalPlugin("draigara-forge@draigara-openapm", ["claude", "codex"], "C:/work");
    await client.updateGlobalPlugin("draigara-forge@draigara-openapm", "C:/work");
    await client.removeGlobalPlugin("draigara-forge@draigara-openapm", "C:/work");
    await client.removeMarketplace("draigara-openapm", "C:/work");

    expect(argumentsSeen).toEqual([
      ["marketplace", "add", "https://example.test/marketplace.json", "--name", "draigara-openapm"],
      ["marketplace", "update", "draigara-openapm"],
      ["install", "draigara-forge@draigara-openapm", "--global", "--target", "claude,codex", "--trust-transitive-mcp"],
      ["update", "draigara-forge@draigara-openapm", "--global", "--yes"],
      ["uninstall", "draigara-forge@draigara-openapm", "--global"],
      ["marketplace", "remove", "draigara-openapm", "--yes"]
    ]);
  });
});
