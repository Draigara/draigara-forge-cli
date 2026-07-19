# Terminal UX

Interactive commands use Clack for prompts and Chalk for restrained styling. The opening treatment says both “Draigara” and “Forge” and may include the Draig dragon glyph. Wide, compact, and plain layouts keep redirected and narrow terminals useful.

The Draigara SVG assets are design inputs only. The checked-in text artwork is deterministic at runtime. `image-to-ascii` was evaluated as a design-time aid for raster previews, but SVG-first hand tuning produces cleaner terminal-cell geometry and avoids a heavy image conversion dependency in every `npx` run. It can be used experimentally when refreshing art, with the reviewed text snapshot committed as the result.

Colors, animation, cursor control, and prompts are disabled when output is redirected, `NO_COLOR`/`--no-color` applies, or non-interactive mode is active. Normal results go to stdout; warnings, diagnostics, and child stderr go to stderr. MCP stdio never contains decoration.
