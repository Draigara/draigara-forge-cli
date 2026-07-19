import { describe, expect, it } from "vitest";
import { createSetupPlan } from "../../src/setup/setup-planner.js";

describe("createSetupPlan", () => {
  it("converges managed components to the invoked Forge release", () => {
    const plan = createSetupPlan({
      invokedForgeVersion: "1.2.0",
      globallyInstalledForgeVersion: "1.1.0",
      apm: { installedVersion: "0.26.0", requiredVersion: "0.26.0" },
      selectedTargets: ["claude", "codex"],
      installedPluginTargets: ["claude"],
      marketplaces: [{
        id: "draigara-openapm",
        source: "C:/Projects/draigara-openapm",
        currentSource: null,
        managed: false
      }]
    });

    expect(plan.operations).toEqual([
      { kind: "verify-apm", version: "0.26.0" },
      { kind: "install-forge", version: "1.2.0" },
      { kind: "add-marketplace", id: "draigara-openapm", source: "C:/Projects/draigara-openapm" },
      { kind: "install-plugin", targets: ["claude", "codex"] }
    ]);
  });
});
