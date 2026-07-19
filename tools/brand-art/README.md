# Forge terminal artwork

The canonical design inputs are Draigara's `logo-glyph.svg`,
`logo-wordmark.svg`, and `draig.svg`. SVG inspection and conversion happen only
at design time. Forge does not parse or rasterize those assets at runtime and
does not use terminal image protocols.

The checked-in text snapshots under `fixtures/terminal` are the reviewed,
authoritative terminal representation. `BrandArtwork` contains the matching
static terminal strings rendered with Chalk. Changes should be hand-tuned for terminal cell
geometry, reviewed in wide and compact terminals, and accepted by updating the
code and golden snapshot together.

The terminal palette is limited to `#ff5a00`, `#ff8500`, `#ffb11b`, white, and
the terminal's default background. The artwork uses Unicode block and line
characters, but the surrounding text must always carry the brand and product
meaning independently of color and decoration.
