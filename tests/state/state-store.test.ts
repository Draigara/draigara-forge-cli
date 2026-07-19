import { access, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ForgeStateStore } from "../../src/state/state-store.js";

describe("ForgeStateStore", () => {
  it("atomically persists only the Forge marketplace ledger", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-state-"));
    const store = new ForgeStateStore(directory);
    const initial = await store.load();

    expect(initial).toEqual({ schemaVersion: 1, revision: 0, managedMarketplaces: [] });

    const committed = await store.commit({
      ...initial,
      managedMarketplaces: [{
        id: "draigara-openapm",
        source: "C:/Projects/draigara-openapm",
        addedAt: "2026-07-19T00:00:00.000Z",
        forgeVersion: "0.1.0-preview.0",
        apmVersion: "0.26.0"
      }]
    });

    expect(committed.revision).toBe(1);
    expect(await store.load()).toEqual(committed);
    expect(JSON.parse(await readFile(join(directory, "state.v1.json"), "utf8"))).toEqual(committed);
  });

  it("retains and clears a bounded recovery journal", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-state-"));
    const store = new ForgeStateStore(directory);
    const journal = {
      schemaVersion: 1 as const,
      operationId: "setup-1",
      startedAt: "2026-07-19T00:00:00.000Z",
      completedOperations: ["marketplace:add:draigara-openapm"]
    };

    await store.writeRecoveryJournal(journal);
    expect(await store.loadRecoveryJournal()).toEqual(journal);
    await store.clearRecoveryJournal();
    expect(await store.loadRecoveryJournal()).toBeNull();
    await expect(access(join(directory, "pending-operation.v1.json"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("refuses a second writer after a bounded lock wait", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-state-"));
    const first = new ForgeStateStore(directory);
    const second = new ForgeStateStore(directory);
    const release = await first.acquireLock({ timeoutMs: 100, retryMs: 10 });

    await expect(second.acquireLock({ timeoutMs: 30, retryMs: 5 })).rejects.toThrow(
      "Forge state is locked by another operation."
    );

    await release();
    const releaseSecond = await second.acquireLock({ timeoutMs: 100, retryMs: 10 });
    await releaseSecond();
  });
});
