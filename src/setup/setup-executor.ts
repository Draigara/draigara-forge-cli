import type { SetupOperation } from "./setup-planner.js";

export interface SetupExecutorDependencies {
  readonly writeJournal: (completed: readonly string[]) => Promise<void>;
  readonly clearJournal: () => Promise<void>;
  readonly verifyApm: (version: string) => Promise<void>;
  readonly installForge: (version: string) => Promise<void>;
  readonly addMarketplace: (id: string, source: string) => Promise<boolean>;
  readonly adoptMarketplace: (id: string, source: string) => Promise<void>;
  readonly removeMarketplace: (id: string) => Promise<void>;
  readonly installPlugin: (targets: readonly string[]) => Promise<void>;
  readonly commit: () => Promise<void>;
}

export class SetupRecoveryRequiredError extends Error {
  public constructor(public readonly originalError: unknown, public readonly rollbackFailure: unknown) {
    super("Forge setup failed and marketplace rollback was incomplete; recovery is required.");
    this.name = "SetupRecoveryRequiredError";
  }
}

export async function executeSetupPlan(
  operations: readonly SetupOperation[],
  dependencies: SetupExecutorDependencies
): Promise<void> {
  const completed: string[] = [];
  const addedMarketplaces: string[] = [];
  await dependencies.writeJournal(completed);
  try {
    for (const operation of operations) {
      if (operation.kind === "verify-apm") await dependencies.verifyApm(operation.version);
      else if (operation.kind === "install-forge") await dependencies.installForge(operation.version);
      else if (operation.kind === "add-marketplace") {
        if (await dependencies.addMarketplace(operation.id, operation.source)) addedMarketplaces.push(operation.id);
      } else if (operation.kind === "adopt-marketplace") {
        await dependencies.adoptMarketplace(operation.id, operation.source);
      } else await dependencies.installPlugin(operation.targets);
      completed.push(operation.kind);
      await dependencies.writeJournal(completed);
    }
    await dependencies.commit();
    await dependencies.clearJournal();
  } catch (error) {
    try {
      for (const id of [...addedMarketplaces].reverse()) await dependencies.removeMarketplace(id);
      await dependencies.clearJournal();
    } catch (rollbackFailure) {
      throw new SetupRecoveryRequiredError(error, rollbackFailure);
    }
    throw error;
  }
}
