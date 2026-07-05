# AGENTS.md

Maintenance contract for editing the `woolwork-ui` skill itself. Guidance for *applying* Woolwork to a project lives in `SKILL.md` and `references/`; none of it belongs here, and none of this belongs there.

## File roles

- `SKILL.md`: user-facing usage only. The five laws, the application procedure, the non-negotiables, and the reference-loading routes. Keep it under 100 lines.
- `references/dictionary.md`: the element-to-craft mapping. Every kit component must have a row here; every row must correspond to a real class in the kit.
- `references/motion.md`: interaction and animation rules, including the reveal choreography and press feedback.
- `references/theming.md`: tokens, dyeing, night theme, fonts.
- `references/frameworks.md`: integration postures per rendering mode and toolchain.
- `references/migration.md`: version-detection procedure and the changelog. Every breaking change lands here in the same edit that makes it.
- `assets/woolwork.css`, `assets/woolwork.js`: the kit. Single source of truth; projects copy these verbatim.
- `assets/starter.html`: minimal copyable page. Must stay runnable against the current kit.
- `README.md`: human skim layer. Extremely concise; never a second SKILL.md.

## Editing rules

- Kit and docs move together. A class added, renamed, or removed in the kit is updated in `dictionary.md`, demoed if user-visible, and logged in `migration.md` within the same edit.
- Class and token names are append-only within a major version. Never repurpose a name for a different visual; retire it and log the retirement.
- Project token overrides live in project stylesheets, never inside the kit files. Do not add project-specific values to `assets/`.
- The kit's `--ww-version` token, the JS header comment, `SKILL.md` frontmatter `metadata.version`, and the README version mention must always agree. Bump them together, immediately, per semver: patch for wording and fixes, minor for new components or guidance, major for renames, removals, or changed behavior.
- Calibrate bumps against the last released state, not per editing pass. Multiple passes before a release collapse into one honest bump.
- Preserve distinctive wording that carries the system's intent (the five laws, "place, then stitch", "dye, never paint"). Do not flatten it into generic design-system language.

## Hard rules the kit encodes (never undo them)

- No `transform: scale()` on pressed elements containing text or stitches.
- No continuous pointer-tracked deformation (tilt, dent-follows-cursor, or any element-follows-mouse effect). This was tried and cut: it read as an illusion rather than a real object, and it is not to be reintroduced under any name.
- Per-frame animation is limited to transform, opacity, and registered custom properties driving them.
- No hard-coded hex color or `color:` override in markup; every dye is a token so re-dyeing and night mode work without per-element fixes.
- All turbulence is baked into data-URI tiles; no runtime SVG filters.
- Reveals never affect layout, scroll height, selection, or no-JS rendering.
- `prefers-reduced-motion` guards stay intact.

## Finishing checks before any release

1. `node --check assets/woolwork.js` passes.
2. Grep the whole skill tree for em dashes; there must be none.
3. Every file named in `SKILL.md` exists and has a direct loading condition.
4. `assets/starter.html` opens correctly against the current kit.
5. All four version mentions agree.
