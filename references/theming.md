# Woolwork Theming

Everything in Woolwork is dyed from tokens. Never hard-code a felt color into a component. Change the tokens and the whole craft table re-dyes itself, including shadows, stitches, and knit tiles.

## Core tokens

Defined on `:root` in `woolwork.css`:

```css
:root {
  --ww-version: "2.0.1";

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

Components derive from these. For example `.btn-patch` derives its highlights, shadows, and thread from `--c` and `--t`, so a re-dyed button stays consistent.

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
2. Keep contrast in the thread, not the felt. Text sits on stitches and labels. Felt patches can be close in value to the board because the stitch outline separates them.
3. Never exceed roughly 6 felt colors per page. Real craft projects use a small basket of yarn.

## Per-component dye

Most components read a local `--c` (surface color) and `--t` (thread/text color):

```html
<button class="btn-patch" style="--c: var(--rose); --t: var(--thread-rose)">Order</button>
<div class="felt card" style="--c: var(--leaf); --t: var(--thread-leaf)">...</div>
```

This is the entire theming API for one-off variation. No modifier class explosion.

## Label ink follows the dye

Text on a dyed surface is thread, and thread is chosen against the fabric: the kit derives each surface's label ink from its own `--c` (in browsers with relative color syntax; others keep the inherited `--ink`). Pale dyes such as cream and butter carry near-ink dark lettering. Deep dyes such as rose, leaf, sky, and plum carry near-cream light lettering, and both are re-tinted with the felt's own hue so they still read as dyed fiber. Components whose visible background is a mix (unselected folder tabs, breadcrumbs, the quilt header band) judge against that mix via `--wool-surface`, not the raw dye. Knit and label-bearing patches also get a one-pixel lift shadow in the opposite tone, so lettering separates from the fiber texture.

Because the choice is derived, re-dyeing and night mode need no per-element fixes: darken a felt past the threshold and its labels flip to light thread by themselves. To overrule the choice on one element, set `--label` to a token (`--label: var(--ink)`); never a raw hex.

## Night theme

Night is a token override, not a rewrite. Wool at night reads as deeper dye plus a dimmer lamp:

```css
[data-theme="night"] {
  --board: #332e42; --paper: #544b66;
  --cream: #524a63;  --rose: #9d4858;  --butter: #b8934a;
  --leaf:  #527840;  --sky:  #426f88;  --plum:   #705386;
  --thread-cream: #9c92b5; --thread-rose: #f2b2bd; --thread-butter: #ecd096;
  --thread-leaf: #bcd8a8;  --thread-sky: #aed2e8;  --thread-plum: #d4bfe6;
  --cocoa: #cfc2b2; --ink: #f2ecdf; --ink-soft: #c3b8d4;
  --hi: rgba(220,215,255,.14); --lo: rgba(10,6,20,.5);
}
```

The rules of the flip: every felt deepens (same hue, lower lightness and chroma), every thread lightens so stitches keep contrast against the darker felt they sit on, and the highlight/occlusion pair dims because the lamp is lower. Label ink is derived from each surface's dye (see above), so dyed components re-choose their lettering automatically when the felts deepen. Plain text on the board reads `--ink`. If text is unreadable in night mode, it was hard-coded, and the fix is to move it onto a token, never to patch the night value.

Toggle with `woolwork.night()`. Night mode writes `theme=night` into the current URL, removes it when returning to day mode, and carries it into same-origin links so navigation preserves the chosen room. A page opened directly with `?theme=night` restores the dark dye. Use the starter's inline head snippet so that URL state applies before the body paints. Theme controls may opt into synchronized labels and `aria-pressed` with `data-woolwork-theme-toggle`, plus optional `data-night-label` and `data-day-label`. Shadows stay the same recipe. Darker felt under the same lamp is what makes it feel like the same room with the lights low.

## Fiber texture and the dye

The fiber grain overlays (baked feTurbulence tiles) are grayscale and applied with `soft-light` or low-opacity `multiply`, so they survive any dye. Do not tint the grain tiles. Tint the felt beneath them.

## Fonts

Two roles, both SIL OFL licensed, so they may be bundled in `assets/fonts/` as woff2 or loaded from Google Fonts:

| Role | Font | Use |
|---|---|---|
| Display | Baloo 2 | Headings, buttons. Rounded terminals read as yarn. |
| Body | Nunito | Paragraphs, labels. Soft but legible at small sizes. |

A cursive yarn-strand accent face was trialed and cut as overkill. If a project insists on one, treat it as decoration only, never functional text.

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

Every `--c` and `--t` on an element must be a token (`var(--rose)`, `var(--thread-leaf)`, or a `color-mix()` of tokens), never a raw hex value, and never a hard-coded `color:` override on the element itself. `.felt` and `.knit` already set `color: var(--ink)`. Let it inherit. The reason is not tidiness: a raw hex frozen into markup does not flip when night mode swaps the tokens, so it silently drifts out of contrast with the surface around it. If an element looks wrong at night, the fix is always to move its color onto a token, never to special-case the night value.
