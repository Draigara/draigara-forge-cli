import { readFileSync } from "node:fs";

export interface BrandRenderOptions {
  readonly columns: number;
  readonly color: boolean;
  readonly interactive: boolean;
}

const FULL_BANNER_MIN_COLUMNS = 152;
const WORDMARK_MIN_COLUMNS = 84;
const COMPACT_MIN_COLUMNS = 24;

const draigBanner = loadBrandAsset("forge-draig.ansi");
const glyphBanner = loadBrandAsset("forge-glyph.ansi");
const wordmark = loadBrandAsset("forge-wordmark.ansi");
const compact = loadBrandAsset("forge-compact.ansi");
const plain = loadBrandAsset("forge-plain.txt").trimEnd();

export function renderBrand(options: BrandRenderOptions): string {
  if (!options.interactive || !options.color) return plain;

  if (options.columns >= FULL_BANNER_MIN_COLUMNS) {
    return Math.random() < 0.5 ? draigBanner : glyphBanner;
  }

  if (options.columns >= WORDMARK_MIN_COLUMNS) return wordmark;
  if (options.columns >= COMPACT_MIN_COLUMNS) return compact;

  return plain;
}

function loadBrandAsset(name: string): string {
  return readFileSync(new URL(`./assets/brand/${name}`, import.meta.url), "utf8").trimEnd();
}
