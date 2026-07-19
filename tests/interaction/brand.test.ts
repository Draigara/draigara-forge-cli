import { describe, expect, it, vi } from "vitest";
import { renderBrand } from "../../src/interaction/brand.js";

describe("renderBrand", () => {
  it("uses one of the full static ANSI banners on a wide color terminal", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.1);

    try {
      const output = renderBrand({
        columns: 160,
        color: true,
        interactive: true
      });

      expect(output).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
      expect(stripAnsi(output)).toContain("▀");
      expect(stripAnsi(output).length).toBeGreaterThan(1000);
    } finally {
      random.mockRestore();
    }
  });

  it("can select the alternative full banner", () => {
    const first = vi.spyOn(Math, "random").mockReturnValue(0.1);

    let draig: string;
    try {
      draig = renderBrand({
        columns: 160,
        color: true,
        interactive: true
      });
    } finally {
      first.mockRestore();
    }

    const second = vi.spyOn(Math, "random").mockReturnValue(0.9);

    let glyph: string;
    try {
      glyph = renderBrand({
        columns: 160,
        color: true,
        interactive: true
      });
    } finally {
      second.mockRestore();
    }

    expect(draig).not.toBe(glyph);
    expect(draig).toMatch(/\u001b\[/);
    expect(glyph).toMatch(/\u001b\[/);
  });

  it("uses the medium static wordmark on a typical color terminal", () => {
    const output = renderBrand({
      columns: 100,
      color: true,
      interactive: true
    });

    expect(output).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);

    const plain = stripAnsi(output);

    expect(plain).toContain("▀");
    expect(plain.split("\n").length).toBeGreaterThan(5);
  });

  it("uses the compact ANSI identity on a narrow color terminal", () => {
    const output = renderBrand({
      columns: 60,
      color: true,
      interactive: true
    });

    expect(stripAnsi(output)).toContain("draigara FORGE");
    expect(output).toMatch(/\u001b\[38;2;\d+;\d+;\d+m/);
  });

  it("uses plain text when color is unavailable", () => {
    expect(
      renderBrand({
        columns: 160,
        color: false,
        interactive: true
      })
    ).toBe("Draigara Forge");
  });

  it("uses a deterministic plain identity when output is redirected", () => {
    expect(
      renderBrand({
        columns: 0,
        color: false,
        interactive: false
      })
    ).toBe("Draigara Forge");
  });
});

function stripAnsi(value: string): string {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}
