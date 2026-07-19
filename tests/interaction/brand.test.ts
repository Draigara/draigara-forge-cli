import { describe, expect, it } from "vitest";
import { renderBrand } from "../../src/interaction/brand.js";

describe("renderBrand", () => {
  it("uses Chafa-derived Draig and lowercase wordmark art for a wide terminal", () => {
    const output = renderBrand({ columns: 100, color: false, interactive: true });

    expect(output).toContain("draigara");
    expect(output).toContain("FORGE");
    expect(output).toContain("▄");
    expect(output).not.toContain("\u001b[");
  });

  it("uses committed true-color Chafa output when color is enabled", () => {
    const output = renderBrand({ columns: 100, color: true, interactive: true });

    expect(output).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
    expect(output.replace(/\u001b\[[0-9;]*m/g, "")).toContain("draigara");
  });

  it("uses a deterministic plain identity when output is redirected", () => {
    expect(renderBrand({ columns: 0, color: false, interactive: false })).toBe("Draigara Forge");
  });
});
