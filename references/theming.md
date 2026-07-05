# Woolwork Theming

Everything in Woolwork is dyed from tokens. Never hard-code a felt color into a component. Change the tokens and the whole craft table re-dyes itself, including shadows, stitches, and knit tiles.

## Core tokens

Defined on `:root` in `woolwork.css`:

```css
:root {
  --ww-version: "1.1.0";

  /* Board (the work surface behind everything) */
  --board: #e3ddd0;

  /* Dyed wool palette */
  --cream: #f6efdf; --rose: #e2707e; --butter: #f0c05a;
  --leaf: #7fae6a;  --sky: #6fa8c9;  --plum: #9a7bb0;

  /* Thread partners: stitches and accents on the matching felt */
  --thread-cream: #bfa886; --thread-rose: #a94856; --thread-butter: #b08428;
  --thread-leaf: #4f7a3e;  --thread-sky: #3f728f;  --thread-plum: #6b5180;

  /* Ink, cocoa thread, and the paper accent */
  --cocoa: #7a5c49; --ink: #463527; --ink-soft: #7d6a56; --paper: #fbf6ea;

  /* One top-left light: the highlight/occlusion pair every shadow uses */
  --hi: rgba(255,252,242,.38); --lo: rgba(64,44,32,.22);

  /* Motion and type */
  --spring: linear(0,.32 8%,.84 19%,1.055 30%,1.014 43%,.986 56%,1.003 73%,1);
  --font-display: "Baloo 2", ui-rounded, sans-serif;
  --font-body: "Nunito", ui-rounded, system-ui, sans-serif;
}
```

Components derive from these. For example `.sewn-button` shades its rim with `color-mix(in srgb, var(--c) 62%, black)`, so a re-dyed button stays consistent.

## Dyeing from a brand color

When porting an existing site, do not invent a palette. Dye the wool with the brand by overriding the felt slot closest to it and that slot's thread partner:

```css
:root {
  --brand: #4f6df5;                    /* the site's existing primary */
  --sky: color-mix(in oklch, var(--brand) 60%, var(--cream));
  --thread-sky: color-mix(in oklch, var(--brand) 45%, var(--cocoa));
}
```

Rules of dyeing:

1. Desaturate and warm. Pure digital hues (#ff0000, #4f6df5) look like plastic, not wool. Mix at least 20 to 30 percent cream or thread into every brand color.
2. Keep contrast in the thread, not the felt. Text sits on stitches and labels; felt patches can be close in value to the board because the stitch outline separates them.
3. Never exceed roughly 6 felt colors per page. Real craft projects use a small basket of yarn.

## Per-component dye

Most components read a local `--c` (surface color) and `--t` (thread/text color):

```html
<button class="btn-patch" style="--c: var(--rose); --t: var(--thread-rose)">Order</button>
<div class="felt card" style="--c: var(--leaf); --t: var(--thread-leaf)">...</div>
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
