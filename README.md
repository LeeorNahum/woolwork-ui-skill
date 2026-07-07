# Woolwork UI

[![GitHub Release](https://img.shields.io/github/v/release/LeeorNahum/woolwork-ui-skill?sort=semver)](https://github.com/LeeorNahum/woolwork-ui-skill/releases/latest)

A design language that turns any web UI into a believable wool, felt, and yarn craft world, in the lineage of the great craft-material platformers. Ships as an agent skill: a compact `SKILL.md`, deep references, and a copy-in CSS/JS kit. Download the packaged skill from the [latest release](https://github.com/LeeorNahum/woolwork-ui-skill/releases/latest), or install the repo as a submodule.

## What you get

- `assets/woolwork.css`: tokens, the burlap board, felt/knit/yarn materials, and every component (patch buttons, sewn buttons, pockets, seams, zippers, flaps, pinned modals, tags, bead sliders, and more).
- `assets/woolwork.js`: place-then-stitch reveals, cross-stitch checkbox strokes, and small behaviors (tabs, toggles, dropdowns, toasts), all via delegated listeners.
- `assets/starter.html`: a minimal working page.
- `references/`: the transformation dictionary, motion bible, theming and dyeing guide, framework integration, and migration/self-update procedure.

## The five laws

1. One top-left light.
2. Nothing flat.
3. Nothing straight.
4. Everything attached.
5. Everything soft (springs, settles, never a hard stop).

## Quick start

Copy the two asset files into your project:

```html
<link rel="stylesheet" href="/woolwork/woolwork.css">
<script src="/woolwork/woolwork.js" defer></script>
<body class="board"> ... </body>
```

Then map your components using `references/dictionary.md` and dye to your palette per `references/theming.md`.

## Versioning

The kit stamps `--ww-version` into CSS. Agents invoking the skill on an existing project compare that token against the skill version and, when the project is behind, read the actual delta (diff the project's kit files against `assets/`, or the two version tags on this repo) and update from it, per `references/migration.md`.

## License

Kit code: use freely in your projects. Bundled font guidance covers SIL OFL faces (Baloo 2, Nunito).
