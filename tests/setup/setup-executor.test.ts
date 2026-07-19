import { describe, expect, it } from "vitest";
import { executeSetupPlan } from "../../src/setup/setup-executor.js";
import type { SetupOperation } from "../../src/setup/setup-planner.js";

describe("executeSetupPlan", () => {
  it("journals operations and commits only after the complete plan succeeds", async () => {
    const events: string[] = [];
    const operations: SetupOperation[] = [
      { kind: "install-forge", version: "1.0.0" },
      { kind: "add-marketplace", id: "draigara-openapm", source: "C:/openapm" },
      { kind: "install-plugin", targets: ["claude"] }
    ];

    await executeSetupPlan(operations, {
      writeJournal: async (completed) => { events.push(`journal:${completed.join(",")}`); },
      clearJournal: async () => { events.push("clear"); },
      verifyApm: async () => { events.push("apm"); },
      installForge: async () => { events.push("forge"); },
      addMarketplace: async () => { events.push("marketplace"); return true; },
      adoptMarketplace: async () => { events.push("adopt"); },
      removeMarketplace: async () => { events.push("rollback"); },
      installPlugin: async () => { events.push("plugin"); },
      refreshPlugin: async () => { events.push("refresh"); },
      commit: async () => { events.push("commit"); }
    });

    expect(events).toEqual([
      "journal:", "forge", "journal:install-forge", "marketplace",
      "journal:install-forge,add-marketplace", "plugin",
      "journal:install-forge,add-marketplace,install-plugin", "commit", "clear"
    ]);
  });

  it("rolls back only marketplaces added during the failed operation", async () => {
    const events: string[] = [];
    await expect(executeSetupPlan([
      { kind: "add-marketplace", id: "draigara-openapm", source: "C:/openapm" },
      { kind: "install-plugin", targets: ["claude"] }
    ], {
      writeJournal: async () => undefined,
      clearJournal: async () => { events.push("clear"); },
      verifyApm: async () => undefined,
      installForge: async () => undefined,
      addMarketplace: async () => true,
      adoptMarketplace: async () => undefined,
      removeMarketplace: async (id) => { events.push(`remove:${id}`); },
      installPlugin: async () => { throw new Error("plugin failed"); },
      refreshPlugin: async () => undefined,
      commit: async () => { events.push("commit"); }
    })).rejects.toThrow("plugin failed");

    expect(events).toEqual(["remove:draigara-openapm", "clear"]);
  });

  it("never rolls back a pre-existing adopted marketplace", async () => {
    const events: string[] = [];
    await expect(executeSetupPlan([
      { kind: "adopt-marketplace", id: "acme-apm", source: "https://acme.test/marketplace.json" },
      { kind: "install-plugin", targets: ["codex"] }
    ], {
      writeJournal: async () => undefined,
      clearJournal: async () => { events.push("clear"); },
      verifyApm: async () => undefined,
      installForge: async () => undefined,
      addMarketplace: async () => true,
      adoptMarketplace: async () => { events.push("adopt"); },
      removeMarketplace: async () => { events.push("remove"); },
      installPlugin: async () => { throw new Error("plugin failed"); },
      refreshPlugin: async () => undefined,
      commit: async () => undefined
    })).rejects.toThrow("plugin failed");

    expect(events).toEqual(["adopt", "clear"]);
  });

  it("executes an explicit plugin refresh operation", async () => {
    const events: string[] = [];
    await executeSetupPlan([
      { kind: "refresh-plugin", targets: ["copilot", "codex"] }
    ], {
      writeJournal: async () => undefined,
      clearJournal: async () => undefined,
      verifyApm: async () => undefined,
      installForge: async () => undefined,
      addMarketplace: async () => true,
      adoptMarketplace: async () => undefined,
      removeMarketplace: async () => undefined,
      installPlugin: async () => undefined,
      refreshPlugin: async (targets) => { events.push(`refresh:${targets.join(",")}`); },
      commit: async () => undefined
    });

    expect(events).toEqual(["refresh:copilot,codex"]);
  });
});
