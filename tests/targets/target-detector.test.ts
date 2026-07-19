import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { describe, expect, it } from "vitest";
import { detectHarnesses } from "../../src/targets/target-detector.js";

describe("detectHarnesses", () => {
  it("reports command and configuration signals without mutating a harness", async () => {
    const root = await mkdtemp(join(tmpdir(), "forge-targets-"));
    const bin = join(root, "bin");
    const home = join(root, "home");
    await mkdir(bin);
    await mkdir(join(home, ".codex"), { recursive: true });
    await writeFile(join(bin, "claude.cmd"), "@exit /b 0\n");

    const detected = await detectHarnesses({
      homeDirectory: home,
      pathValue: [bin, "C:/missing"].join(delimiter),
      platform: "win32"
    });

    expect(detected.filter((target) => target.detected)).toEqual([
      { id: "claude", detected: true, signals: [`command:${join(bin, "claude.cmd")}`] },
      { id: "codex", detected: true, signals: [`config:${join(home, ".codex")}`] }
    ]);
    expect(detected.map((target) => target.id)).toContain("opencode");
  });
});
