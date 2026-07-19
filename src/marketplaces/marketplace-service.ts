import type { ForgeStateStore } from "../state/state-store.js";

interface MarketplaceClient {
  listMarketplaces(workingDirectory?: string): Promise<readonly { id: string; source: string }[]>;
  addMarketplace(id: string, source: string, workingDirectory: string): Promise<void>;
  updateMarketplace?(id: string, workingDirectory: string): Promise<void>;
  removeMarketplace?(id: string, workingDirectory: string): Promise<void>;
}

interface MarketplaceServiceOptions {
  readonly forgeVersion: string;
  readonly apmVersion: string;
  readonly workingDirectory: string;
  readonly now: () => Date;
}

export class MarketplaceService {
  public constructor(
    private readonly client: MarketplaceClient,
    private readonly stateStore: ForgeStateStore,
    private readonly options: MarketplaceServiceOptions
  ) {}

  public async add(id: string, source: string, options: { readonly adoptExisting?: boolean } = {}): Promise<{ status: "forge-created" | "adopted" | "adoption-required" }> {
    validateMarketplace(id, source);
    const existing = (await this.client.listMarketplaces(this.options.workingDirectory)).find((item) => item.id === id);
    if (existing !== undefined) {
      if (existing.source !== source) throw new Error(`Marketplace '${id}' is already registered with a different source.`);
      const tracked = (await this.stateStore.load()).managedMarketplaces.find((item) => item.id === id);
      if (tracked !== undefined) return { status: tracked.origin };
      if (options.adoptExisting !== true) return { status: "adoption-required" };
      await this.record(id, source, "adopted");
      return { status: "adopted" };
    }
    await this.client.addMarketplace(id, source, this.options.workingDirectory);
    const registered = (await this.client.listMarketplaces(this.options.workingDirectory)).find((item) => item.id === id);
    if (registered?.source !== source) throw new Error(`Marketplace '${id}' was not registered with the expected source.`);
    await this.record(id, source, "forge-created");
    return { status: "forge-created" };
  }

  public async remove(id: string): Promise<{ status: "removed" | "unlinked" }> {
    const state = await this.stateStore.load();
    const tracked = state.managedMarketplaces.find((item) => item.id === id);
    if (tracked === undefined) throw new Error(`Marketplace '${id}' is not tracked by Forge.`);
    const existing = (await this.client.listMarketplaces(this.options.workingDirectory)).find((item) => item.id === id);
    if (existing !== undefined && existing.source !== tracked.source) throw new Error(`Marketplace '${id}' is registered with a different source.`);
    if (tracked.origin === "forge-created" && existing !== undefined) {
      if (this.client.removeMarketplace === undefined) throw new Error("Marketplace removal is unavailable.");
      await this.client.removeMarketplace(id, this.options.workingDirectory);
    }
    await this.stateStore.commit({ ...state, managedMarketplaces: state.managedMarketplaces.filter((item) => item.id !== id) });
    return { status: tracked.origin === "adopted" ? "unlinked" : "removed" };
  }

  public async update(id: string): Promise<{ status: "updated" }> {
    const state = await this.stateStore.load();
    const tracked = state.managedMarketplaces.find((item) => item.id === id);
    if (tracked === undefined) throw new Error(`Marketplace '${id}' is not tracked by Forge.`);
    if (tracked.origin === "adopted") throw new Error(`Marketplace '${id}' is adopted; Forge will not refresh its APM registration.`);
    const existing = (await this.client.listMarketplaces(this.options.workingDirectory)).find((item) => item.id === id);
    if (existing?.source !== tracked.source) throw new Error(`Marketplace '${id}' conflicts with the Forge ledger.`);
    if (this.client.updateMarketplace === undefined) throw new Error("Marketplace update is unavailable.");
    await this.client.updateMarketplace(id, this.options.workingDirectory);
    return { status: "updated" };
  }

  private async record(id: string, source: string, origin: "forge-created" | "adopted"): Promise<void> {
    const state = await this.stateStore.load();
    await this.stateStore.commit({
      ...state,
      managedMarketplaces: [...state.managedMarketplaces.filter((item) => item.id !== id), {
        id, source, origin,
        addedAt: this.options.now().toISOString(),
        forgeVersion: this.options.forgeVersion,
        apmVersion: this.options.apmVersion
      }]
    });
  }
}

function validateMarketplace(id: string, source: string): void {
  if (!/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(id)) throw new Error("Marketplace ID is invalid.");
  if (source.trim().length === 0 || source.length > 4096) throw new Error("Marketplace source is invalid.");
}
