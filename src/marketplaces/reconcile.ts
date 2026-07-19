export interface MarketplaceRegistration {
  readonly id: string;
  readonly source: string;
}

export type MarketplaceStatus = "managed" | "unmanaged" | "missing" | "conflicting";

export interface ReconciledMarketplace extends MarketplaceRegistration {
  readonly status: MarketplaceStatus;
  readonly actualSource?: string;
}

export function reconcileMarketplaces(
  managedRegistrations: readonly MarketplaceRegistration[],
  apmRegistrations: readonly MarketplaceRegistration[]
): readonly ReconciledMarketplace[] {
  const managed = new Map(managedRegistrations.map((registration) => [registration.id, registration.source]));
  const actual = new Map(apmRegistrations.map((registration) => [registration.id, registration.source]));
  const ids = [...new Set([...managed.keys(), ...actual.keys()])].sort();
  return ids.map((id) => {
    const expectedSource = managed.get(id);
    const actualSource = actual.get(id);
    if (expectedSource === undefined) return { id, source: actualSource!, status: "unmanaged" };
    if (actualSource === undefined) return { id, source: expectedSource, status: "missing" };
    if (actualSource !== expectedSource) {
      return { id, source: expectedSource, actualSource, status: "conflicting" };
    }
    return { id, source: expectedSource, status: "managed" };
  });
}
