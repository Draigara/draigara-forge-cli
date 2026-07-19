import { compactColor, compactPlain, wideColor, widePlain } from "./generated-brand.js";

export interface BrandRenderOptions {
  readonly columns: number;
  readonly color: boolean;
  readonly interactive: boolean;
}

export function renderBrand(options: BrandRenderOptions): string {
  if (!options.interactive) return "Draigara Forge";
  if (options.columns >= 80) return options.color ? wideColor : widePlain;
  if (options.columns >= 50) return options.color ? compactColor : compactPlain;
  return "Draigara Forge";
}
