import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { z } from "zod";

const pluginSchema = z.object({
  name: z.string().min(1).max(256),
  description: z.string().max(8_192).default(""),
  version: z.string().max(256).default(""),
  source: z.unknown(),
  tags: z.array(z.string().min(1).max(128)).max(128).default([])
}).passthrough();

const catalogSchema = z.object({
  name: z.string().min(1).max(256),
  plugins: z.array(pluginSchema).max(2_048)
}).passthrough();

export interface MarketplaceCandidate {
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly tags: readonly string[];
  readonly scope: "global" | "repository";
  readonly kind: "plugin" | "skill" | "package";
  readonly compatibleTargets: readonly string[];
}

export interface MarketplaceCatalog {
  readonly digest: string;
  readonly candidates: readonly MarketplaceCandidate[];
}

export async function readMarketplaceCatalog(source: string, query = ""): Promise<MarketplaceCatalog> {
  const content = await readBoundedSource(source);
  const parsed = catalogSchema.parse(JSON.parse(content));
  const normalizedQuery = query.trim().toLowerCase();
  const candidates = parsed.plugins
    .filter((plugin) => plugin.name !== "draigara-forge")
    .filter((plugin) => normalizedQuery.length === 0 || [plugin.name, plugin.description, ...plugin.tags].some((value) => value.toLowerCase().includes(normalizedQuery)))
    .map((plugin) => ({
      name: plugin.name,
      description: plugin.description,
      version: plugin.version,
      tags: [...plugin.tags],
      scope: plugin.tags.includes("scope-global") ? "global" as const : "repository" as const,
      kind: plugin.tags.includes("kind-plugin") ? "plugin" as const : plugin.tags.includes("kind-skill") ? "skill" as const : "package" as const,
      compatibleTargets: plugin.tags.filter((tag) => tag.startsWith("target-")).map((tag) => tag.slice("target-".length)).sort()
    }));
  return { digest: createHash("sha256").update(content, "utf8").digest("hex"), candidates };
}

async function readBoundedSource(source: string): Promise<string> {
  if (source.startsWith("https://")) {
    if (!source.toLowerCase().endsWith("/marketplace.json")) throw new Error("HTTPS marketplace source must end with /marketplace.json.");
    const response = await fetch(source, { signal: AbortSignal.timeout(15_000), redirect: "error" });
    if (!response.ok) throw new Error(`Marketplace request failed with HTTP ${response.status}.`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > 2 * 1024 * 1024) throw new Error("Marketplace manifest exceeds 2 MiB.");
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }
  if (source.includes("://") && !source.startsWith("file://")) throw new Error("Unsupported marketplace source scheme.");
  const path = source.startsWith("file://") ? fileURLToPath(source) : resolve(source);
  if (!path.toLowerCase().endsWith("marketplace.json")) throw new Error("Local marketplace source must name marketplace.json.");
  const content = await readFile(path);
  if (content.byteLength > 2 * 1024 * 1024) throw new Error("Marketplace manifest exceeds 2 MiB.");
  return new TextDecoder("utf-8", { fatal: true }).decode(content);
}
