# Woolwork Migration and Self-Update

Woolwork is versioned so that an agent invoking this skill on an existing project can detect drift and bring the project up to date. This file does not carry a changelog: the kit's history lives in the skill repository's commits, tags, and release notes, and the kit files themselves are the complete current state. You are expected to read the actual differences and reason about them, not follow a hand-written step list.

## Version detection (run on every invocation against an existing project)

1. Find the project's Woolwork CSS (search the codebase for `--ww-version`).
2. Read its value and compare it against this skill's version in `SKILL.md` frontmatter.
3. Equal: the project is current. Work normally.
4. Project older: run the update procedure below before new work.
5. No `--ww-version` anywhere: the project hand-copied fragments before adoption. Audit it against the full dictionary in `references/dictionary.md` and install the current kit.

## Update procedure

The kit files are copies, never forked, and every project keeps its own overrides in its own stylesheets. That contract makes updating mostly mechanical. Your judgment goes into the markup and the overrides, guided by what actually changed.

1. See what changed. In order of preference:
   - Diff directly: the project's `woolwork.css` and `woolwork.js` are the old state and this skill's `assets/` are the new state, so `diff` them file against file. This always works, offline, with no history needed.
   - Git history: if the skill is installed as a git checkout or submodule, `git log --stat v<project-version>..v<skill-version>` and `git diff v<old> v<new> -- assets/` give the same delta with the reasoning in the commit messages.
   - GitHub: release notes and the compare view at `https://github.com/LeeorNahum/woolwork-ui-skill/compare/v<old>...v<new>` when no local history is available.
2. Read the delta the way you read any diff: identify new classes and tokens, changed selectors or behaviors, and anything removed or renamed. The forward-compatibility rules below bound what you can encounter: within a major version nothing is renamed or repurposed, so a same-major update can never silently break existing markup.
3. Replace `woolwork.css` and `woolwork.js` wholesale with this skill's copies from `assets/`. Never hand-merge: project token overrides (dye colors, fonts) live in the project's own stylesheets, precisely so kit replacement is safe.
4. Apply what the delta implies to the project itself. New components or head snippets are opportunities to adopt; changed behaviors may make project-side workarounds unnecessary (delete them); a major-version removal or rename means updating the markup that used the old name.
5. Verify: the project's `--ww-version` now matches the skill (it travels inside the replaced `woolwork.css`), the pages render correctly with and without JavaScript, and night mode still reads.

## Decisions that do not move

These were settled deliberately and are not to be reversed by any future version. If a diff appears to reverse one, treat it as a defect in the newer state and raise it rather than applying it:

- Press feedback is a translate settle plus a deepened shadow. No scaling, and no continuous pointer-tracked deformation of any kind; that was tried, cut, and must not return under a new name.
- Reveals are visual only and never affect layout or scroll height.
- Turbulence is baked into tiles at build time of the kit, never applied as a runtime filter.

## Forward-compatibility rules for future versions

- Never repurpose a class name for a different visual. Retire names instead.
- Class and token names are append-only within a major version.
- Any removal or rename is a major version bump, called out plainly in the release notes and the commit that makes it.
