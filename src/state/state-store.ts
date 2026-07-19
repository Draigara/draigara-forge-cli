import { randomUUID } from "node:crypto";
import { copyFile, mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";

const managedMarketplaceSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  addedAt: z.string().datetime(),
  forgeVersion: z.string().min(1),
  apmVersion: z.string().min(1)
}).strict();

const forgeStateSchema = z.object({
  schemaVersion: z.literal(1),
  revision: z.number().int().nonnegative(),
  managedMarketplaces: z.array(managedMarketplaceSchema),
  lastSuccessfulSetup: z.string().datetime().optional()
}).strict();
const recoveryJournalSchema = z.object({
  schemaVersion: z.literal(1),
  operationId: z.string().min(1).max(256),
  startedAt: z.string().datetime(),
  completedOperations: z.array(z.string().min(1).max(4096)).max(1024)
}).strict();

export type ForgeState = z.infer<typeof forgeStateSchema>;
export type RecoveryJournal = z.infer<typeof recoveryJournalSchema>;

const emptyState: ForgeState = {
  schemaVersion: 1,
  revision: 0,
  managedMarketplaces: []
};

export class ForgeStateStore {
  readonly #statePath: string;
  readonly #backupPath: string;
  readonly #journalPath: string;
  readonly #lockPath: string;

  public constructor(private readonly directory: string) {
    this.#statePath = join(directory, "state.v1.json");
    this.#backupPath = join(directory, "state.v1.json.bak");
    this.#journalPath = join(directory, "pending-operation.v1.json");
    this.#lockPath = join(directory, "state.v1.lock");
  }

  public async acquireLock(options: { readonly timeoutMs: number; readonly retryMs: number }): Promise<() => Promise<void>> {
    await mkdir(this.directory, { recursive: true });
    const deadline = Date.now() + options.timeoutMs;
    while (true) {
      try {
        const handle = await open(this.#lockPath, "wx", 0o600);
        await handle.writeFile(`${process.pid}\n`, "utf8");
        let released = false;
        return async () => {
          if (released) return;
          released = true;
          await handle.close();
          await unlink(this.#lockPath).catch((error: unknown) => {
            if (!isMissingFile(error)) throw error;
          });
        };
      } catch (error) {
        if (!isFileExists(error)) throw error;
        if (Date.now() >= deadline) throw new Error("Forge state is locked by another operation.");
        await delay(Math.min(options.retryMs, Math.max(0, deadline - Date.now())));
      }
    }
  }

  public async load(): Promise<ForgeState> {
    try {
      return forgeStateSchema.parse(JSON.parse(await readFile(this.#statePath, "utf8")));
    } catch (error) {
      if (isMissingFile(error)) return structuredClone(emptyState);
      throw error;
    }
  }

  public async commit(state: ForgeState): Promise<ForgeState> {
    await mkdir(this.directory, { recursive: true });
    const current = await this.load();
    const next = forgeStateSchema.parse({ ...state, revision: current.revision + 1 });
    const temporaryPath = join(this.directory, `.state.v1.${randomUUID()}.tmp`);
    const handle = await open(temporaryPath, "wx", 0o600);
    try {
      await handle.writeFile(`${JSON.stringify(next, null, 2)}\n`, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }

    try {
      await copyFile(this.#statePath, this.#backupPath);
    } catch (error) {
      if (!isMissingFile(error)) {
        await unlink(temporaryPath).catch(() => undefined);
        throw error;
      }
    }
    await rename(temporaryPath, this.#statePath);
    return next;
  }

  public async loadRecoveryJournal(): Promise<RecoveryJournal | null> {
    try {
      return recoveryJournalSchema.parse(JSON.parse(await readFile(this.#journalPath, "utf8")));
    } catch (error) {
      if (isMissingFile(error)) return null;
      throw error;
    }
  }

  public async writeRecoveryJournal(journal: RecoveryJournal): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    const value = recoveryJournalSchema.parse(journal);
    const temporary = join(this.directory, `.pending-operation.${randomUUID()}.tmp`);
    const handle = await open(temporary, "wx", 0o600);
    try {
      await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    await rename(temporary, this.#journalPath);
  }

  public async clearRecoveryJournal(): Promise<void> {
    await unlink(this.#journalPath).catch((error: unknown) => {
      if (!isMissingFile(error)) throw error;
    });
  }
}

function isMissingFile(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function isFileExists(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
}
