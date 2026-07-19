import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MarketplaceService } from "../../src/marketplaces/marketplace-service.js";
import { ForgeStateStore } from "../../src/state/state-store.js";

function options(workingDirectory: string) {
  return {
    forgeVersion: "0.1.0-preview.0",
    apmVersion: "0.26.0",
    workingDirectory,
    now: () => new Date("2026-07-19T00:00:00.000Z")
  };
}

describe("MarketplaceService", () => {
  it("records a marketplace as forge-created after APM registers it", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-marketplace-"));
    const state = new ForgeStateStore(directory);
    let registrations: { id: string; source: string }[] = [];
    const client = {
      listMarketplaces: async () => registrations,
      addMarketplace: async (id: string, source: string) => { registrations = [{ id, source }]; }
    };
    const service = new MarketplaceService(client, state, options(directory));

    const result = await service.add("draigara-openapm", "https://example.test/marketplace.json");

    expect(result.status).toBe("forge-created");
    expect((await state.load()).managedMarketplaces[0]?.origin).toBe("forge-created");
  });

  it("adopts an identical pre-existing registration only with explicit authorization", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-marketplace-"));
    const state = new ForgeStateStore(directory);
    const client = {
      listMarketplaces: async () => [{ id: "acme-apm", source: "https://acme.test/marketplace.json" }],
      addMarketplace: async () => { throw new Error("must not mutate APM"); }
    };
    const service = new MarketplaceService(client, state, options(directory));

    expect((await service.add("acme-apm", "https://acme.test/marketplace.json")).status).toBe("adoption-required");
    expect((await state.load()).managedMarketplaces).toEqual([]);

    expect((await service.add("acme-apm", "https://acme.test/marketplace.json", { adoptExisting: true })).status).toBe("adopted");
    expect((await state.load()).managedMarketplaces[0]?.origin).toBe("adopted");
  });

  it("rejects an existing ID with a different source", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-marketplace-"));
    const service = new MarketplaceService({
      listMarketplaces: async () => [{ id: "acme-apm", source: "https://other.test/marketplace.json" }],
      addMarketplace: async () => { throw new Error("must not mutate APM"); }
    }, new ForgeStateStore(directory), options(directory));

    await expect(service.add("acme-apm", "https://acme.test/marketplace.json", { adoptExisting: true }))
      .rejects.toThrow("different source");
  });

  it("unlinks an adopted registration without removing it from APM", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-marketplace-"));
    const state = new ForgeStateStore(directory);
    await state.commit({
      schemaVersion: 1,
      revision: 0,
      managedMarketplaces: [{
        id: "acme-apm",
        source: "https://acme.test/marketplace.json",
        origin: "adopted",
        addedAt: "2026-07-19T00:00:00.000Z",
        forgeVersion: "0.1.0-preview.0",
        apmVersion: "0.26.0"
      }]
    });
    let removed = false;
    const service = new MarketplaceService({
      listMarketplaces: async () => [{ id: "acme-apm", source: "https://acme.test/marketplace.json" }],
      addMarketplace: async () => undefined,
      removeMarketplace: async () => { removed = true; }
    }, state, options(directory));

    expect((await service.remove("acme-apm")).status).toBe("unlinked");
    expect(removed).toBe(false);
    expect((await state.load()).managedMarketplaces).toEqual([]);
  });

  it("does not refresh an adopted registration through APM", async () => {
    const directory = await mkdtemp(join(tmpdir(), "forge-marketplace-"));
    const state = new ForgeStateStore(directory);
    await state.commit({
      schemaVersion: 1,
      revision: 0,
      managedMarketplaces: [{
        id: "acme-apm",
        source: "https://acme.test/marketplace.json",
        origin: "adopted",
        addedAt: "2026-07-19T00:00:00.000Z",
        forgeVersion: "0.1.0-preview.0",
        apmVersion: "0.26.0"
      }]
    });
    let updated = false;
    const service = new MarketplaceService({
      listMarketplaces: async () => [{ id: "acme-apm", source: "https://acme.test/marketplace.json" }],
      addMarketplace: async () => undefined,
      updateMarketplace: async () => { updated = true; }
    }, state, options(directory));

    await expect(service.update("acme-apm")).rejects.toThrow("adopted");
    expect(updated).toBe(false);
  });
});
