import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runSetupCommand, type SetupRuntime } from "../../src/setup/setup-command.js";
import { ForgeStateStore } from "../../src/state/state-store.js";

describe("runSetupCommand", () => {
  it("reconciles a complete non-interactive setup and commits provenance", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-setup-"));
    const events: string[] = [];
    let registrations: { id: string; source: string }[] = [];
    const stateStore = new ForgeStateStore(directory);
    const runtime: SetupRuntime = {
      locateApm: async () => "apm",
      createApmClient: () => ({
        version: async () => ({ version: "0.26.0" }),
        targets: async () => [{ id: "codex", active: true, source: ".codex", deployDirectory: ".codex", needs: null }],
        listMarketplaces: async () => registrations,
        addMarketplace: async (id, source) => { events.push(`marketplace:${id}`); registrations = [{ id, source }]; },
        removeMarketplace: async (id) => { registrations = registrations.filter((item) => item.id !== id); },
        listGlobalPackages: async () => [],
        installGlobalPlugin: async (_locator, targets) => { events.push(`plugin:${targets.join(",")}`); }
      }),
      getGloballyInstalledForgeVersion: async () => null,
      installGlobalForge: async (version) => { events.push(`forge:${version}`); },
      reconcileCopilotMcp: async () => undefined,
      stateStore,
      doctor: async () => ({ exitCode: 0, lines: ["✓ ready"], warnings: [] })
    };

    const result = await runSetupCommand({
      targets: ["codex"],
      marketplaces: ["acme-apm=https://acme.test/marketplace.json"],
      nonInteractive: true,
      color: false,
      yes: true,
      environment: {}
    }, runtime);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("acme-apm");
    expect(result.stdout).toContain("Forge is ready");
    expect(events).toEqual([
      "forge:0.1.0-preview.1",
      "marketplace:acme-apm",
      "plugin:codex"
    ]);
    expect((await stateStore.load()).managedMarketplaces[0]).toMatchObject({
      id: "acme-apm",
      origin: "forge-created"
    });
  });

  it("adopts an existing company marketplace without invoking APM add", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-setup-"));
    let added = false;
    const runtime: SetupRuntime = {
      locateApm: async () => "apm",
      createApmClient: () => ({
        version: async () => ({ version: "0.26.0" }),
        targets: async () => [],
        listMarketplaces: async () => [{ id: "acme-apm", source: "https://acme.test/marketplace.json" }],
        addMarketplace: async () => { added = true; },
        removeMarketplace: async () => undefined,
        listGlobalPackages: async () => [{ locator: "draigara-forge@draigara-openapm", targets: ["codex"] }],
        installGlobalPlugin: async () => undefined
      }),
      getGloballyInstalledForgeVersion: async () => "0.1.0-preview.1",
      installGlobalForge: async () => undefined,
      reconcileCopilotMcp: async () => undefined,
      stateStore: new ForgeStateStore(directory),
      doctor: async () => ({ exitCode: 0, lines: ["✓ ready"], warnings: [] })
    };

    const result = await runSetupCommand({
      targets: ["codex"], marketplaces: ["acme-apm=https://acme.test/marketplace.json"],
      nonInteractive: true, color: false, yes: true, environment: {}
    }, runtime);

    expect(result.exitCode).toBe(0);
    expect(added).toBe(false);
    expect((await runtime.stateStore.load()).managedMarketplaces[0]?.origin).toBe("adopted");
  });

  it("rejects unsupported APM before any mutation", async () => {
    let mutated = false;
    const runtime = {
      locateApm: async () => "apm",
      createApmClient: () => ({ version: async () => ({ version: "0.27.0" }) }),
      getGloballyInstalledForgeVersion: async () => null,
      installGlobalForge: async () => { mutated = true; },
      reconcileCopilotMcp: async () => undefined,
      stateStore: new ForgeStateStore(await mkdtemp(join(tmpdir(), "forge-setup-"))),
      doctor: async () => ({ exitCode: 0, lines: [], warnings: [] })
    } as unknown as SetupRuntime;

    const result = await runSetupCommand({
      targets: ["codex"], marketplaces: [], nonInteractive: true, color: false, yes: true, environment: {}
    }, runtime);

    expect(result.exitCode).toBe(4);
    expect(result.stderr).toContain(">=0.26.0 <0.27.0");
    expect(mutated).toBe(false);
  });

  it("installs APM through the documented uv path when non-interactive setup is authorized", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-setup-"));
    const events: string[] = [];
    let locateCalls = 0;
    const runtime = {
      locateApm: async () => ++locateCalls === 1 ? null : "apm",
      installApm: async () => { events.push("install-apm"); },
      createApmClient: () => ({
        version: async () => ({ version: "0.26.0" }),
        targets: async () => [],
        listMarketplaces: async () => [],
        addMarketplace: async (id: string) => { events.push(`marketplace:${id}`); },
        removeMarketplace: async () => undefined,
        listGlobalPackages: async () => [{ locator: "draigara-forge@draigara-openapm", targets: ["codex"] }],
        installGlobalPlugin: async () => undefined
      }),
      getGloballyInstalledForgeVersion: async () => "0.1.0-preview.1",
      installGlobalForge: async () => undefined,
      reconcileCopilotMcp: async () => undefined,
      stateStore: new ForgeStateStore(directory),
      doctor: async () => ({ exitCode: 0, lines: ["ready"], warnings: [] })
    } as unknown as SetupRuntime;

    const result = await runSetupCommand({
      targets: ["codex"], marketplaces: [], nonInteractive: true, color: false, yes: true, environment: {}
    }, runtime);

    expect(result.exitCode).toBe(0);
    expect(events[0]).toBe("install-apm");
    expect(locateCalls).toBe(2);
  });
});
