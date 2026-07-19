export interface SetupPlanInput {
  readonly invokedForgeVersion: string;
  readonly globallyInstalledForgeVersion: string | null;
  readonly apm: { readonly installedVersion: string | null; readonly requiredVersion: string };
  readonly selectedTargets: readonly string[];
  readonly installedPluginTargets: readonly string[];
  readonly marketplaces: readonly MarketplacePlanInput[];
}

export interface MarketplacePlanInput {
  readonly id: string;
  readonly source: string;
  readonly currentSource: string | null;
  readonly managed: boolean;
}

export type SetupOperation =
  | { readonly kind: "verify-apm"; readonly version: string }
  | { readonly kind: "install-forge"; readonly version: string }
  | { readonly kind: "add-marketplace"; readonly id: string; readonly source: string }
  | { readonly kind: "adopt-marketplace"; readonly id: string; readonly source: string }
  | { readonly kind: "install-plugin"; readonly targets: readonly string[] };

export interface SetupPlan {
  readonly operations: readonly SetupOperation[];
}

export class MarketplaceConflictError extends Error {
  public constructor(id: string) {
    super(`Marketplace '${id}' is registered with a different source.`);
    this.name = "MarketplaceConflictError";
  }
}

export function createSetupPlan(input: SetupPlanInput): SetupPlan {
  const operations: SetupOperation[] = [];
  operations.push({ kind: "verify-apm", version: input.apm.requiredVersion });
  if (input.globallyInstalledForgeVersion !== input.invokedForgeVersion) {
    operations.push({ kind: "install-forge", version: input.invokedForgeVersion });
  }
  for (const marketplace of input.marketplaces) {
    if (marketplace.currentSource !== null && marketplace.currentSource !== marketplace.source) {
      throw new MarketplaceConflictError(marketplace.id);
    }
    if (marketplace.currentSource === null) {
      operations.push({ kind: "add-marketplace", id: marketplace.id, source: marketplace.source });
    } else if (!marketplace.managed) {
      operations.push({ kind: "adopt-marketplace", id: marketplace.id, source: marketplace.source });
    }
  }
  const installed = new Set(input.installedPluginTargets);
  if (input.selectedTargets.some((target) => !installed.has(target))) {
    operations.push({ kind: "install-plugin", targets: [...input.selectedTargets] });
  }
  return { operations };
}
