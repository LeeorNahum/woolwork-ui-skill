# AGENTS.md

Maintenance contract for editing the `woolwork-ui` skill itself. Guidance for *applying* Woolwork to a project lives in `SKILL.md` and `references/`; none of it belongs here, and none of this belongs there.

## File roles

- `SKILL.md`: user-facing usage only. The five laws, the application procedure, the non-negotiables, and the reference-loading routes. Keep it under 100 lines.
- `references/dictionary.md`: the element-to-craft mapping. Every kit component must have a row here; every row must correspond to a real class in the kit.
- `references/motion.md`: interaction and animation rules, including the reveal choreography and press feedback.
- `references/theming.md`: tokens, dyeing, night theme, fonts.
- `references/frameworks.md`: integration postures per rendering mode and toolchain.
- `references/migration.md`: version-detection and the diff-driven update procedure, plus the locked decisions and forward-compatibility rules. It carries no changelog: history lives in commits, tags, and release notes, and an updating agent reads the actual delta between versions.
- `assets/woolwork.css`, `assets/woolwork.js`: the kit. Single source of truth; projects copy these verbatim.
- `assets/starter.html`: minimal copyable page. Must stay runnable against the current kit.
- `README.md`: human skim layer. Extremely concise; never a second SKILL.md.

## Editing rules

- Kit and docs move together. A class added, renamed, or removed in the kit is updated in `dictionary.md` and demoed if user-visible within the same edit. Commits and release notes are the changelog: every kit-changing commit says plainly what changed and why, because updating agents read that history in place of a hand-written migration list.
- Class and token names are append-only within a major version. Never repurpose a name for a different visual; retire it and log the retirement.
- Project token overrides live in project stylesheets, never inside the kit files. Do not add project-specific values to `assets/`.
- The version surfaces must always agree: the kit's `--ww-version` token, the JS header comment, `SKILL.md` frontmatter `metadata.version`, the token example in `references/theming.md`, and on release the Git tag and GitHub release. The README carries a latest-release badge instead of a hand-written number, so it tracks automatically. Bump all hand-edited surfaces together, immediately, per semver: patch for wording and fixes, minor for new components or guidance, major for renames, removals, or changed behavior.
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

## Branches and releases

Branches are roles. `dev` is the working branch where every edit lands first; `main` is the released state and moves only at release time. Never commit work directly to `main`.

A release is a contract between the code, the tag, the packaged artifact, and every project that installs the skill. The downloadable artifact is `woolwork-ui.zip`, built and attached to a GitHub release by `.github/workflows/release.yml` when a `v*` tag is pushed. Consumers install from the latest release page, so a stale or half-made release is user-facing breakage.

Release procedure:

1. Run the finishing checks below on `dev`.
2. Inspect branch state before promoting: fetch, compare `dev` and `main` tips and ahead/behind counts, and flag anything unusual (a commit landed directly on `main`, unexpected divergence, parallel work). Resolve or surface it before continuing.
3. Read `git log v<last-tag>..dev` and confirm the version bump honestly reflects that full delta, and that the commit messages read as an adequate changelog for it (the release workflow generates the release notes from them).
4. Fast-forward merge `dev` into `main`. If fast-forward is impossible, stop and reconcile; do not force-push.
5. Tag `main` as `vX.Y.Z` matching the version surfaces, then push `main`, `dev`, and the tag.
6. Verify the workflow published the release, the zip attached, and the README badge and the latest-release link resolve to the new version.
7. Update any project that pairs with this skill per that project's own contract (a site that demos the kit re-pins its submodule and re-copies the kit files).

## Finishing checks before any release

1. `node --check assets/woolwork.js` passes.
2. Grep the whole skill tree for em dashes; there must be none.
3. Every file named in `SKILL.md` exists and has a direct loading condition.
4. `assets/starter.html` opens correctly against the current kit.
5. All version surfaces agree, including the theming reference's token example.
6. Every kit change since the last release is reflected in `references/dictionary.md` where user-visible, and the commit history since the last tag describes every kit change plainly.
