# Woolwork Theming

Everything in Woolwork is dyed from tokens. Never hard-code a felt color into a component. Change the tokens and the whole craft table re-dyes itself, including shadows, stitches, and knit tiles.

## Core tokens

Defined on `:root` in `woolwork.css`:

```css
:root {
  --ww-version: "1.0.0";

  /* Board (the work surface behind everything) */
  --board: #e3ddd0;          /* soft pale felt over burlap weave */

  /* Felt swatches */
  --felt-cream:  #f3ead8;
  --felt-butter: #f0d98c;
  --felt-rose:   #e8a5a5;
  --felt-leaf:   #a8c686;
  --felt-plum:   #b48ec9;
  --felt-sky:    #9cc3e0;

  /* Thread and ink */
  --thread: #6b5d4f;         /* stitch color, borders, dashed seams */
  --ink:    #4a3f33;         /* body text */
  --ink-soft: #7a6c5b;       /* secondary text */

  /* Light (one law: single top-left light) */
  --light-x: -1;             /* direction multipliers used in shadow recipes */
  --light-y: -1;

  /* Motion */
  --spring: linear(0, 0.6 22%, 1.08 48%, 0.985 72%, 1);
  --settle: 320ms;
}
```

Components derive from these. For example `.btn-patch` uses `color-mix(in oklch, var(--c), black 12%)` for its pressed shade, so a re-dyed button stays consistent.

## Dyeing from a brand color

When porting an existing site, do not invent a palette. Dye the wool with the brand:

```css
:root {
  --brand: #4f6df5;                    /* the site's existing primary */
  --felt-primary: color-mix(in oklch, var(--brand) 70%, var(--felt-cream));
  --thread: color-mix(in oklch, var(--brand) 30%, #6b5d4f);
}
```

Rules of dyeing:

1. Desaturate and warm. Pure digital hues (#ff0000, #4f6df5) look like plastic, not wool. Mix at least 20 to 30 percent cream or thread into every brand color.
2. Keep contrast in the thread, not the felt. Text sits on stitches and labels; felt patches can be close in value to the board because the stitch outline separates them.
3. Never exceed roughly 6 felt colors per page. Real craft projects use a small basket of yarn.

## Per-component dye

Most components read a local `--c` (surface color) and `--t` (thread/text color):

```html
<button class="btn-patch" style="--c: var(--felt-rose)">Order</button>
<div class="felt card" style="--c: var(--felt-leaf); --t: #3d4a2e">...</div>
```

This is the entire theming API for one-off variation. No modifier class explosion.

## Night theme

Night is a token override, not a rewrite. Wool at night reads as deeper dye plus a dimmer lamp:

```css
[data-theme="night"] {
  --board: #332e42;
  --cream: #524a63;  --rose: #b65a6b;  --butter: #b8934a;
  --leaf:  #66904f;  --sky:  #54859f;  --plum:   #7d6394;
  --thread-cream: #9c92b5; --thread-rose: #f2b2bd; --thread-butter: #ecd096;
  --thread-leaf: #bcd8a8;  --thread-sky: #aed2e8;  --thread-plum: #d4bfe6;
  --ink: #f2ecdf; --ink-soft: #c3b8d4;
  --hi: rgba(220,215,255,.14); --lo: rgba(10,6,20,.5);
}
```

The rules of the flip: every felt deepens (same hue, lower lightness and chroma), every thread lightens so stitches keep contrast against the darker felt they sit on, and the highlight/occlusion pair dims because the lamp is lower. Materials read their text color from `--ink`, so anything composed from tokens survives the flip automatically; if text is unreadable in night mode, it was hard-coded, and the fix is to move it onto a token, never to patch the night value.

Toggle with `woolwork.night()` (adds/removes the attribute on `<html>` and persists nothing by default; wire your own storage if wanted). Shadows stay the same recipe; darker felt under the same lamp is what makes it feel like the same room with the lights low.

## Fiber texture and the dye

The fiber grain overlays (baked feTurbulence tiles) are grayscale and applied with `soft-light` or low-opacity `multiply`, so they survive any dye. Do not tint the grain tiles; tint the felt beneath them.

## Fonts

Two roles, both SIL OFL licensed, so they may be bundled in `assets/fonts/` as woff2 or loaded from Google Fonts:

| Role | Font | Use |
|---|---|---|
| Display | Baloo 2 | Headings, buttons. Rounded terminals read as yarn. |
| Body | Nunito | Paragraphs, labels. Soft but legible at small sizes. |

A cursive yarn-strand accent face was trialed and cut as overkill; if a project insists on one, treat it as decoration only, never functional text.

Self-hosting recipe:

```css
@font-face {
  font-family: "Baloo 2";
  src: url("./fonts/baloo2-variable.woff2") format("woff2");
  font-weight: 400 800;
  font-display: swap;
}
```

## Never hard-code a color in markup

Every `--c` and `--t` on an element must be a token (`var(--rose)`, `var(--thread-leaf)`, or a `color-mix()` of tokens), never a raw hex value, and never a hard-coded `color:` override on the element itself. `.felt` and `.knit` already set `color: var(--ink)`; let it inherit. The reason is not tidiness: a raw hex frozen into markup does not flip when night mode swaps the tokens, so it silently drifts out of contrast with the surface around it. If an element looks wrong at night, the fix is always to move its color onto a token, never to special-case the night value.
