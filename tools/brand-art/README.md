# Forge terminal artwork

Forge's opener is generated from the canonical Draig mascot PNG and lowercase
Draigara wordmark PNG with pinned `chafa-wasm` 0.3.3. Chafa is a development
dependency only. The generated strings in `src/interaction/generated-brand.ts`
are the complete runtime representation; the published CLI does not include
the source images, Chafa, or WebAssembly.

Regenerate from a checkout that has access to the canonical brand assets:

```sh
npm run -- generate:brand -- --draig <path-to-draig.png> --wordmark <path-to-lowercase-wordmark.png>
```

The command writes wide and compact true-color variants plus deterministic
plain variants. Review all four in representative dark and light terminals.
Do not hand-edit the generated module. Narrow or redirected output uses the
plain `Draigara Forge` identity, so meaning never depends on art or color.
