import { cp, mkdir } from "node:fs/promises";

await mkdir("dist/assets/brand", { recursive: true });
await cp("src/interaction/assets/brand", "dist/assets/brand", { recursive: true });
