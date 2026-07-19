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

  it("adopts an identical existing organization marketplace without claiming creation", () => {
    const plan = createSetupPlan({
      invokedForgeVersion: "0.1.0-preview.0",
      globallyInstalledForgeVersion: "0.1.0-preview.0",
      apm: { installedVersion: "0.26.0", requiredVersion: "0.26.x" },
      selectedTargets: ["codex"],
      installedPluginTargets: ["codex"],
      marketplaces: [{
        id: "acme-apm",
        source: "https://acme.test/marketplace.json",
        currentSource: "https://acme.test/marketplace.json",
        managed: false
      }]
    });

    expect(plan.operations).toContainEqual({
      kind: "adopt-marketplace",
      id: "acme-apm",
      source: "https://acme.test/marketplace.json"
    });
  });
});
