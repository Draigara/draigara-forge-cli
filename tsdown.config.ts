import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/forge.ts"],
  format: ["esm"],
  fixedExtension: false,
  clean: true,
  dts: false,
  minify: false,
  sourcemap: true,
  banner: { js: "#!/usr/bin/env node" },
  outDir: "dist"
});
