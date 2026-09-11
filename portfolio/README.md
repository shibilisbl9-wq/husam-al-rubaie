# Shibili Nuhman — scroll-animated portfolio

A one-screen, scroll-driven build of the 12-frame storyboard in the Figma
file (`Untitled.fig`, frames `168:122` → `186:2415`).

## How it works

The Figma frames are keyframes, not screens. The page is one sticky stage
inside a 950vh scroller; scroll position becomes a single `0 → 1` progress
value, and every animated box interpolates between the storyboard frames in
**design-space pixels** taken straight from the file. The whole stage is then
scaled with `min(vw/W, vh/H)`, so the composition is pixel-faithful to the
Figma frame at any viewport size.

Two design spaces are defined in `scroll.js`:

| | canvas | used when |
|---|---|---|
| `DESKTOP` | 1920 × 1080 | ≥ 900px wide and wider than 1.15:1 |
| `COMPACT` | 390 × 844 | anything narrower |

Both share the same DOM and the same timeline; only the coordinate tables and
the type scale differ.

## The timeline

| progress | Figma frame | what happens |
|---|---|---|
| 0.00 | `168:122` | `DESI`/`GNER` set as one word, cutout portrait below the fold, tool icons scattered |
| 0.10 | `168:76` | portrait rises between the two words, tracking on `MEET THE DESIGNER` opens 20% → 40% |
| 0.22 | `173:1073` | giant type sweeps off left, profile portrait enters from the right, `Hi,` at 228px |
| 0.33 | `182:391` | `Hi,` collapses into the 47px heading, statement card fades up |
| 0.41–0.70 | `184:793` → `185:1823` | glass `GRAPHIC DESIGNER` pill grows in, tool row settles and shrinks |
| 0.78 | `185:1930` | line 3 arrives — `I love making brands move` |
| 0.87 | `185:2300` | the `o` in *move* stretches to `moooooooove`, info panel blocks in at 41% |
| 1.00 | `186:2415` | line 4, panel resolves, portrait swaps for the final photo card |

The `o` count is literally driven by scroll (`1 → 8`) — that gag is in the
storyboard and it only works as motion.

## Files

```
index.html      markup + noscript fallback
styles.css      design tokens, panel geometry, @font-face
scroll.js       keyframe tables + the scroll engine (no dependencies)
assets/         three portraits, WebP, ~210 KB total
fonts/          Manrope + Big Shoulders Display, self-hosted (OFL 1.1)
```

No build step, no framework, no CDN. Drop the folder on any static host.

## Accessibility

- `prefers-reduced-motion: reduce` renders the final composition statically and
  collapses the scroller — no scroll hijack, no movement.
- With JavaScript off, the page falls back to a plain flowed document.
- All copy is real text; the portraits carry alt text.

## Editing

Copy lives in `index.html`. Positions live in the `DESKTOP` / `COMPACT` tables
in `scroll.js` — each entry is `[[progress, value], …]` in design pixels, so a
number from Figma can be pasted in as-is.
