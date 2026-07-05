# Woolwork Migration and Self-Update

Woolwork is versioned so that an agent invoking this skill on an existing project can detect drift and bring the project up to date.

## Version detection procedure (run on every invocation against an existing project)

1. Find the project's Woolwork CSS (search for `--ww-version` in the codebase).
2. Read the value. Compare against this skill's version in `SKILL.md` frontmatter.
3. If the project is older, walk the changelog below from the project's version forward, applying each migration.
4. After migrating, update the project's `--ww-version` token and replace `woolwork.css` / `woolwork.js` with this skill's copies from `assets/`, then re-apply any project-local token overrides (dye colors, fonts). Token overrides live in the project's own stylesheet, never inside the kit files, precisely so kit replacement is safe.
5. If the project has no `--ww-version`, it hand-copied fragments before adoption. Audit it against the full dictionary in `references/dictionary.md` and install the current kit.

## Changelog

### 1.1.0 (current)

Fixes and additions; no class renames or removals. Migration is a wholesale replacement of `woolwork.css` and `woolwork.js` from `assets/`, plus the markup and head checks below.

- Revealed `.sew` elements now settle to `translate: none; rotate: none` instead of zero values. A zero transform kept a permanent stacking context on every revealed card, which painted open dropdown flaps and tooltips underneath later sibling cards. No project action needed beyond replacing the kit files.
- `dialog.pinned` now carries the felt material itself and animates directly on `[open]`. Previously the kit styled an inner `.patch` element that was never documented or defined, so pinned modals rendered with a transparent background and no drop-in animation. Check each `dialog.pinned` in the project: content may sit directly inside the dialog; if an inner wrapper div exists only to be the patch, remove it. Dye with `--c` on the dialog as with any felt.
- `.buttonhole` and `.strands` are now handled by delegated listeners like every other behavior, so instances added after load work. Remove any project-side re-initialization that existed to work around this.
- New `.pompom` decorative component and `.embroider` display-heading treatment; see `references/dictionary.md`.
- Tooltip bubbles and their threads now carry an explicit z-index so they cannot slip under adjacent patches.
- Felt, knit, and patch buttons transition `background-color` over 0.4s so the night flip reads as one lamp dimming rather than surfaces snapping one by one.
- New recommended head snippet (`assets/starter.html`): a one-line inline script that adds `ww-js` before first paint, eliminating the visible flash of content that could appear before reveals armed on slow paints. Add it right after the stylesheet link in projects using `.sew`.

### 1.0.0

Initial release.

Decisions locked at 1.0.0 that future versions must not silently reverse:

- Press feedback is a translate settle plus a deepened shadow. No scaling, and no continuous pointer-tracked deformation of any kind; that was tried, cut, and must not return under a new name.
- Reveals are visual only and never affect layout or scroll height.
- Turbulence is baked into tiles at build time of the kit, never applied as a runtime filter.

## Forward-compatibility rules for future versions

- Never repurpose a class name for a different visual; retire names instead.
- Token names are append-only within a major version.
- Any removal or rename is a major version bump and must include a migration table here.
