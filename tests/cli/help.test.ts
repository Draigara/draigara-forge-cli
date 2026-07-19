import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

function runForge(...args: string[]) {
  return spawnSync(
    process.execPath,
    ["--import", "tsx", "src/forge.ts", ...args],
    { cwd: repositoryRoot, encoding: "utf8" }
  );
}

function runForgeWithEnvironment(environment: NodeJS.ProcessEnv, ...args: string[]) {
  return spawnSync(
    process.execPath,
    ["--import", "tsx", "src/forge.ts", ...args],
    { cwd: repositoryRoot, encoding: "utf8", env: { ...process.env, ...environment } }
  );
}

describe("forge CLI", () => {
  it("presents the machine-scoped command surface without a public init command", () => {
    const result = runForge("--help");

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Draigara Forge");
    expect(result.stdout).toContain("setup");
    expect(result.stdout).toContain("marketplace");
    expect(result.stdout).toContain("plugin");
    expect(result.stdout).toContain("doctor");
    expect(result.stdout).not.toMatch(/^\s+init\b/m);
    expect(result.stderr).toBe("");
  });

  it("fails non-interactive setup when no target was supplied", () => {
    const result = runForge("setup", "--non-interactive", "--yes");

    expect(result.status).toBe(3);
    expect(result.stderr).toContain("--target");
    expect(result.stdout).not.toContain("\u001b[");
  });

  it("reports a missing APM installation without attempting repair", () => {
    const result = runForgeWithEnvironment({ FORGE_APM_PATH: "C:/definitely-missing/apm.exe" }, "doctor");

    expect(result.status).toBe(4);
    expect(result.stdout).toContain("Node.js");
    expect(result.stdout).toContain("Git");
    expect(result.stdout).toContain("APM");
    expect(result.stderr).toContain("APM was not found");
  });

  it("shows the brand and official installation guidance when setup cannot locate APM", () => {
    const result = runForgeWithEnvironment(
      { FORGE_APM_PATH: "C:/definitely-missing/apm.exe" },
      "setup", "--non-interactive", "--yes", "--target", "codex"
    );

    expect(result.status).toBe(4);
    expect(result.stdout).toContain("Draigara Forge");
    expect(result.stderr).toContain("uv tool install apm-cli==0.26.0");
  });

  it("fails marketplace lifecycle commands before mutation when APM is unavailable", () => {
    const result = runForgeWithEnvironment(
      { FORGE_APM_PATH: "C:/definitely-missing/apm.exe" },
      "marketplace", "list"
    );

    expect(result.status).toBe(4);
    expect(result.stderr).toContain("APM was not found");
  });

  it("fails plugin lifecycle commands before mutation when APM is unavailable", () => {
    const result = runForgeWithEnvironment(
      { FORGE_APM_PATH: "C:/definitely-missing/apm.exe" },
      "plugin", "list"
    );

    expect(result.status).toBe(4);
    expect(result.stderr).toContain("APM was not found");
  });

  it("reports corrupt Forge state as recovery-required", () => {
    const stateDirectory = mkdtempSync(join(tmpdir(), "forge-doctor-"));
    writeFileSync(join(stateDirectory, "state.v1.json"), "{truncated", "utf8");
    const result = runForgeWithEnvironment(
      { FORGE_APM_PATH: process.execPath, FORGE_STATE_DIR: stateDirectory },
      "doctor"
    );

    expect(result.status).toBe(7);
    expect(result.stderr).toContain("state.v1.json is invalid");
  });
});
