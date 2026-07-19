import { describe, expect, it } from "vitest";
import { RecordingSetupInteraction } from "../../src/interaction/setup-interaction.js";

describe("RecordingSetupInteraction", () => {
  it("records visible setup stages in presentation order", async () => {
    const interaction = new RecordingSetupInteraction({ interactive: false });

    interaction.showBrand("Draigara Forge");
    await interaction.task("Inspecting APM", async () => "0.26.0", (version) => `APM ${version}`);
    interaction.showPlan("Setup plan\n  Targets: codex");
    interaction.success("Forge is ready.");

    expect(interaction.events.map((event) => event.kind)).toEqual([
      "brand", "task-start", "task-success", "plan", "success"
    ]);
    expect(interaction.snapshot().stdout).toContain("Inspecting APM");
    expect(interaction.snapshot().stdout.indexOf("Draigara Forge"))
      .toBeLessThan(interaction.snapshot().stdout.indexOf("Setup plan"));
  });
});
