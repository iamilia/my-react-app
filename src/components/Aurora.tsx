/**
 * The ambient wash behind every page: three heavily blurred blobs drifting
 * on long, mismatched cycles. All of the work happens in CSS (see `.aurora`
 * in style.css) — this component exists only to put the layer in the tree
 * once, at the root, rather than per page.
 *
 * `aria-hidden` because there is nothing here to announce, and `z-index: -1`
 * with `pointer-events: none` so it never intercepts a click. Sections that
 * want to sit on top of it simply have a background; the ones that don't
 * (the hero, the gaps between bands) let it through.
 */
export const Aurora = () => (
    <div className="aurora" aria-hidden="true">
        <div className="aurora-blob aurora-1" />
        <div className="aurora-blob aurora-2" />
        <div className="aurora-blob aurora-3" />
    </div>
);
