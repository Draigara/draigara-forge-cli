import { randomUUID } from "node:crypto";
import { link, open, readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";
import { z } from "zod";

const forgeConfigurationSchema = z.object({
  schemaVersion: z.literal(1),
  marketplace: z.object({
    id: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/)
  }).strict()
}).strict();

export type ForgeConfiguration = z.infer<typeof forgeConfigurationSchema>;

export interface ForgeInitializationResult {
  readonly created: boolean;
  readonly configuration: ForgeConfiguration;
}

export async function initializeForgeYaml(repositoryRoot: string, marketplaceId: string): Promise<ForgeInitializationResult> {
  const configuration = forgeConfigurationSchema.parse({
    schemaVersion: 1,
    marketplace: { id: marketplaceId }
  });
  const target = join(repositoryRoot, "forge.yaml");
  const temporary = join(repositoryRoot, `.forge.${randomUUID()}.tmp`);
  const content = `schemaVersion: 1\nmarketplace:\n  id: ${configuration.marketplace.id}\n`;
  const handle = await open(temporary, "wx", 0o600);
  try {
    await handle.writeFile(content, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }

  try {
    await link(temporary, target);
    return { created: true, configuration };
  } catch (error) {
    if (!isAlreadyExists(error)) throw error;
    return { created: false, configuration: await readForgeYaml(target) };
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}

export async function readForgeYaml(path: string): Promise<ForgeConfiguration> {
  const content = await readFile(path, "utf8");
  if (Buffer.byteLength(content) > 64 * 1024) throw new Error("forge.yaml exceeds 64 KiB.");
  return forgeConfigurationSchema.parse(parse(content));
}

function isAlreadyExists(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
}
