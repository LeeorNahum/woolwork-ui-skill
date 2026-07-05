# Woolwork in Frameworks

Woolwork is deliberately framework-agnostic: one CSS file of tokens plus component classes, and one small JS file that uses delegated listeners on `document`. This shape is what makes it safe everywhere.

## Why the architecture survives SSR, SSG, and SPAs

1. All visuals are CSS. Server-rendered HTML arrives already dressed in wool. There is no flash of unstyled plastic and no hydration mismatch, because the markup the server sends is identical to what the client would render.
2. All behavior is delegated. `woolwork.js` attaches a handful of listeners to `document` once. Elements added later by React, Vue, htmx, or Turbo are automatically live. No per-element setup, no teardown, no MutationObserver required for core interactions.
3. All motion is transform and opacity. Nothing in the kit animates layout, so client-side route transitions never fight it.

## Plain HTML / static sites

```html
<link rel="stylesheet" href="/woolwork/woolwork.css">
<script>document.documentElement.classList.add('ww-js')</script>
<script src="/woolwork/woolwork.js" defer></script>
```

Done. `defer` is fine; the CSS carries the first paint. The inline one-liner marks the document as script-capable before first paint so `.sew` elements never flash visible before their reveal; include it only alongside the kit script, since if the kit script never loads, sewn elements would stay hidden.

## Next.js (App Router)

- Import `woolwork.css` in the root `layout.tsx` (global CSS).
- Load the script once in a small client component, or paste the file into `app/woolwork-client.tsx` behind `"use client"` and call its init in a `useEffect` with an idempotency guard (`if (window.__ww) return`).
- Server components can emit Woolwork classes freely; there is no client dependency for appearance.
- The `.sew` reveal system uses `IntersectionObserver`, which only exists client-side; the CSS gives `.sew` elements full opacity by default and the JS opts them into the reveal, so SSR output is never invisible if JS fails. Keep this order (CSS visible by default, JS hides then reveals) if you modify the kit.
- To avoid a flash of revealed-then-hidden content on slow first paints, add the `ww-js` class before paint with an inline script rendered ahead of the page body (in Next.js, an inline `beforeInteractive` script). Never add the class in server markup itself: markup is shared with non-JS clients, and they must keep the fully visible fallback.

## Vite / SPA (React, Vue, Svelte)

- `import "./woolwork/woolwork.css"` in the entry file.
- `import "./woolwork/woolwork.js"` once in the entry file. Delegation means components mounted at any time behave correctly.
- For dialogs, use the native `<dialog class="pinned">` and call `showModal()` from your framework code; Woolwork only styles it.

## Tailwind

Two workable postures:

1. Side by side (recommended). Load `woolwork.css` after Tailwind's base. Use Tailwind for layout (flex, grid, spacing) and Woolwork classes for material (`felt`, `btn-patch`, `seam`). They do not collide; Woolwork never sets layout except inside its own components.
2. Token bridge. Map Woolwork tokens into `theme.extend.colors` so utilities like `bg-felt-rose` exist:

```js
// tailwind.config.js
theme: { extend: { colors: {
  board: "var(--board)",
  felt: { cream: "var(--felt-cream)", rose: "var(--felt-rose)", leaf: "var(--felt-leaf)" },
  thread: "var(--thread)", ink: "var(--ink)",
}}}
```

Do not try to re-express the components as utility strings; the shadow and texture recipes are too long and belong in the component classes.

## Headless component libraries (Radix, Headless UI, Ark) and shadcn/ui

This is the strongest pairing for app work. Headless libraries supply behavior (focus management, keyboard interaction, ARIA wiring) and deliberately supply no appearance, which is exactly the half Woolwork does not do. Put Woolwork classes on the rendered parts: the Radix dialog content gets `felt deep stitch`, its trigger gets `btn-patch`, a Radix checkbox can render the kit's `.sew-check` visuals on its indicator.

shadcn/ui is styled, so treat it as a donor of behavior rather than of looks: keep its component logic, replace its Tailwind visual classes with Woolwork component classes, and map Woolwork tokens over its CSS variables (`--background` to `--board`, `--card` to `--cream`, `--primary` to a felt color, `--ring` to `--thread-sky`). What you must not do is layer Woolwork on top of shadcn's own borders, rings, and shadows; two competing material systems read as noise. One material system at a time.

The general rule across all libraries: Woolwork owns material, light, and press physics; the library owns behavior and layout. Anything in a library's styling layer that expresses material (borders, shadows, radii, backgrounds) gets replaced, not augmented.

## Turbo / htmx / Astro islands

Nothing extra. Delegated listeners keep working across swapped fragments. If you tear down and rebuild `<html>` entirely (rare), re-run the init.

## React Native

Out of scope. Woolwork depends on CSS filters, blend modes, and SVG background tiles that RN does not implement. React Native Web works because it renders to real DOM.

## Tier 3 (canvas / WebGPU heroes)

The core kit is Tier 1 and 2 only. If a page earns a hero simulation (one per page maximum), isolate it:

- Render into a `<canvas>` in a leaf component; never let the sim own scroll or layout.
- Feature-detect: `navigator.gpu` for WebGPU, fall back to 2D canvas or a static image. Mobile WebGPU is still uneven in 2026.
- Pause with `IntersectionObserver` when off-screen and on `visibilitychange`.
- Respect `prefers-reduced-motion` by rendering a single static frame.

## Content Security Policy

The kit injects no inline styles requiring `unsafe-inline` beyond standard `style` attributes for `--c` dye overrides. If your CSP forbids inline style attributes, dye with utility classes instead.
