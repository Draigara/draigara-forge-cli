import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MarketplaceService } from "../../src/marketplaces/marketplace-service.js";
import { ForgeStateStore } from "../../src/state/state-store.js";

describe("MarketplaceService", () => {
  it("records a marketplace only when Forge performed the APM registration", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-marketplace-"));
    const state = new ForgeStateStore(directory);
    const client = {
      listMarketplaces: async () => [],
      addMarketplace: async () => ({ schemaVersion: 1 as const, id: "draigara-openapm", source: "C:/marketplace", changed: true })
    };
    const service = new MarketplaceService(client, state, {
      forgeVersion: "0.1.0-preview.0",
      apmVersion: "0.26.0",
      workingDirectory: directory,
      now: () => new Date("2026-07-19T00:00:00.000Z")
    });

    const result = await service.add("draigara-openapm", "C:/marketplace");

    expect(result.status).toBe("managed");
    expect((await state.load()).managedMarketplaces).toHaveLength(1);
  });

  it("does not adopt an identical pre-existing APM registration", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-marketplace-"));
    const state = new ForgeStateStore(directory);
    const client = {
      listMarketplaces: async () => [{ id: "draigara-openapm", source: "C:/marketplace" }],
      addMarketplace: async () => { throw new Error("must not mutate"); }
    };
    const service = new MarketplaceService(client, state, {
      forgeVersion: "0.1.0-preview.0",
      apmVersion: "0.26.0",
      workingDirectory: directory,
      now: () => new Date("2026-07-19T00:00:00.000Z")
    });

    const result = await service.add("draigara-openapm", "C:/marketplace");

    expect(result.status).toBe("unmanaged");
    expect((await state.load()).managedMarketplaces).toEqual([]);
  });
});
