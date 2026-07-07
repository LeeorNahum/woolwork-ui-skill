# Woolwork motion

All motion expresses one idea: the interface is soft. Springs, settles, and give; never linear easing, never a hard stop, never a continuous effect that decorates rather than acts.

## What motion is not

A continuous pointer-tracked deformation (a dent or tilt that follows the cursor across a surface) was built and cut. It read as an illusion layered on top of the object rather than a property of the object itself, and it is not to be reintroduced under any name. Motion in this system only ever accompanies a real state change: a press, a check, an open, an arrival. Nothing animates just because the pointer is nearby.

## Press feedback on buttons and sewn controls

Never scale a text-bearing element on press. Scaling re-rasterizes text and makes dashed stitches crawl. The kit's pattern is a 1.5px translate settle plus a deepened inset shadow, so a press reads as the patch sinking very slightly into the board and popping back, not as the button shrinking.

## Sew-check strokes

The checkbox (`.sew-check`) is a four-hole button that gets cross-stitched when checked. The X is sewn in two thread strokes tied to the press phases: pointer down draws the first stroke, from one hole to the diagonally opposite hole (about 130ms), pointer up draws the second and the box is checked. Unchecking unpicks in reverse: pointer down removes the second stroke, pointer up removes the first. Each stroke is a pseudo-element anchored at one hole's exact pixel position, rotated to the opposite hole, and grown with `scaleX` from that anchor, so the endpoints always land in the holes regardless of theme or dye. The kit implements the press phase with a `.pre` class set on pointerdown; keyboard and label activation play both strokes in quick sequence via transition delays. Native checkbox semantics are untouched.

## Place, then stitch (reveal choreography)

Elements with `.sew` settle onto the board when scrolled into view (opacity, a small translate, a third of a degree of rotation). If the element also has `.stitch`, the running stitch then sews on around the edge: the same dashed outline the element keeps afterward, appearing segment by segment from the top-left corner over roughly 1.25 seconds, starting just after the settle. The kit measures the element, rebuilds the dashed border's exact geometry (inset, all four hand-cut corner radii, stroke centerline) as a temporary SVG, and reveals it behind an animated mask, so the drawn thread coincides with the final stitch and the handoff is invisible.

Rules:

- Reveals are visual only: content exists immediately, page height never changes, selection and find-in-page work from the first frame, and the page is fully correct with JavaScript disabled.
- Reveals run once per element per page load and remove their scaffolding afterward. This is intentional: the choreography represents the patch being placed on the board, an arrival, not a loop. A genuine full-page reload always replays it, since nothing persists across navigations; if a host environment restores a page from back-forward cache without re-running scripts, treat that the same as a fresh load rather than leaving elements in their revealed-but-unobserved state.
- Stagger by DOM order comes free from the IntersectionObserver; do not add artificial delays beyond roughly 0.4s total per viewport. Use the `--sew-delay` custom property for hand-placed staggers within a single group (a grid of cards, a row of chips).
- The settled state of a revealed element is `translate: none; rotate: none`, never a zero value. A zero transform still creates a stacking context, which permanently traps dropdown panels and tooltips inside the card under later sibling cards. Keep that invariant in any change to the reveal styles.
- Add the one-line `ww-js` snippet to the document head (see `assets/starter.html`) so the pre-reveal hidden state applies before first paint. Without it, a slow first paint can show content, hide it, then reveal it, which reads as a glitch rather than an arrival. Pair it with the starter's `onerror` disarm on the kit script tag so a failed script load cannot leave content hidden.

## Spring vocabulary

- Settle (cards, toasts, modals): the kit's `--spring` easing, 0.45 to 0.65s.
- Fastening (checkbox cross, toggle knob, snap radio): same spring, 0.5s.
- Micro press: 0.08 to 0.13s ease-out down, spring back up.
- Continuous ambient motion is rare and slow (a spinner winding, a basting pulse); at most a small handful of such elements should ever be visible at once, and both stop under `prefers-reduced-motion`.

## Gotchas

- Only transform and opacity animate per frame. Never transition `filter`, `border`, `box-shadow` in a loop (single-shot hover shadow transitions are fine).
- `details.flap` panels must stay absolutely positioned; converting them to in-flow will reflow the page on open.
- Keep toasts and modals outside component containers; the kit appends toasts to body and uses the native dialog top layer for modals.
- Stitched elements are positioned by the kit so their stitch always traces their own box. Overlays (dropdown panels, open flaps) carry explicit z-index above sibling cards; never wrap an overlay's ancestor in a new stacking context (isolation, transform, filter) or the overlay will paint beneath later siblings.
- Respect the kit's `prefers-reduced-motion` block; add any new animation inside the same guard discipline.
- One Tier 3 simulation (canvas or WebGPU cloth hero) per viewport at most, feature-detected, paused off-screen. See `frameworks.md` for the WebGPU posture.
