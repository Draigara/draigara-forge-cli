import { describe, expect, it } from "vitest";
import { renderBrand } from "../../src/interaction/brand.js";

describe("renderBrand", () => {
  it("uses branded static art for a wide terminal and plain text when styling is disabled", () => {
    const output = renderBrand({ columns: 100, color: false, interactive: true });

    expect(output).toContain("DRAIGARA");
    expect(output).toContain("FORGE");
    expect(output).toContain("●    ●");
    expect(output).not.toContain("\u001b[");
  });

  it("uses a deterministic plain identity when output is redirected", () => {
    expect(renderBrand({ columns: 0, color: false, interactive: false })).toBe("Draigara Forge");
  });
});
