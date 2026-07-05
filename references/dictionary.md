# Woolwork Transformation Dictionary

Every UI element maps to a craft object. This is the complete mapping; if an element type is not listed, derive it from the closest listed pattern using the same logic (name the material, name the attachment, name the press behavior). Classes listed here exist in `assets/woolwork.css`; recipes without a class are composition instructions using existing classes.

## Surfaces and structure

| UI element | Craft object | How |
|---|---|---|
| Page background | The burlap work board | `body.board` |
| Card, panel, section | A felt patch sewn to the board | `.felt` (`.deep` for heavier lift), add `.stitch` for the sewn border, `.sew` for the arrival reveal |
| Alternate surface | A knitted patch (stockinette) | `.knit`, same modifiers as `.felt` |
| Hero | A large deep felt patch | `.felt.deep.stitch` |
| Divider | A seam: a running stitch over a pressed crease | `<hr class="seam">` |
| Sidebar, drawer | A larger felt panel pinned along one edge | Compose: `.felt.deep` fixed to an edge; open/close is a translate transition; pin corners with `.safety-pin` |
| Footer | A folded hem: a slightly darker felt band | `.felt` dyed toward the board color, no stitch |
| Image, media | A photo mounted on a stitched felt frame | `figure.photo` with `img` and optional `figcaption` |
| Skeleton / loading placeholder | Basting: pale fabric held by loose temporary stitches | `.basting` (gently pulses; static under reduced motion) |
| Empty state | A bare patch with a single tag explaining what will live there | Compose: `.felt` + `.tag` + muted `--ink-soft` text |
| Decorative accent | A pompom of tied-off yarn | `.pompom` (dye with `--c`, resize with width/height; decoration only, never a control) |

## Buttons and actions

| UI element | Craft object | How |
|---|---|---|
| Button (any action) | A felt patch stitched to the board; pressing settles it 1.5px with a deepened shadow | `.btn-patch` (dye with `--c`/`--t`) |
| Icon button | A round four-hole sewn button | `.sewn-button` |
| Button group / segmented control | Patches sharing one stitch line | Compose: `.btn-patch` row with reduced gap; the active one uses the pressed-in shadow of `.pages [aria-current]` |
| Link | A strand of thread couched under the text | `a.thread-link` (visited links show a straight backstitch) |
| Floating action button | A larger sewn button pinned above the board | `.sewn-button` sized up, `position:fixed` |

## Forms

| UI element | Craft object | How |
|---|---|---|
| Text input | A pocket: a slit cut into the felt, contents tucked inside | `input.pocket` |
| Textarea | A deeper pocket | `textarea.pocket` |
| Select | A pocket with a thread pull marking the opening | `select.pocket` |
| Checkbox | A four-hole button cross-stitched when checked, one thread stroke per press phase | `input.sew-check` |
| Radio | A snap fastener; checking snaps the stud in, only one per group | `input.snap-radio` |
| Switch / toggle | A buttonhole; the knob is a small sewn button sliding through it | `button.buttonhole[aria-pressed]` with `.knob` |
| Slider / range | A yarn-ball bead riding a stitched channel | `input.bead-slider` |
| Progress (determinate) | Yarn knitting across a channel, ending in its remaining ball | `.spool` with `.fill` and `--p` |
| Progress (indeterminate) / spinner | A ball of yarn winding | `.spinner` |
| File upload | A labeled pocket flap: the button chooses, the pocket shows the filename | Compose: `label.btn-patch` wrapping a visually hidden `input[type=file]`, filename in a `.pocket`-styled readonly input |
| Search | A pocket with a magnifier replaced by a spool icon or plain placeholder | `input.pocket[type=search]` |
| Field label | Plain ink text above the pocket | Default text; keep labels outside the pocket |
| Validation error | A rose thread wrapped around the pocket plus a rose tag below | Compose: pocket with `--t: var(--thread-rose)` focus ring colors and a `.chip` dyed rose |
| Fieldset | A stitched felt patch grouping its controls | `.felt.stitch` with a `legend` styled as a `.tag` |

## Navigation

| UI element | Craft object | How |
|---|---|---|
| Navbar | A felt band across the top of the board | Compose: `.felt` full-width bar, brand text, `a.thread-link` items |
| Tabs | Felt folder tabs stitched onto a shared panel; the open one lifts | `.tabs > button[aria-controls]` with `.tab-panel` targets (kit JS wires selection) |
| Breadcrumbs | Small tags strung on one thread | `ul.crumbs` with `a`/`span`, current item carries `aria-current` |
| Pagination | A row of small patches; the current page is pressed in | `ul.pages`, current carries `aria-current` |
| Dropdown menu | A fabric flap that unfolds | `details.flap` with `.panel` |
| Hamburger | Three strands of yarn that pull into a cross | `button.strands` with three `.yarn` children |
| Stepper / wizard | Beads strung on a yarn line, filled up to the current step | Compose: `.yarn` track with `.sewn-button` sized dots; completed ones dyed, current pressed in |
| Skip link | A thread-link that appears on focus | `a.thread-link` positioned off-screen until `:focus` |

## Overlays and feedback

| UI element | Craft object | How |
|---|---|---|
| Modal | A note pinned over the board with safety pins | `dialog.pinned` (native `showModal()`) |
| Drawer / sheet | A felt panel sliding in from an edge | Compose: `dialog.pinned` positioned to an edge, translate transition |
| Tooltip | A paper tag tied on with thread | `[data-tip]` attribute |
| Popover | A small flap panel | `details.flap` or a positioned `.felt.stitch` |
| Toast / snackbar | A patch tossed onto the corner of the board | `woolwork.toast(message)` |
| Alert / banner | A fabric strip pinned to the board | `.notice`, dye by severity (`--c: var(--rose)` for errors, butter for warnings, leaf for success) |
| Badge | A tiny felt chip | `.chip`, dye by meaning |
| Tag / label | A woven clothing label tacked at both ends | `.tag` |
| Avatar | A round patch with a whipstitched rim | `.avatar` (initials or an `img`) |

## Content

| UI element | Craft object | How |
|---|---|---|
| Headings | Display face from the kit typography | `h1`-`h3` and `.display` get `--font-display` automatically |
| Display heading emphasis | Embroidered lettering, thread raised off the felt | `.embroider` on the heading |
| Body text | Ink on felt | Default; always from `--ink`/`--ink-soft` |
| Blockquote | Fabric with a yarn selvedge along its left edge | `blockquote.selvedge` |
| Inline code | A woven pattern label | `code.pattern` |
| Keyboard key | A small raised button square | `kbd.pattern` |
| Code block | A pattern sheet: lined paper accent | `pre.pattern` (paper is an accent material; keep it small) |
| Unordered list | French-knot bullets | `ul.knots` |
| Ordered list | Default numerals in ink | Native `ol`; do not decorate numbers |
| Table | A quilt: woven header band, rows parted by dashed seams | `table.quilt` |
| Definition list / key-value | Tag for the term, plain ink for the value | Compose: `dt` as `.tag`, `dd` default |
| Timeline | A yarn strand with knot events | Compose: vertical `.yarn` with `ul.knots` entries |
| Text selection | Dyed plum | Kit `::selection` (automatic) |
| Scrollbar | A yarn thumb in a board channel | Kit scrollbar styling on `body.board` (automatic) |

## Motion and state (applies across all of the above)

| Behavior | Craft equivalent | How |
|---|---|---|
| Press feedback | A 1.5px settle and a deepened shadow, never a scale | Built into `.btn-patch`, `.sewn-button`, `.sew-check`, `.snap-radio` |
| Entrance | Place, then stitch | `.sew` (settle) plus `.stitch` (thread draws, dashes fade in) |
| Selected / checked | Sewn down (cross-stitch, snap, or pressed-in) | Component-specific, listed above |
| Disabled | Faded dye, no press | `[disabled]` styling; never remove the element's texture |
| Focus | A dashed thread ring | Kit `:focus-visible` styling (automatic) |
| Dark mode | The same room with the lamp low | `[data-theme="night"]` on `html`; see `theming.md` |
