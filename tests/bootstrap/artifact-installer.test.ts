import { createHash } from "node:crypto";
import { access, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ArtifactDigestError, downloadVerifiedArtifact } from "../../src/bootstrap/artifact-installer.js";

describe("downloadVerifiedArtifact", () => {
  it("commits only bytes matching embedded release metadata", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-artifact-"));
    const destination = join(directory, "apm.bin");
    const bytes = Buffer.from("verified-apm-artifact");
    const digest = createHash("sha256").update(bytes).digest("hex");

    await downloadVerifiedArtifact({
      url: "https://example.invalid/apm",
      destination,
      sha256: digest,
      fetcher: async () => new Response(bytes)
    });

    expect(await readFile(destination)).toEqual(bytes);
  });

  it("removes temporary material after a digest mismatch", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-artifact-"));
    const destination = join(directory, "apm.bin");

    await expect(downloadVerifiedArtifact({
      url: "https://example.invalid/apm",
      destination,
      sha256: "0".repeat(64),
      fetcher: async () => new Response("tampered")
    })).rejects.toBeInstanceOf(ArtifactDigestError);
    await expect(access(destination)).rejects.toMatchObject({ code: "ENOENT" });
  });
});
