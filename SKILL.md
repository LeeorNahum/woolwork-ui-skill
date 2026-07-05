---
name: "woolwork-ui"
description: "Apply the Woolwork design language to any web UI: a physically believable wool, felt, and yarn world with sewn attachments and place-then-stitch choreography. Use when building a new site or component in a wool, felt, yarn, knit, craft, cozy, or handmade aesthetic, when porting an existing site into that look, or when editing any project that already contains woolwork.css."
metadata:
  author: "Leeor Nahum"
  version: "1.0.0"
---

# Woolwork UI

Woolwork turns web interfaces into a believable craft table: every element is a wool, felt, or yarn object, attached to a burlap board. The look descends from the craft-world platformers, whose realism came from real fabric imagery and whose interactions were the materials themselves (buttons pull, zippers unzip terrain, checkboxes get sewn shut). Woolwork ports that philosophy to CSS and small progressive JS.

## The five laws

Every element must obey all five. When a design question has no obvious answer, the laws decide it.

1. One top-left light. Highlight on top edges, occlusion below, short contact shadows. Never mix light directions.
2. Nothing flat. Every surface carries fiber grain and visible thickness. Colors are dyed wool, heathered by texture, never a flat fill.
3. Nothing straight. Hand-cut edges: irregular corner radii, slightly drifting stitch rows. Perfect geometry reads as plastic.
4. Everything attached. Sewn, buttoned, snapped, pinned, zipped, or pocketed. If you cannot name how an element is held to the board, redesign it.
5. Everything soft. State changes settle with spring overshoot and never hard-stop: a button eases down and back, a stitch draws on with give, a checkbox's cross sews in rather than snapping into place. Motion is a property of the material, never a decoration on top of it.

## Applying the system

1. Copy `assets/woolwork.css` and `assets/woolwork.js` into the project and load them once (stylesheet in the document head or root layout, script at the end of body or in a client-side entry). Load the two fonts (Baloo 2 and Nunito) from Google Fonts or self-host them per `references/theming.md`; the kit falls back to system rounded faces without them, but the intended look needs them. `assets/starter.html` is a minimal working page to copy from.
2. Put `class="board"` on `body`.
3. Map every UI element to its craft counterpart using `references/dictionary.md`. Keep the information architecture unchanged: Woolwork changes material, attachment, and motion, never structure or content.
4. Add `sew` (plus `stitch` where sewn) to elements that should arrive with the place-then-stitch reveal.
5. Dye to the project's palette per `references/theming.md`. Never invent one-off colors; derive them from tokens.

## Non-negotiables

- Per-frame animation uses transform and opacity only. Filters, borders, and path data never animate continuously.
- Textures render once, as the kit's baked tiles. Do not add runtime-filtered turbulence.
- Press feedback never scales text-bearing elements; the kit's translate-plus-shadow settle exists so labels and stitches stay stable. Do not reintroduce squash scaling on buttons.
- Every `--c` and `--t` on an element is a token, never a raw hex value, and text color always inherits from `.felt`/`.knit` rather than being hard-coded. This is what lets night mode and re-dyeing work without per-element fixes.
- Reveal choreography is visual only. Content must exist immediately for scroll height, selection, find-in-page, and no-JS rendering.
- Wool first. Felt, yarn, and knit carry the identity; paper appears only as small accents (tags, pinned notes) where wool has no answer.
- Keep the accessibility floor: visible dashed focus rings, real form controls under the styling, `prefers-reduced-motion` honored (the kit does this; do not strip it).

## Reference Loading

- Read `references/dictionary.md` before styling or porting any component; it maps every UI element to its craft object, class, and behavior.
- Read `references/motion.md` when touching interaction, animation, or reveals, or before adding any new motion.
- Read `references/theming.md` when dyeing to a brand palette, adding dark mode, or choosing type.
- Read `references/frameworks.md` when integrating with a framework, bundler, Tailwind, or a rendering mode decision (SSR, SSG, SPA).
- Read `references/migration.md` first whenever the target project already contains `woolwork.css`; compare its `--ww-version` token to this skill's assets and apply the listed migrations before new work.

## Porting an existing site

Keep the page's structure, copy, and flows exactly. Then: board on body, dictionary mapping per element type, dye tokens from the site's existing brand colors, `sew` on cards and sections. A ported page should be recognizably the same product wearing wool.
