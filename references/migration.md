# Woolwork Migration and Self-Update

Woolwork is versioned so that an agent invoking this skill on an existing project can detect drift and bring the project up to date.

## Version detection procedure (run on every invocation against an existing project)

1. Find the project's Woolwork CSS (search for `--ww-version` in the codebase).
2. Read the value. Compare against this skill's version in `SKILL.md` frontmatter.
3. If the project is older, walk the changelog below from the project's version forward, applying each migration.
4. After migrating, update the project's `--ww-version` token and replace `woolwork.css` / `woolwork.js` with this skill's copies from `assets/`, then re-apply any project-local token overrides (dye colors, fonts). Token overrides live in the project's own stylesheet, never inside the kit files, precisely so kit replacement is safe.
5. If the project has no `--ww-version`, it hand-copied fragments before adoption. Audit it against the full dictionary in `references/dictionary.md` and install the current kit.

## Changelog

### 1.0.0 (current)

Initial release. No migrations exist yet; every entry added here in the future must include a class rename table, removed patterns, and step-by-step migration instructions.

Decisions locked at 1.0.0 that future versions must not silently reverse:

- Press feedback is a translate settle plus a deepened shadow. No scaling, and no continuous pointer-tracked deformation of any kind; that was tried, cut, and must not return under a new name.
- Reveals are visual only and never affect layout or scroll height.
- Turbulence is baked into tiles at build time of the kit, never applied as a runtime filter.

## Forward-compatibility rules for future versions

- Never repurpose a class name for a different visual; retire names instead.
- Token names are append-only within a major version.
- Any removal or rename is a major version bump and must include a migration table here.
