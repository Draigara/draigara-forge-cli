import type { ForgeStateStore } from "../state/state-store.js";

interface MarketplaceClient {
  listMarketplaces(workingDirectory: string): Promise<readonly { id: string; source: string }[]>;
  addMarketplace(id: string, source: string, workingDirectory: string): Promise<{ changed: boolean }>;
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

  public async add(id: string, source: string): Promise<{ status: "managed" | "unmanaged" }> {
    validateMarketplace(id, source);
    const existing = (await this.client.listMarketplaces(this.options.workingDirectory)).find((item) => item.id === id);
    if (existing !== undefined) {
      if (existing.source !== source) throw new Error(`Marketplace '${id}' is already registered with a different source.`);
      return { status: "unmanaged" };
    }
    const mutation = await this.client.addMarketplace(id, source, this.options.workingDirectory);
    if (!mutation.changed) return { status: "unmanaged" };

    const state = await this.stateStore.load();
    await this.stateStore.commit({
      ...state,
      managedMarketplaces: [...state.managedMarketplaces, {
        id,
        source,
        addedAt: this.options.now().toISOString(),
        forgeVersion: this.options.forgeVersion,
        apmVersion: this.options.apmVersion
      }]
    });
    return { status: "managed" };
  }
}

function validateMarketplace(id: string, source: string): void {
  if (!/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(id)) throw new Error("Marketplace ID is invalid.");
  if (source.trim().length === 0 || source.length > 4096) throw new Error("Marketplace source is invalid.");
}
