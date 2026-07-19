# Terminal UX

Interactive setup opens with the Draig mascot, lowercase Draigara wordmark, and Forge product name before any discovery or prompt. Clack supplies prompts and named progress stages. Wide, compact, and plain layouts keep redirected and narrow terminals useful.

The canonical Draig and lowercase wordmark PNGs are converted at design time with pinned `chafa-wasm` 0.3.3. The generated true-color and plain Unicode artwork is committed as TypeScript, so Forge does not load images, WebAssembly, or Chafa during an `npx` run. Changes are regenerated and reviewed in both wide and compact terminals before the static result is committed.

Discovery reports the harness scan, APM presence and compatibility, current state inspection, plan application, and doctor. The complete plan is printed before its confirmation. A missing APM has its own explanation and consent before Forge discovers and confirms the remaining setup plan.

Colors, animation, cursor control, and prompts are disabled when output is redirected, `NO_COLOR`/`--no-color` applies, or non-interactive mode is active. Normal results go to stdout; warnings, diagnostics, and child stderr go to stderr. MCP stdio never contains decoration.
