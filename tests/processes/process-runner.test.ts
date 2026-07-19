import { describe, expect, it } from "vitest";
import { ProcessOutputLimitError, runProcess } from "../../src/processes/process-runner.js";

describe("runProcess", () => {
  it("passes hostile-looking arguments without invoking a shell and captures streams separately", async () => {
    const hostile = "spaces ' quotes ; & | $(not-a-command) 🐉";

    const result = await runProcess({
      file: process.execPath,
      arguments: [
        "-e",
        "process.stdout.write(process.argv[1]); process.stderr.write('diagnostic')",
        hostile
      ],
      timeoutMs: 5_000,
      maxOutputBytes: 4_096
    });

    expect(result).toMatchObject({
      exitCode: 0,
      stdout: hostile,
      stderr: "diagnostic",
      timedOut: false,
      cancelled: false
    });
  });

  it("terminates a child after its bounded timeout", async () => {
    const started = Date.now();

    const result = await runProcess({
      file: process.execPath,
      arguments: ["-e", "setInterval(() => {}, 1000)"],
      timeoutMs: 100,
      maxOutputBytes: 4_096
    });

    expect(result.timedOut).toBe(true);
    expect(result.cancelled).toBe(false);
    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it("rejects child output that exceeds the configured trust boundary", async () => {
    await expect(runProcess({
      file: process.execPath,
      arguments: ["-e", "process.stdout.write('x'.repeat(8192))"],
      timeoutMs: 5_000,
      maxOutputBytes: 128
    })).rejects.toBeInstanceOf(ProcessOutputLimitError);
  });
});
