import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("npm package executable", () => {
  it("builds the exact file referenced by the forge bin entry", async () => {
    const packageJson = JSON.parse(await readFile(resolve("package.json"), "utf8")) as { bin: { forge: string } };

    await expect(access(resolve(packageJson.bin.forge))).resolves.toBeUndefined();
  });
});
