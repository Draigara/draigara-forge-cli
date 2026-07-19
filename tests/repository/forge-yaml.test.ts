import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { initializeForgeYaml } from "../../src/repository/forge-yaml.js";

describe("initializeForgeYaml", () => {
  it("creates the minimal durable repository decision and never rewrites it", async () => {
    const repository = await mkdtemp(join(tmpdir(), "forge-repository-"));

    const first = await initializeForgeYaml(repository, "draigara-openapm");
    const second = await initializeForgeYaml(repository, "draigara-openapm");

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.configuration).toEqual({
      schemaVersion: 1,
      marketplace: { id: "draigara-openapm" }
    });
    expect(await readFile(join(repository, "forge.yaml"), "utf8")).toBe(
      "schemaVersion: 1\nmarketplace:\n  id: draigara-openapm\n"
    );
  });
});
